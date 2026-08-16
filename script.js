const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const COLORS = [
    null,
    "#00f0f0", // I
    "#f0f000", // O
    "#a000f0", // T
    "#00f000", // S
    "#f00000", // Z
    "#0000f0", // J
    "#f0a000"  // L
];

const SHAPES = [

    // I
    [
        [1, 1, 1, 1]
    ],

    // O
    [
        [2, 2],
        [2, 2]
    ],

    // T
    [
        [0, 3, 0],
        [3, 3, 3]
    ],

    // S
    [
        [0, 4, 4],
        [4, 4, 0]
    ],

    // Z
    [
        [5, 5, 0],
        [0, 5, 5]
    ],

    // J
    [
        [6, 0, 0],
        [6, 6, 6]
    ],

    // L
    [
        [0, 0, 7],
        [7, 7, 7]
    ]

];

let board = createBoard();

let piece = null;
let nextPiece = null;

let score = 0;
let lines = 0;
let level = 1;

let dropCounter = 0;
let lastTime = 0;

let dropInterval = 800;

let running = false;
let paused = false;

let animationId = null;


// ==========================================
// TABULEIRO
// ==========================================

function createBoard() {

    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );

}


// ==========================================
// PEÇAS
// ==========================================

function randomPiece() {

    const shape =
        SHAPES[
            Math.floor(Math.random() * SHAPES.length)
        ];

    return {

        matrix: shape.map(row => [...row]),

        x:
            Math.floor(COLS / 2) -
            Math.ceil(shape[0].length / 2),

        y: 0

    };

}


// ==========================================
// DESENHO
// ==========================================

function drawCell(
    context,
    x,
    y,
    color,
    size = BLOCK
) {

    context.fillStyle = COLORS[color];

    context.fillRect(
        x * size,
        y * size,
        size,
        size
    );

    context.strokeStyle = "rgba(0, 0, 0, 0.35)";
    context.lineWidth = 2;

    context.strokeRect(
        x * size,
        y * size,
        size,
        size
    );

    context.fillStyle =
        "rgba(255, 255, 255, 0.15)";

    context.fillRect(
        x * size + 3,
        y * size + 3,
        size - 6,
        4
    );

}


function drawMatrix(
    context,
    matrix,
    offsetX,
    offsetY
) {

    matrix.forEach((row, y) => {

        row.forEach((value, x) => {

            if (!value) return;

            const size =
                context === nextCtx
                    ? 25
                    : BLOCK;

            drawCell(
                context,
                x + offsetX,
                y + offsetY,
                value,
                size
            );

        });

    });

}


function drawBoard() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (let y = 0; y < ROWS; y++) {

        for (let x = 0; x < COLS; x++) {

            if (board[y][x]) {

                drawCell(
                    ctx,
                    x,
                    y,
                    board[y][x]
                );

            }

        }

    }

    if (piece) {

        drawMatrix(
            ctx,
            piece.matrix,
            piece.x,
            piece.y
        );

    }

}


function drawNext() {

    nextCtx.fillStyle = "#000";

    nextCtx.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );

    if (!nextPiece) return;

    const matrix = nextPiece.matrix;

    const width = matrix[0].length;
    const height = matrix.length;

    const offsetX =
        Math.floor(
            (nextCanvas.width / 25 - width) / 2
        );

    const offsetY =
        Math.floor(
            (nextCanvas.height / 25 - height) / 2
        );

    drawMatrix(
        nextCtx,
        matrix,
        offsetX,
        offsetY
    );

}


// ==========================================
// COLISÃO
// ==========================================

