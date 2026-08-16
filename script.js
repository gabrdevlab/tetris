const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const holdCanvas = document.getElementById("hold");
const holdCtx = holdCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10, ROWS = 20, BLOCK = 30;
const COLORS = [null,"#00dfe8","#f2df00","#a85cff","#3eea68","#ff4e57","#4d73ff","#ffad32"];
const SHAPES = {
  I:[[1,1,1,1]], O:[[2,2],[2,2]], T:[[0,3,0],[3,3,3]],
  S:[[0,4,4],[4,4,0]], Z:[[5,5,0],[0,5,5]],
  J:[[6,0,0],[6,6,6]], L:[[0,0,7],[7,7,7]]
};
const NAMES = ["I","O","T","S","Z","J","L"];

let board, current, nextQueue, holdPiece = null, canHold = true;
let score=0, lines=0, level=1, combo=-1, bestCombo=0;
let pieces=0, singles=0, doubles=0, triples=0, tetrises=0, tspins=0, perfects=0;
let running=false, paused=false, gameOver=false, lastTime=0, dropCounter=0, dropInterval=800;
let bag=[], lastAction="", lastRotation=false, animationId=null, lineFx=[], audioCtx=null;

const defaults = {volume:.35, previewCount:3, ghost:true, sound:true, theme:"dark"};
let settings = {...defaults, ...JSON.parse(localStorage.getItem("tetrisSettings")||"{}")};
let highScore = Number(localStorage.getItem("tetrisHighScore")||0);

function createBoard(){return Array.from({length:ROWS},()=>Array(COLS).fill(0))}
function clone(m){return m.map(r=>[...r])}
function refillBag(){
  bag=[...NAMES];
  for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}
}
function nextType(){if(!bag.length) refillBag(); return bag.pop()}
function makePiece(type=nextType()){return {type,matrix:clone(SHAPES[type]),x:Math.floor(COLS/2)-Math.ceil(SHAPES[type][0].length/2),y:0,rotation:0}}
function fillQueue(){while(nextQueue.length<5)nextQueue.push(makePiece())}

function resetStats(){
  score=lines=pieces=singles=doubles=triples=tetrises=tspins=perfects=0; combo=-1; bestCombo=0;
}
function startGame(){
  board=createBoard(); bag=[]; refillBag(); nextQueue=[]; fillQueue();
  current=nextQueue.shift(); fillQueue(); holdPiece=null; canHold=true;
  resetStats(); running=true;paused=false;gameOver=false;lastAction="";lastRotation=false;
  dropCounter=0; dropInterval=800; lineFx=[]; hideOverlay("startOverlay"); hideOverlay("gameOverOverlay");
  updateUI(); drawAll(); status("Jogando"); cancelAnimationFrame(animationId); lastTime=performance.now(); animationId=requestAnimationFrame(loop);
  beep(440,.04);
}
function endGame(){
  running=false;gameOver=true;
  if(score>highScore){highScore=score;localStorage.setItem("tetrisHighScore",highScore)}
  document.getElementById("finalScore").textContent=score;
  document.getElementById("finalHighScore").textContent=highScore;
  showOverlay("gameOverOverlay");status("Game Over");beep(100,.18);
}
function pause(){
  if(!running)return;paused=!paused;
  if(paused){showMessage("Pausado","Pressione P ou o botão para continuar.");status("Pausado")}
  else{hideMessage();status("Jogando");lastTime=performance.now()}
}
function status(t){document.getElementById("statusText").textContent=t}
function showMessage(t,s){document.getElementById("messageTitle").textContent=t;document.getElementById("messageText").textContent=s;document.getElementById("boardMessage").classList.remove("hidden")}
function hideMessage(){document.getElementById("boardMessage").classList.add("hidden")}
function showOverlay(id){document.getElementById(id).classList.remove("hidden")}
function hideOverlay(id){document.getElementById(id).classList.add("hidden")}

