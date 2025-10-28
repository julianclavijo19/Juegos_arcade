const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
let gameMode = 'ai';
let difficulty = 'medium';
let winScore = 10;
let isPaused = false;
let gameLoop = null;

// Objetos del juego
const paddle = {
    width: 15,
    height: 100,
    speed: 8
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speedX: 5,
    speedY: 5,
    maxSpeed: 15
};

const player1 = {
    x: 20,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    upPressed: false,
    downPressed: false
};

const player2 = {
    x: canvas.width - 20 - paddle.width,
    y: canvas.height / 2 - paddle.height / 2,
    score: 0,
    upPressed: false,
    downPressed: false
};

// Inicializar juego
function initGame() {
    player1.score = 0;
    player2.score = 0;
    player1.y = canvas.height / 2 - paddle.height / 2;
    player2.y = canvas.height / 2 - paddle.height / 2;
    updateScore();
    resetBall();
}

// Resetear pelota
function resetBall(winner = null) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // La pelota va hacia el que perdió el punto
    const direction = winner === 1 ? 1 : -1;
    const angle = (Math.random() - 0.5) * Math.PI / 3; // Ángulo aleatorio
    
    ball.speedX = Math.cos(angle) * 5 * direction;
    ball.speedY = Math.sin(angle) * 5;
}

// Dibujar el campo
function drawCourt() {
    // Fondo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Línea central
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#3a86ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Círculo central
    ctx.strokeStyle = '#3a86ff';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
}

// Dibujar paddle
function drawPaddle(x, y, color) {
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 3, y + 3, paddle.width, paddle.height);
    
    // Paddle principal
    const gradient = ctx.createLinearGradient(x, y, x + paddle.width, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, paddle.width, paddle.height);
    
    // Brillo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 2, y + 2, paddle.width - 4, paddle.height / 3);
    
    // Borde
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, paddle.width, paddle.height);
}

// Ajustar color
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Dibujar pelota
function drawBall() {
    // Estela
    ctx.globalAlpha = 0.3;
    for (let i = 1; i <= 3; i++) {
        const trailX = ball.x - (ball.speedX * i);
        const trailY = ball.y - (ball.speedY * i);
        const gradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, ball.radius);
        gradient.addColorStop(0, '#ffb703');
        gradient.addColorStop(1, 'rgba(255, 183, 3, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(trailX, trailY, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Pelota principal
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.3, '#ffb703');
    gradient.addColorStop(1, '#ff006e');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 3, ball.radius / 3, 0, Math.PI * 2);
    ctx.fill();
}

// Actualizar posiciones de paddles
function updatePaddles() {
    // Jugador 1
    if (player1.upPressed && player1.y > 0) {
        player1.y -= paddle.speed;
    }
    if (player1.downPressed && player1.y < canvas.height - paddle.height) {
        player1.y += paddle.speed;
    }
    
    // Jugador 2 o IA
    if (gameMode === 'ai') {
        updateAI();
    } else {
        if (player2.upPressed && player2.y > 0) {
            player2.y -= paddle.speed;
        }
        if (player2.downPressed && player2.y < canvas.height - paddle.height) {
            player2.y += paddle.speed;
        }
    }
}

// IA para jugador 2
function updateAI() {
    const paddleCenter = player2.y + paddle.height / 2;
    const targetY = ball.y;
    
    let aiSpeed = paddle.speed;
    
    // Ajustar velocidad según dificultad
    switch(difficulty) {
        case 'easy':
            aiSpeed = paddle.speed * 0.5;
            // Solo persigue si la pelota viene hacia él
            if (ball.speedX < 0) return;
            break;
        case 'medium':
            aiSpeed = paddle.speed * 0.7;
            // Solo persigue si la pelota está cerca
            if (ball.speedX < 0 && ball.x < canvas.width / 2) return;
            break;
        case 'hard':
            aiSpeed = paddle.speed * 0.95;
            break;
    }
    
    // Mover hacia la pelota
    if (paddleCenter < targetY - 10) {
        player2.y += aiSpeed;
    } else if (paddleCenter > targetY + 10) {
        player2.y -= aiSpeed;
    }
    
    // Límites
    player2.y = Math.max(0, Math.min(canvas.height - paddle.height, player2.y));
}