function collide() {

    const matrix = piece.matrix;

    for (
        let row = 0;
        row < matrix.length;
        row++
    ) {

        for (
            let col = 0;
            col < matrix[row].length;
            col++
        ) {

            if (!matrix[row][col]) {
                continue;
            }

            const boardY =
                piece.y + row;

            const boardX =
                piece.x + col;

            if (
                boardX < 0 ||
                boardX >= COLS ||
                boardY >= ROWS
            ) {

                return true;

            }

            if (
                boardY >= 0 &&
                board[boardY][boardX]
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================================
// MESCLAR PEÇA
// ==========================================

function merge() {

    piece.matrix.forEach((row, y) => {

        row.forEach((value, x) => {

            if (!value) return;

            const boardY =
                piece.y + y;

            const boardX =
                piece.x + x;

            if (
                boardY >= 0 &&
                boardY < ROWS &&
                boardX >= 0 &&
                boardX < COLS
            ) {

                board[boardY][boardX] = value;

            }

        });

    });

}


// ==========================================
// LINHAS
// ==========================================

function clearLines() {

    let cleared = 0;

    outer:

    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (!board[y][x]) {

                continue outer;

            }

        }

        board.splice(y, 1);

        board.unshift(
            Array(COLS).fill(0)
        );

        cleared++;

        y++;

    }

    if (cleared > 0) {

        const points = [
            0,
            100,
            300,
            500,
            800
        ];

        score +=
            points[cleared] * level;

        lines += cleared;

        level =
            Math.floor(lines / 10) + 1;

        dropInterval =
            Math.max(
                80,
                800 - (level - 1) * 70
            );

        updateUI();

    }

}


// ==========================================
// ROTAÇÃO
// ==========================================

function rotate(matrix) {

    return matrix.map(
        (_, i) =>
            matrix
                .map(row => row[i])
                .reverse()
    );

}


function rotatePiece() {

    const oldMatrix = piece.matrix;
    const oldX = piece.x;

    piece.matrix =
        rotate(piece.matrix);

    let offset = 1;

    while (collide()) {

        piece.x += offset;

        offset =
            -(offset + (
                offset > 0 ? 1 : -1
            ));

        if (
            Math.abs(offset) >
            piece.matrix[0].length
        ) {

            piece.matrix = oldMatrix;
            piece.x = oldX;

            return;

        }

    }

}


// ==========================================
// MOVIMENTO
// ==========================================

function move(direction) {

    if (!running || paused) return;

    piece.x += direction;

    if (collide()) {

        piece.x -= direction;

    }

}


function drop() {

    if (!running || paused) return;

    piece.y++;

    if (collide()) {

        piece.y--;

        merge();

        clearLines();

        piece = nextPiece;

        nextPiece = randomPiece();

        drawNext();

        if (collide()) {

            endGame();

        }

    }

    dropCounter = 0;

}


function hardDrop() {

    if (!running || paused) return;

    let distance = 0;

    while (!collide()) {

        piece.y++;

        distance++;

    }

    piece.y--;

    score +=
        Math.max(0, distance - 1) * 2;

    merge();

    clearLines();

    piece = nextPiece;

    nextPiece = randomPiece();

    drawNext();

    if (collide()) {

        endGame();

    }

    dropCounter = 0;

    updateUI();

}


// ==========================================
// LOOP DO JOGO
// ==========================================

function update(time = 0) {

    if (!running) return;

    const delta =
        time - lastTime;

    lastTime = time;

    if (!paused) {

        dropCounter += delta;

        if (
            dropCounter >
            dropInterval
        ) {

            drop();

        }

        drawBoard();

    }

    animationId =
        requestAnimationFrame(update);

}


// ==========================================
// INTERFACE
// ==========================================

function updateUI() {

    document.getElementById("score")
        .textContent = score;

    document.getElementById("lines")
        .textContent = lines;

    document.getElementById("level")
        .textContent = level;

}


// ==========================================
// INICIAR
// ==========================================

function startGame() {

    board = createBoard();

    score = 0;
    lines = 0;
    level = 1;

    dropInterval = 800;

    piece = randomPiece();
    nextPiece = randomPiece();

    running = true;
    paused = false;

    updateUI();

    drawNext();
    drawBoard();

    cancelAnimationFrame(
        animationId
    );

    lastTime =
        performance.now();

    dropCounter = 0;

    animationId =
        requestAnimationFrame(update);

}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    running = false;

    document.getElementById(
        "finalScore"
    ).textContent = score;

    document.getElementById(
        "gameOver"
    ).classList.add("active");

    cancelAnimationFrame(
        animationId
    );

}


// ==========================================
// PAUSE
// ==========================================

function togglePause() {

    if (!running) return;

    paused = !paused;

}


// ==========================================
// TECLADO
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowDown",
                "ArrowUp",
                " "
            ].includes(event.key)
        ) {

            event.preventDefault();

        }

        if (
            event.key === "ArrowLeft"
        ) {

            move(-1);

        }

        if (
            event.key === "ArrowRight"
        ) {

            move(1);

        }

        if (
            event.key === "ArrowDown"
        ) {

            drop();

        }

        if (
            event.key === "ArrowUp"
        ) {

            if (running && !paused) {

                rotatePiece();

            }

        }

        if (event.key === " ") {

            hardDrop();

        }

        if (
            event.key.toLowerCase() === "p"
        ) {

            togglePause();

        }

        if (
            event.key === "Enter" &&
            !running
        ) {

            startGame();

        }

    }
);


// ==========================================
// BOTÕES
// ==========================================

document.getElementById("start")
    .addEventListener(
        "click",
        startGame
    );


document.getElementById("restart")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "gameOver"
            ).classList.remove("active");

            startGame();

        }
    );


// ==========================================
// ESTADO INICIAL
// ==========================================

drawBoard();
drawNext();
