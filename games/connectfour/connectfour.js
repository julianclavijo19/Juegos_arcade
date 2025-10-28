const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 'red';
let gameActive = true;
let gameMode = 'ai';
let difficulty = 'medium';
let scores = { red: 0, yellow: 0, tie: 0 };

// Inicializar tablero
function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameActive = true;
    renderBoard();
    updateTurnIndicator();
}

// Renderizar tablero
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'board-row';
        
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (board[row][col]) {
                const token = document.createElement('div');
                token.className = `token ${board[row][col]}`;
                cell.appendChild(token);
            }
            
            // Solo la primera fila es clickeable
            if (row === 0) {
                cell.addEventListener('click', () => handleColumnClick(col));
            }
            
            rowElement.appendChild(cell);
        }
        
        boardElement.appendChild(rowElement);
    }
}

// Manejar click en columna
function handleColumnClick(col) {
    if (!gameActive) return;
    
    if (makeMove(col, currentPlayer)) {
        if (!checkWin(currentPlayer) && !checkTie()) {
            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
            updateTurnIndicator();
            
            // Si es modo IA y ahora le toca a amarillo
            if (gameMode === 'ai' && currentPlayer === 'yellow') {
                setTimeout(() => {
                    aiMove();
                }, 500);
            }
        }
    }
}

// Realizar movimiento
function makeMove(col, player) {
    // Encontrar la fila más baja disponible en esta columna
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            board[row][col] = player;
            renderBoard();
            
            if (checkWin(player)) {
                handleWin(player);
                return true;
            }
            
            if (checkTie()) {
                handleTie();
                return true;
            }
            
            return true;
        }
    }
    return false; // Columna llena
}

// Verificar victoria
function checkWin(player) {
    // Horizontal
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player) {
                highlightWinningCells([[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]);
                return true;
            }
        }
    }
    
    // Vertical
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player) {
                highlightWinningCells([[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]);
                return true;
            }
        }
    }
    
    // Diagonal descendente
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player) {
                highlightWinningCells([[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]);
                return true;
            }
        }
    }
    
    // Diagonal ascendente
    for (let row = 3; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            if (board[row][col] === player &&
                board[row - 1][col + 1] === player &&
                board[row - 2][col + 2] === player &&
                board[row - 3][col + 3] === player) {
                highlightWinningCells([[row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]]);
                return true;
            }
        }
    }
    
    return false;
}

// Resaltar celdas ganadoras
function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const token = cell.querySelector('.token');
        if (token) {
            token.classList.add('winning');
        }
    });
}

// Verificar empate
function checkTie() {
    return board[0].every(cell => cell !== null);
}

// Manejar victoria
function handleWin(player) {
    gameActive = false;
    scores[player]++;
    updateScores();
    
    setTimeout(() => {
        const playerName = player === 'red' ? 'ROJO' : 
                          (gameMode === 'ai' && player === 'yellow' ? 'IA' : 'AMARILLO');
        showGameOverMessage(`¡${playerName} GANA!`);
    }, 1000);
}

// Manejar empate
function handleTie() {
    gameActive = false;
    scores.tie++;
    updateScores();
    
    setTimeout(() => {
        showGameOverMessage('¡EMPATE!');
    }, 500);
}

// Actualizar puntuaciones
function updateScores() {
    document.getElementById('scoreRed').textContent = scores.red;
    document.getElementById('scoreYellow').textContent = scores.yellow;
    document.getElementById('scoreTie').textContent = scores.tie;
}

// Actualizar indicador de turno
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    const tokenClass = currentPlayer;
    const playerName = currentPlayer === 'red' ? 'ROJO' : 
                      (gameMode === 'ai' && currentPlayer === 'yellow' ? 'IA' : 'AMARILLO');
    
    indicator.innerHTML = `
        <div class="turn-token ${tokenClass}"></div>
        <span>TURNO DE ${playerName}</span>
    `;
}