function collide(p=current, dx=0, dy=0, matrix=p.matrix){
  for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix[y].length;x++){
    if(!matrix[y][x])continue;
    const bx=p.x+x+dx, by=p.y+y+dy;
    if(bx<0||bx>=COLS||by>=ROWS)return true;
    if(by>=0&&board[by][bx])return true;
  }
  return false;
}
function move(dx){
  if(!running||paused)return;
  if(!collide(current,dx,0)){current.x+=dx;lastAction="move";lastRotation=false;beep(260,.018)}
}
function softDrop(){
  if(!running||paused)return;
  if(!collide(current,0,1)){current.y++;score+=1;lastAction="soft";dropCounter=0}
  else lockPiece();
  updateUI();
}
function hardDrop(){
  if(!running||paused)return;
  let d=0;while(!collide(current,0,1)){current.y++;d++}
  score+=d*2;lastAction="hard";beep(180,.035);lockPiece();updateUI();
}
function rotateMatrix(m){return m[0].map((_,i)=>m.map(row=>row[i]).reverse())}
function rotate(){
  if(!running||paused)return;
  const old=clone(current.matrix), oldX=current.x, oldRot=current.rotation;
  const rotated=rotateMatrix(current.matrix); const kicks=[0,-1,1,-2,2];
  for(const k of kicks){
    current.matrix=rotated;current.x=oldX+k;
    if(!collide()){current.rotation=(oldRot+1)%4;lastAction="rotate";lastRotation=true;beep(520,.025);return}
  }
  current.matrix=old;current.x=oldX;current.rotation=oldRot;
}
function hold(){
  if(!running||paused||!canHold)return;
  const old=current.type;
  if(holdPiece===null){holdPiece=old;current=nextQueue.shift();fillQueue()}
  else{const swap=holdPiece;holdPiece=old;current=makePiece(swap)}
  canHold=false;lastAction="hold";lastRotation=false;drawAll();beep(330,.03)
}
function isTSpin(){
  if(current.type!=="T"||!lastRotation)return false;
  let filled=0;
  const cx=current.x+1,cy=current.y+1;
  for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){
    const x=cx+dx,y=cy+dy;
    if(x<0||x>=COLS||y<0||y>=ROWS||board[y][x])filled++;
  }
  return filled>=3;
}
function lockPiece(){
  const tspin=isTSpin();
  for(let y=0;y<current.matrix.length;y++)for(let x=0;x<current.matrix[y].length;x++){
    if(current.matrix[y][x]&&current.y+y>=0)board[current.y+y][current.x+x]=current.matrix[y][x];
  }
  pieces++; if(tspin)tspins++;
  const cleared=clearLines(tspin);
  scoreLock(cleared,tspin);
  if(cleared===0)combo=-1;else{combo++;bestCombo=Math.max(bestCombo,combo)}
  current=nextQueue.shift();fillQueue();canHold=true;lastAction="lock";lastRotation=false;dropCounter=0;
  if(collide(current))endGame();
}
function clearLines(tspin){
  let cleared=0;
  for(let y=ROWS-1;y>=0;y--){
    if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(0));cleared++;y--}
  }
  if(cleared){
    lineFx.push({t:0,lines:cleared});
    if(cleared===1)singles++; if(cleared===2)doubles++; if(cleared===3)triples++; if(cleared===4)tetrises++;
    if(board.every(row=>row.every(v=>!v))){perfects++;score+=1000*level;beep(880,.12)}
    beep(cleared===4?740:600,.07);
  }
  return cleared;
}
function scoreLock(cleared,tspin){
  const base=tspin?[0,800,1200,1600]:[0,100,300,500,800];
  score+=(base[cleared]||0)*level;
  if(tspin&&cleared===0)score+=400*level;
  if(combo>0)score+=50*combo*level;
  const b2b=cleared===4||tspin;
  if(b2b&&cleared)score+=Math.floor((base[cleared]||0)*.5)*level;
  lines+=cleared;level=Math.floor(lines/10)+1;
  dropInterval=Math.max(55,800-(level-1)*65);
}
function ghostY(){let y=current.y;while(!collide({...current,y},0,1))y++;return y}

