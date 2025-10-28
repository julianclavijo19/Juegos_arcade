const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextCanvas.getContext('2d');

const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;

let board = [];
let score = 0;
let lines = 0;
let level = 1;
let gameLoop = null;
let dropInterval = 1000;
let isPaused = false;

const PIECES = {
    'I': [[1,1,1,1]],
    'O': [[1,1],[1,1]],
    'T': [[0,1,0],[1,1,1]],
    'S': [[0,1,1],[1,1,0]],
    'Z': [[1,1,0],[0,1,1]],
    'J': [[1,0,0],[1,1,1]],
    'L': [[0,0,1],[1,1,1]]
};

const COLORS = {
    'I': '#00f0f0',
    'O': '#f0f000',
    'T': '#a000f0',
    'S': '#00f000',
    'Z': '#f00000',
    'J': '#0000f0',
    'L': '#f0a000'
};

let currentPiece = null;
let nextPiece = null;

// Inicializar el tablero
function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Crear una pieza aleatoria
function createPiece() {
    const pieces = Object.keys(PIECES);
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        type: type,
        shape: PIECES[type],
        color: COLORS[type],
        x: Math.floor(COLS / 2) - Math.floor(PIECES[type][0].length / 2),
        y: 0
    };
}

// Dibujar el tablero
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar grid
    ctx.strokeStyle = '#222';
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Dibujar bloques colocados
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(col, row, board[row][col]);
            }
        }
    }
}

// Dibujar un bloque
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    
    // Efecto 3D
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 5);
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, 5, BLOCK_SIZE - 2);
}

// Dibujar la pieza actual
function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        });
    });
}

// Dibujar la siguiente pieza
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const blockSize = 25;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(
                        offsetX + x * blockSize + 1,
                        offsetY + y * blockSize + 1,
                        blockSize - 2,
                        blockSize - 2
                    );
                }
            });
        });
    }
}

// Verificar colisión
function checkCollision(piece, offsetX = 0, offsetY = 0) {
    return piece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        });
    });
}

// Colocar la pieza en el tablero
function placePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        });
    });
}

// Limpiar líneas completas
function clearLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++; // Revisar la misma fila nuevamente
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // Aumentar nivel cada 10 líneas
        level = Math.floor(lines / 10) + 1;
        
        updateScore();
    }
}

// Rotar la pieza
function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (checkCollision(currentPiece)) {
        currentPiece.shape = previousShape;
    }
}

// Mover la pieza
function movePiece(dir) {
    if (!checkCollision(currentPiece, dir, 0)) {
        currentPiece.x += dir;
    }
}

// Caída de la pieza
function dropPiece() {
    if (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        placePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        
        if (checkCollision(currentPiece)) {
            gameOver();
        }
    }
}

// Caída rápida
function hardDrop() {
    while (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2;
    }
    updateScore();
}

// Actualizar puntuación
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
}

// Game Over
function gameOver() {
    cancelAnimationFrame(gameLoop);
    clearInterval(gameLoop);
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>GAME OVER</h2>
            <p>Puntuación Final: ${score}</p>
            <p>Líneas: ${lines}</p>
            <p>Nivel: ${level}</p>
            <button class="start-button" onclick="location.reload()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Loop del juego
function update() {
    if (!isPaused) {
        drawBoard();
        drawPiece(currentPiece);
        drawNextPiece();
    }
}

let lastDropTime = 0;
function gameLoopFunction(timestamp) {
    if (!isPaused) {
        const difficulty = document.getElementById('difficulty').value;
        const speeds = { easy: 1000, medium: 700, hard: 400 };
        dropInterval = Math.max(speeds[difficulty] - (level - 1) * 50, 100);
        
        if (timestamp - lastDropTime > dropInterval) {
            dropPiece();
            lastDropTime = timestamp;
        }
        
        update();
    }
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// Controles
document.addEventListener('keydown', (e) => {
    if (!currentPiece || isPaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            dropPiece();
            score += 1;
            updateScore();
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            rotatePiece();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
    update();
});

function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.textContent = isPaused ? 'REANUDAR' : 'PAUSAR';
    
    if (isPaused) {
        const overlay = document.createElement('div');
        overlay.id = 'pauseOverlay';
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h2>PAUSA</h2>
                <p>Presiona P para continuar</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) overlay.remove();
    }
}

document.getElementById('pauseButton').addEventListener('click', togglePause);

// Iniciar juego
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    initBoard();
    score = 0;
    lines = 0;
    level = 1;
    updateScore();
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    lastDropTime = 0;
    gameLoop = requestAnimationFrame(gameLoopFunction);
});

