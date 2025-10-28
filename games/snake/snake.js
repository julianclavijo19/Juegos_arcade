const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

let snake = [];
let food = {};
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let speed = 150;
let isPaused = false;

// Inicializar juego
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    updateScore();
    spawnFood();
}

// Generar comida
function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Dibujar el juego
function draw() {
    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }
    
    // Dibujar serpiente
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeza
            const gradient = ctx.createRadialGradient(
                segment.x * TILE_SIZE + TILE_SIZE / 2,
                segment.y * TILE_SIZE + TILE_SIZE / 2,
                0,
                segment.x * TILE_SIZE + TILE_SIZE / 2,
                segment.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE
            );
            gradient.addColorStop(0, '#06ffa5');
            gradient.addColorStop(1, '#00cc7a');
            ctx.fillStyle = gradient;
        } else {
            // Cuerpo
            const intensity = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(6, 255, 165, ${intensity})`;
        }
        
        ctx.fillRect(
            segment.x * TILE_SIZE + 2,
            segment.y * TILE_SIZE + 2,
            TILE_SIZE - 4,
            TILE_SIZE - 4
        );
        
        // Efecto de brillo
        if (index === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(
                segment.x * TILE_SIZE + 4,
                segment.y * TILE_SIZE + 4,
                TILE_SIZE / 3,
                TILE_SIZE / 3
            );
        }
    });
    
    // Dibujar comida con animación
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 0.2 + 0.8;
    const foodSize = (TILE_SIZE - 4) * pulse;
    const offset = (TILE_SIZE - foodSize) / 2;
    
    const foodGradient = ctx.createRadialGradient(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        0,
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2
    );
    foodGradient.addColorStop(0, '#ff006e');
    foodGradient.addColorStop(1, '#d90058');
    ctx.fillStyle = foodGradient;
    
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        foodSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Brillo de la comida
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2 - 3,
        food.y * TILE_SIZE + TILE_SIZE / 2 - 3,
        foodSize / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Actualizar juego
function update() {
    if (isPaused) return;
    
    direction = nextDirection;
    
    // Nueva posición de la cabeza
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'UP':
            head.y--;
            break;
        case 'DOWN':
            head.y++;
            break;
        case 'LEFT':
            head.x--;
            break;
        case 'RIGHT':
            head.x++;
            break;
    }
    
    // Verificar colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Verificar colisión con el cuerpo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Agregar nueva cabeza
    snake.unshift(head);
    
    // Verificar si comió
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
        
        // Aumentar velocidad gradualmente
        if (score % 50 === 0 && speed > 50) {
            speed -= 10;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameLoopFunction, speed);
        }
    } else {
        // Remover cola
        snake.pop();
    }
    
    draw();
}

// Actualizar puntuación
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('length').textContent = snake.length;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// Game Over
function gameOver() {
    clearInterval(gameLoop);
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>GAME OVER</h2>
            <p>Puntuación: ${score}</p>
            <p>Longitud: ${snake.length}</p>
            <p>Récord: ${highScore}</p>
            <button class="start-button" onclick="location.reload()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Loop del juego
function gameLoopFunction() {
    update();
}

// Controles
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'DOWN') nextDirection = 'UP';
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction !== 'UP') nextDirection = 'DOWN';
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction !== 'RIGHT') nextDirection = 'LEFT';
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') nextDirection = 'RIGHT';
            e.preventDefault();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

// Controles móviles
document.getElementById('upBtn').addEventListener('click', () => {
    if (direction !== 'DOWN') nextDirection = 'UP';
});

document.getElementById('downBtn').addEventListener('click', () => {
    if (direction !== 'UP') nextDirection = 'DOWN';
});

document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction !== 'RIGHT') nextDirection = 'LEFT';
});

document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction !== 'LEFT') nextDirection = 'RIGHT';
});

// Pausar/Reanudar
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
    const difficulty = document.getElementById('difficulty').value;
    const speeds = { easy: 200, medium: 150, hard: 80 };
    speed = speeds[difficulty];
    
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    // Cargar high score
    document.getElementById('highScore').textContent = highScore;
    
    initGame();
    draw();
    gameLoop = setInterval(gameLoopFunction, speed);
});