function drawCell(c,x,y,v,size,alpha=1){
  if(!v)return;c.save();c.globalAlpha=alpha;c.fillStyle=COLORS[v];c.fillRect(x*size,y*size,size,size);
  c.strokeStyle="#0006";c.lineWidth=2;c.strokeRect(x*size+.5,y*size+.5,size-1,size-1);
  c.fillStyle="#fff4";c.fillRect(x*size+3,y*size+3,size-6,4);c.restore();
}
function drawMatrix(c,m,ox,oy,size=BLOCK,alpha=1){m.forEach((r,y)=>r.forEach((v,x)=>drawCell(c,x+ox,y+oy,v,size,alpha)))}
function clearCanvas(c,w,h){c.fillStyle="#050607";c.fillRect(0,0,w,h)}
function drawBoard(){
  clearCanvas(ctx,300,600);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x])drawCell(ctx,x,y,board[y][x],BLOCK);
  if(settings.ghost&&current){const gy=ghostY();drawMatrix(ctx,current.matrix,current.x,gy,BLOCK,.18)}
  if(current)drawMatrix(ctx,current.matrix,current.x,current.y);
  for(const fx of lineFx){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,1-fx.t/220)})`;for(let y=0;y<ROWS;y++)if(board[y].every(Boolean))ctx.fillRect(0,y*BLOCK,300,BLOCK)}
}
function drawPreview(c,piece,w,h,size=25){
  clearCanvas(c,w,h);if(!piece)return;
  const m=piece.matrix,ox=Math.floor((w/size-m[0].length)/2),oy=Math.floor((h/size-m.length)/2);
  drawMatrix(c,m,ox,oy,size);
}
function drawHold(){
  clearCanvas(holdCtx,140,100);if(holdPiece)drawPreview(holdCtx,makePiece(holdPiece),140,100,25)
}
function drawNext(){
  clearCanvas(nextCtx,180,260);
  const n=Math.min(Number(settings.previewCount),nextQueue.length);
  for(let i=0;i<n;i++){const p=nextQueue[i],m=p.matrix,ox=Math.floor((180/25-m[0].length)/2),oy=2+i*50;drawMatrix(nextCtx,m,ox,oy,25)}
}
function drawAll(){drawBoard();drawHold();drawNext()}

function updateUI(){
  for(const [id,v] of Object.entries({score,highScore,lines,level,pieces,single:singles,double:doubles,triple:triples,tetris:tetrises,tspins,perfects,bestCombo}))
    document.getElementById(id).textContent=v;
  document.getElementById("combo").textContent=combo<0?"-":combo;
}
function loop(t){
  if(!running)return;
  const dt=t-lastTime;lastTime=t;
  if(!paused){dropCounter+=dt;if(dropCounter>dropInterval){if(!collide(current,0,1))current.y++;else lockPiece();dropCounter=0}
    lineFx.forEach(f=>f.t+=dt);lineFx=lineFx.filter(f=>f.t<220);drawAll();updateUI()
  }
  animationId=requestAnimationFrame(loop)
}

function beep(freq,dur){
  if(!settings.sound||settings.volume<=0)return;
  try{
    audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type="square";
    g.gain.setValueAtTime(settings.volume*.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);
    o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)
  }catch{}
}
function saveSettings(){localStorage.setItem("tetrisSettings",JSON.stringify(settings))}
function applyTheme(){document.documentElement.classList.toggle("light",settings.theme==="light");document.getElementById("themeBtn").textContent=settings.theme==="light"?"☀":"☾"}
function openSettings(){
  document.getElementById("volume").value=settings.volume;document.getElementById("previewCount").value=settings.previewCount;
  document.getElementById("ghostToggle").checked=settings.ghost;document.getElementById("soundToggle").checked=settings.sound;showOverlay("settingsOverlay")
}
function bind(){
  document.addEventListener("keydown",e=>{
    if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key))e.preventDefault();
    if(e.key==="ArrowLeft")move(-1);else if(e.key==="ArrowRight")move(1);else if(e.key==="ArrowDown")softDrop();else if(e.key==="ArrowUp")rotate();
    else if(e.key===" ")hardDrop();else if(e.key.toLowerCase()==="c")hold();else if(e.key.toLowerCase()==="p")pause();
    else if(e.key.toLowerCase()==="r")startGame();else if(e.key==="Enter"&&!running)startGame();
  });
  document.getElementById("startBtn").onclick=startGame;document.getElementById("overlayStart").onclick=startGame;
  document.getElementById("restartBtn").onclick=startGame;document.getElementById("pauseBtn").onclick=pause;
  document.getElementById("settingsBtn").onclick=openSettings;document.getElementById("overlaySettings").onclick=openSettings;
  document.getElementById("closeSettings").onclick=()=>{hideOverlay("settingsOverlay");drawAll()};
  document.getElementById("themeBtn").onclick=()=>{settings.theme=settings.theme==="light"?"dark":"light";applyTheme();saveSettings()};
  document.getElementById("volume").oninput=e=>{settings.volume=+e.target.value;saveSettings()};
  document.getElementById("previewCount").oninput=e=>{settings.previewCount=+e.target.value;saveSettings();drawNext()};
  document.getElementById("ghostToggle").onchange=e=>{settings.ghost=e.target.checked;saveSettings();drawBoard()};
  document.getElementById("soundToggle").onchange=e=>{settings.sound=e.target.checked;saveSettings()};
  document.querySelectorAll(".mobile-controls button").forEach(b=>b.addEventListener("click",()=>({left:()=>move(-1),right:()=>move(1),rotate,down:softDrop,drop:hardDrop,hold})[b.dataset.action]?.()));
}
applyTheme();bind();updateUI();drawAll();