// Mostrar mensaje de fin de juego
function showGameOverMessage(message) {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>${message}</h2>
            <p>Puntuación:</p>
            <p>🔴 Rojo: ${scores.red} | 🟡 Amarillo: ${scores.yellow} | Empates: ${scores.tie}</p>
            <button class="start-button" onclick="resetGame()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Reiniciar juego
function resetGame() {
    const overlay = document.querySelector('.game-over-overlay');
    if (overlay) overlay.remove();
    
    initBoard();
}

// IA - Movimiento
function aiMove() {
    if (!gameActive) return;
    
    let move;
    
    switch(difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.6 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    
    if (move !== null) {
        makeMove(move, 'yellow');
        if (!checkWin('yellow') && !checkTie()) {
            currentPlayer = 'red';
            updateTurnIndicator();
        }
    }
}

// IA - Movimiento aleatorio
function getRandomMove() {
    const availableCols = [];
    for (let col = 0; col < COLS; col++) {
        if (board[0][col] === null) {
            availableCols.push(col);
        }
    }
    return availableCols.length > 0 ? 
           availableCols[Math.floor(Math.random() * availableCols.length)] : null;
}

// IA - Mejor movimiento
function getBestMove() {
    // 1. Intentar ganar
    for (let col = 0; col < COLS; col++) {
        if (canMakeMove(col)) {
            const row = getAvailableRow(col);
            board[row][col] = 'yellow';
            if (checkWinAt(row, col, 'yellow')) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // 2. Bloquear al oponente
    for (let col = 0; col < COLS; col++) {
        if (canMakeMove(col)) {
            const row = getAvailableRow(col);
            board[row][col] = 'red';
            if (checkWinAt(row, col, 'red')) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // 3. Priorizar columnas centrales
    const centerCols = [3, 2, 4, 1, 5, 0, 6];
    for (let col of centerCols) {
        if (canMakeMove(col)) {
            return col;
        }
    }
    
    return getRandomMove();
}

// Verificar si se puede hacer movimiento en columna
function canMakeMove(col) {
    return board[0][col] === null;
}

// Obtener fila disponible en columna
function getAvailableRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            return row;
        }
    }
    return -1;
}

// Verificar victoria desde posición específica
function checkWinAt(row, col, player) {
    const directions = [
        [[0, 1], [0, -1]],   // Horizontal
        [[1, 0], [-1, 0]],   // Vertical
        [[1, 1], [-1, -1]],  // Diagonal \
        [[1, -1], [-1, 1]]   // Diagonal /
    ];
    
    for (let [dir1, dir2] of directions) {
        let count = 1;
        
        // Contar en dirección 1
        let r = row + dir1[0];
        let c = col + dir1[1];
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
            count++;
            r += dir1[0];
            c += dir1[1];
        }
        
        // Contar en dirección 2
        r = row + dir2[0];
        c = col + dir2[1];
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
            count++;
            r += dir2[0];
            c += dir2[1];
        }
        
        if (count >= 4) return true;
    }
    
    return false;
}

// Event listeners
document.getElementById('gameMode').addEventListener('change', (e) => {
    const difficultyGroup = document.getElementById('difficultyGroup');
    difficultyGroup.style.display = e.target.value === 'ai' ? 'block' : 'none';
});

document.getElementById('startButton').addEventListener('click', () => {
    gameMode = document.getElementById('gameMode').value;
    difficulty = document.getElementById('difficulty').value;
    
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    const player2Label = document.getElementById('player2Label');
    player2Label.innerHTML = gameMode === 'ai' ? '🤖 IA' : '🟡 AMARILLO';
    
    initBoard();
});

document.getElementById('resetButton').addEventListener('click', resetGame);

document.getElementById('changeSettingsButton').addEventListener('click', () => {
    document.getElementById('gameSettings').style.display = 'block';
    document.getElementById('gameBoard').style.display = 'none';
    scores = { red: 0, yellow: 0, tie: 0 };
    resetGame();
});