// Actualizar pelota
function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Colisión con techo y suelo
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
    }
    
    // Colisión con paddle izquierdo
    if (ball.x - ball.radius < player1.x + paddle.width &&
        ball.y > player1.y &&
        ball.y < player1.y + paddle.height) {
        
        ball.speedX = Math.abs(ball.speedX);
        
        // Calcular ángulo basado en dónde golpea el paddle
        const hitPos = (ball.y - player1.y) / paddle.height;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        
        const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        ball.speedX = Math.cos(angle) * speed * 1.05;
        ball.speedY = Math.sin(angle) * speed * 1.05;
        
        // Limitar velocidad máxima
        limitBallSpeed();
    }
    
    // Colisión con paddle derecho
    if (ball.x + ball.radius > player2.x &&
        ball.y > player2.y &&
        ball.y < player2.y + paddle.height) {
        
        ball.speedX = -Math.abs(ball.speedX);
        
        const hitPos = (ball.y - player2.y) / paddle.height;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        
        const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        ball.speedX = -Math.cos(angle) * speed * 1.05;
        ball.speedY = Math.sin(angle) * speed * 1.05;
        
        limitBallSpeed();
    }
    
    // Punto para jugador 2
    if (ball.x - ball.radius < 0) {
        player2.score++;
        updateScore();
        checkWin();
        if (!checkWin()) {
            resetBall(2);
        }
    }
    
    // Punto para jugador 1
    if (ball.x + ball.radius > canvas.width) {
        player1.score++;
        updateScore();
        checkWin();
        if (!checkWin()) {
            resetBall(1);
        }
    }
}

// Limitar velocidad de la pelota
function limitBallSpeed() {
    const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
    if (speed > ball.maxSpeed) {
        const ratio = ball.maxSpeed / speed;
        ball.speedX *= ratio;
        ball.speedY *= ratio;
    }
}

// Actualizar puntuación
function updateScore() {
    document.getElementById('score1').textContent = player1.score;
    document.getElementById('score2').textContent = player2.score;
}

// Verificar victoria
function checkWin() {
    if (player1.score >= winScore) {
        gameOver(1);
        return true;
    } else if (player2.score >= winScore) {
        gameOver(2);
        return true;
    }
    return false;
}

// Game Over
function gameOver(winner) {
    cancelAnimationFrame(gameLoop);
    
    const winnerName = winner === 1 ? 
        (gameMode === 'ai' ? 'JUGADOR' : 'JUGADOR 1') : 
        (gameMode === 'ai' ? 'IA' : 'JUGADOR 2');
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>¡${winnerName} GANA!</h2>
            <p>Puntuación Final:</p>
            <p>Jugador 1: ${player1.score} - Jugador 2: ${player2.score}</p>
            <button class="start-button" onclick="location.reload()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Dibujar todo
function draw() {
    drawCourt();
    drawPaddle(player1.x, player1.y, '#ff006e');
    drawPaddle(player2.x, player2.y, '#06ffa5');
    drawBall();
}

// Loop principal
function update() {
    if (!isPaused) {
        updatePaddles();
        updateBall();
        draw();
    }
    gameLoop = requestAnimationFrame(update);
}

// Controles
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'w' || e.key === 'W') player1.upPressed = true;
    if (e.key === 's' || e.key === 'S') player1.downPressed = true;
    if (e.key === 'ArrowUp') {
        player2.upPressed = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
        player2.downPressed = true;
        e.preventDefault();
    }
    if (e.key === 'p' || e.key === 'P') togglePause();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    
    if (e.key === 'w' || e.key === 'W') player1.upPressed = false;
    if (e.key === 's' || e.key === 'S') player1.downPressed = false;
    if (e.key === 'ArrowUp') player2.upPressed = false;
    if (e.key === 'ArrowDown') player2.downPressed = false;
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

// Configuración inicial
document.getElementById('gameMode').addEventListener('change', (e) => {
    const difficultyGroup = document.getElementById('difficultyGroup');
    difficultyGroup.style.display = e.target.value === 'ai' ? 'block' : 'none';
});

document.getElementById('startButton').addEventListener('click', () => {
    gameMode = document.getElementById('gameMode').value;
    difficulty = document.getElementById('difficulty').value;
    winScore = parseInt(document.getElementById('winScore').value);
    
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    document.getElementById('targetScore').textContent = winScore;
    document.getElementById('player2Label').textContent = gameMode === 'ai' ? 'IA' : 'JUGADOR 2';
    
    initGame();
    update();
});

