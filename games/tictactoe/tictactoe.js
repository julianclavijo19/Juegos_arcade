let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'ai';
let difficulty = 'medium';
let scores = { X: 0, O: 0, tie: 0 };

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Actualizar visualización del turno
function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    if (gameMode === 'ai' && currentPlayer === 'O') {
        indicator.textContent = 'TURNO DE LA IA';
        indicator.style.color = '#06ffa5';
    } else {
        indicator.textContent = `TURNO DE ${currentPlayer}`;
        indicator.style.color = currentPlayer === 'X' ? '#ff006e' : '#06ffa5';
    }
    indicator.style.textShadow = `0 0 20px ${currentPlayer === 'X' ? '#ff006e' : '#06ffa5'}`;
}

// Manejar clic en celda
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    if (board[index] !== '' || !gameActive) {
        return;
    }
    
    makeMove(index, currentPlayer);
    
    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

// Realizar movimiento
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelectorAll('.cell')[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    
    if (checkWin()) {
        handleWin();
    } else if (checkTie()) {
        handleTie();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }
}

// Verificar victoria
function checkWin() {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(condition);
            return true;
        }
        return false;
    });
}

// Resaltar celdas ganadoras
function highlightWinningCells(condition) {
    condition.forEach(index => {
        document.querySelectorAll('.cell')[index].classList.add('winning');
    });
}

// Verificar empate
function checkTie() {
    return board.every(cell => cell !== '');
}

// Manejar victoria
function handleWin() {
    gameActive = false;
    scores[currentPlayer]++;
    updateScores();
    
    setTimeout(() => {
        showGameOverMessage(`¡JUGADOR ${currentPlayer} GANA!`);
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
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    document.getElementById('scoreTie').textContent = scores.tie;
}

// Mostrar mensaje de fin de juego
function showGameOverMessage(message) {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>${message}</h2>
            <p>Puntuación - X: ${scores.X} | O: ${scores.O} | Empates: ${scores.tie}</p>
            <button class="start-button" onclick="resetGame()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Reiniciar juego
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
    
    const overlay = document.querySelector('.game-over-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    updateTurnIndicator();
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
            move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    
    makeMove(move, 'O');
}

// IA - Movimiento aleatorio
function getRandomMove() {
    const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// IA - Mejor movimiento (Minimax)
function getBestMove() {
    let bestScore = -Infinity;
    let move;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    return move;
}

// Algoritmo Minimax
function minimax(board, depth, isMaximizing) {
    let result = checkGameState();
    if (result !== null) {
        return result;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Verificar estado del juego para Minimax
function checkGameState() {
    // Verificar victoria de O (IA)
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === 'O') {
            return 10;
        }
    }
    
    // Verificar victoria de X (Jugador)
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === 'X' && board[b] === 'X' && board[c] === 'X') {
            return -10;
        }
    }
    
    // Verificar empate
    if (board.every(cell => cell !== '')) {
        return 0;
    }
    
    return null;
}

// Configuración inicial
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
    player2Label.textContent = gameMode === 'ai' ? 'IA' : 'JUGADOR O';
    
    updateTurnIndicator();
});

document.getElementById('resetButton').addEventListener('click', resetGame);

document.getElementById('changeSettingsButton').addEventListener('click', () => {
    document.getElementById('gameSettings').style.display = 'block';
    document.getElementById('gameBoard').style.display = 'none';
    scores = { X: 0, O: 0, tie: 0 };
    resetGame();
});

// Event listeners para las celdas
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

