const COLS = 10;
const ROWS = 20;

const boardEl = document.getElementById('board');
const nextEl = document.getElementById('next');
const overlayEl = document.getElementById('overlay');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlaySubEl = document.getElementById('overlaySub');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const powerLedEl = document.getElementById('powerLed');

function buildGrid(el, rows, cols) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const d = document.createElement('div');
      d.className = 'cell';
      el.appendChild(d);
      row.push(d);
    }
    cells.push(row);
  }
  return cells;
}

const boardCells = buildGrid(boardEl, ROWS, COLS);
const nextCells = buildGrid(nextEl, 4, 4);

const PIECES = {
  I: { matrix: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { matrix: [[1, 1], [1, 1]] },
  T: { matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { matrix: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { matrix: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { matrix: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] }
};
const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function rotateMatrix(m) {
  const n = m.length;
  const res = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      res[x][n - 1 - y] = m[y][x];
    }
  }
  return res;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

let bag = [];
function randomType() {
  if (bag.length === 0) {
    bag = shuffle(TYPES.slice());
  }
  return bag.pop();
}

function makePiece(type) {
  const matrix = PIECES[type].matrix.map((row) => row.slice());
  const size = matrix.length;
  return { type, matrix, x: Math.floor((COLS - size) / 2), y: 0 };
}

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
let piece = null;
let nextType = randomType();
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000;
let state = 'idle';
let lastTime = 0;
let dropAcc = 0;

function collides(matrix, px, py) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix.length; x++) {
      if (!matrix[y][x]) continue;
      const bx = px + x;
      const by = py + y;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx]) return true;
    }
  }
  return false;
}

function tryMove(dir) {
  if (!piece) return;
  if (!collides(piece.matrix, piece.x + dir, piece.y)) {
    piece.x += dir;
    render();
  }
}

function rotatePiece(direction) {
  if (!piece) return;
  const times = direction === -1 ? 3 : 1;
  let newMatrix = piece.matrix;
  for (let i = 0; i < times; i++) newMatrix = rotateMatrix(newMatrix);
  const kicks = [0, -1, 1, -2, 2];
  for (let i = 0; i < kicks.length; i++) {
    const k = kicks[i];
    if (!collides(newMatrix, piece.x + k, piece.y)) {
      piece.matrix = newMatrix;
      piece.x += k;
      render();
      return;
    }
  }
}

function softDropStep(manual) {
  if (!piece) return;
  if (!collides(piece.matrix, piece.x, piece.y + 1)) {
    piece.y++;
    if (manual) score += 1;
  } else {
    lockPiece();
  }
  render();
}

function hardDrop() {
  if (!piece) return;
  let dist = 0;
  while (!collides(piece.matrix, piece.x, piece.y + 1)) {
    piece.y++;
    dist++;
  }
  score += dist * 2;
  lockPiece();
  render();
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(false));
      cleared++;
      y++;
    }
  }
  return cleared;
}

function updateScore(cleared) {
  const LINE_SCORES = [0, 40, 100, 300, 1200];
  score += LINE_SCORES[cleared] * level;
  lines += cleared;
  const newLevel = Math.floor(lines / 10) + 1;
  if (newLevel !== level) {
    level = newLevel;
    dropInterval = Math.max(120, 1000 - (level - 1) * 80);
  }
}

function lockPiece() {
  let toppedOut = false;
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix.length; x++) {
      if (piece.matrix[y][x]) {
        const by = piece.y + y;
        const bx = piece.x + x;
        if (by < 0) {
          toppedOut = true;
          continue;
        }
        board[by][bx] = true;
      }
    }
  }
  if (toppedOut) {
    piece = null;
    gameOver();
    return;
  }
  const cleared = clearLines();
  if (cleared > 0) updateScore(cleared);
  spawnPiece();
}

function spawnPiece() {
  piece = makePiece(nextType);
  nextType = randomType();
  renderNext();
  if (collides(piece.matrix, piece.x, piece.y)) {
    piece = null;
    gameOver();
  }
}

function render() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = boardCells[y][x];
      cell.className = 'cell';
      if (board[y][x]) cell.classList.add('filled');
    }
  }
  if (piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix.length; x++) {
        if (piece.matrix[y][x]) {
          const by = piece.y + y;
          const bx = piece.x + x;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            boardCells[by][bx].className = 'cell active';
          }
        }
      }
    }
  }
  scoreEl.textContent = String(score).padStart(4, '0');
  linesEl.textContent = String(lines).padStart(2, '0');
  levelEl.textContent = String(level).padStart(2, '0');
}

function renderNext() {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      nextCells[y][x].className = 'cell';
    }
  }
  const m = PIECES[nextType].matrix;
  const off = Math.floor((4 - m.length) / 2);
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m.length; x++) {
      if (m[y][x]) nextCells[off + y][off + x].className = 'cell filled';
    }
  }
}

function updatePowerLed() {
  powerLedEl.classList.toggle('on', state === 'playing');
}

function showOverlay(title, sub) {
  overlayTitleEl.textContent = title;
  overlaySubEl.textContent = sub;
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

function gameOver() {
  state = 'over';
  updatePowerLed();
  showOverlay('FIM DE JOGO', 'Pontuação: ' + String(score).padStart(4, '0') + ' — START para jogar de novo');
  render();
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    updatePowerLed();
    showOverlay('PAUSADO', 'Pressione START para continuar');
  } else if (state === 'paused') {
    state = 'playing';
    updatePowerLed();
    hideOverlay();
  }
}

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  dropAcc = 0;
  bag = [];
  nextType = randomType();
  spawnPiece();
  state = 'playing';
  updatePowerLed();
  hideOverlay();
  render();
}

function loop(t) {
  if (!lastTime) lastTime = t;
  const dt = t - lastTime;
  lastTime = t;
  if (state === 'playing') {
    dropAcc += dt;
    if (dropAcc >= dropInterval) {
      dropAcc = 0;
      softDropStep(false);
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
renderNext();

const btnStart = document.getElementById('btnStart');
const btnSelect = document.getElementById('btnSelect');
const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');
const btnUp = document.getElementById('btnUp');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const btnDown = document.getElementById('btnDown');

btnStart.addEventListener('click', () => {
  if (state === 'idle' || state === 'over') startGame();
  else togglePause();
});
btnSelect.addEventListener('click', startGame);
btnA.addEventListener('click', () => {
  if (state === 'playing') rotatePiece(1);
});
btnB.addEventListener('click', () => {
  if (state === 'playing') rotatePiece(-1);
});
btnUp.addEventListener('click', () => {
  if (state === 'playing') hardDrop();
});

function bindRepeat(btn, fn) {
  let iv = null;
  const stop = () => {
    if (iv) {
      clearInterval(iv);
      iv = null;
    }
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (state !== 'playing') return;
    fn();
    iv = setInterval(() => {
      if (state === 'playing') fn();
      else stop();
    }, 100);
  });
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointerleave', stop);
  btn.addEventListener('pointercancel', stop);
}
bindRepeat(btnLeft, () => tryMove(-1));
bindRepeat(btnRight, () => tryMove(1));
bindRepeat(btnDown, () => softDropStep(true));

document.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'BUTTON' || tag === 'INPUT') return;
  const codes = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'];
  if (codes.indexOf(e.code) !== -1) e.preventDefault();
  if (e.code === 'KeyP') {
    if (!e.repeat && (state === 'playing' || state === 'paused')) togglePause();
    return;
  }
  if (e.code === 'Enter') {
    if (!e.repeat) {
      if (state === 'idle' || state === 'over') startGame();
      else togglePause();
    }
    return;
  }
  if (state !== 'playing') return;
  if (e.repeat && (e.code === 'Space' || e.code === 'ArrowUp')) return;
  if (e.code === 'ArrowLeft') tryMove(-1);
  else if (e.code === 'ArrowRight') tryMove(1);
  else if (e.code === 'ArrowDown') softDropStep(true);
  else if (e.code === 'ArrowUp') rotatePiece(1);
  else if (e.code === 'KeyZ') { if (!e.repeat) rotatePiece(-1); }
  else if (e.code === 'Space') hardDrop();
});