const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
let score = 0;
let highScore = localStorage.getItem('spaceInvadersHighScore') || 0;
let level = 1;
let lives = 3;
let gameLoop = null;
let isPaused = false;
let difficulty = 'medium';

// Jugador
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 6,
    leftPressed: false,
    rightPressed: false
};

// Proyectiles del jugador
let bullets = [];
const bulletSpeed = 8;
const bulletCooldown = 300; // ms
let lastBulletTime = 0;

// Enemigos
let aliens = [];
let alienDirection = 1;
let alienSpeed = 1;
let alienDropDistance = 20;

// Proyectiles enemigos
let alienBullets = [];
const alienBulletSpeed = 4;

// Configuración de enemigos según dificultad
const alienConfig = {
    easy: { rows: 3, cols: 6, shootChance: 0.0005 },
    medium: { rows: 4, cols: 8, shootChance: 0.001 },
    hard: { rows: 5, cols: 10, shootChance: 0.002 }
};

// Inicializar juego
function initGame() {
    createAliens();
    bullets = [];
    alienBullets = [];
    player.x = canvas.width / 2 - player.width / 2;
    updateLivesDisplay();
}

// Crear aliens
function createAliens() {
    aliens = [];
    const config = alienConfig[difficulty];
    const alienWidth = 40;
    const alienHeight = 30;
    const padding = 10;
    const offsetX = (canvas.width - (config.cols * (alienWidth + padding))) / 2;
    const offsetY = 50;
    
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            aliens.push({
                x: offsetX + col * (alienWidth + padding),
                y: offsetY + row * (alienHeight + padding),
                width: alienWidth,
                height: alienHeight,
                alive: true,
                type: row % 3 // 3 tipos de aliens
            });
        }
    }
}

// Dibujar fondo espacial
function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Estrellas
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % canvas.height;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }
}

// Dibujar jugador
function drawPlayer() {
    // Nave
    ctx.fillStyle = '#06ffa5';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Detalles de la nave
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + 10, 10, 15);
    
    // Luz
    ctx.fillStyle = 'rgba(6, 255, 165, 0.5)';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
}

// Dibujar aliens
function drawAliens() {
    aliens.forEach(alien => {
        if (!alien.alive) return;
        
        const colors = ['#ff006e', '#8338ec', '#3a86ff'];
        ctx.fillStyle = colors[alien.type];
        
        // Cuerpo del alien
        ctx.fillRect(alien.x + 10, alien.y + 10, alien.width - 20, alien.height - 10);
        
        // Ojos
        ctx.fillStyle = '#fff';
        ctx.fillRect(alien.x + 15, alien.y + 15, 6, 6);
        ctx.fillRect(alien.x + alien.width - 21, alien.y + 15, 6, 6);
        
        // Antenas
        ctx.fillStyle = colors[alien.type];
        ctx.fillRect(alien.x + 12, alien.y, 3, 10);
        ctx.fillRect(alien.x + alien.width - 15, alien.y, 3, 10);
        
        // Puntas de antenas
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(alien.x + 13.5, alien.y, 3, 0, Math.PI * 2);
        ctx.arc(alien.x + alien.width - 13.5, alien.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Dibujar proyectiles
function drawBullets() {
    // Proyectiles del jugador
    ctx.fillStyle = '#06ffa5';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 15);
        
        // Estela
        ctx.fillStyle = 'rgba(6, 255, 165, 0.5)';
        ctx.fillRect(bullet.x - 1, bullet.y + 15, 2, 10);
        ctx.fillStyle = '#06ffa5';
    });
    
    // Proyectiles de aliens
    ctx.fillStyle = '#ff006e';
    alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 15);
        
        // Estela
        ctx.fillStyle = 'rgba(255, 0, 110, 0.5)';
        ctx.fillRect(bullet.x - 1, bullet.y - 15, 2, 10);
        ctx.fillStyle = '#ff006e';
    });
}

// Actualizar jugador
function updatePlayer() {
    if (player.leftPressed && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// Actualizar aliens
function updateAliens() {
    let hitEdge = false;
    
    aliens.forEach(alien => {
        if (!alien.alive) return;
        
        alien.x += alienDirection * alienSpeed;
        
        if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
            hitEdge = true;
        }
        
        // Los aliens disparan aleatoriamente
        if (Math.random() < alienConfig[difficulty].shootChance) {
            alienBullets.push({
                x: alien.x + alien.width / 2,
                y: alien.y + alien.height
            });
        }
    });
    
    // Cambiar dirección y bajar
    if (hitEdge) {
        alienDirection *= -1;
        aliens.forEach(alien => {
            if (alien.alive) {
                alien.y += alienDropDistance;
                
                // Game over si llegan abajo
                if (alien.y + alien.height >= player.y) {
                    gameOver();
                }
            }
        });
    }
}

// Actualizar proyectiles
function updateBullets() {
    // Proyectiles del jugador
    bullets = bullets.filter(bullet => {
        bullet.y -= bulletSpeed;
        
        // Eliminar si sale de la pantalla
        if (bullet.y < 0) return false;
        
        // Colisión con aliens
        for (let alien of aliens) {
            if (alien.alive &&
                bullet.x > alien.x &&
                bullet.x < alien.x + alien.width &&
                bullet.y > alien.y &&
                bullet.y < alien.y + alien.height) {
                
                alien.alive = false;
                score += (alien.type + 1) * 10;
                updateScore();
                
                // Siguiente nivel si todos muertos
                if (aliens.every(a => !a.alive)) {
                    nextLevel();
                }
                
                return false;
            }
        }
        
        return true;
    });
    
    // Proyectiles de aliens
    alienBullets = alienBullets.filter(bullet => {
        bullet.y += alienBulletSpeed;
        
        // Eliminar si sale de la pantalla
        if (bullet.y > canvas.height) return false;
        
        // Colisión con jugador
        if (bullet.x > player.x &&
            bullet.x < player.x + player.width &&
            bullet.y > player.y &&
            bullet.y < player.y + player.height) {
            
            loseLife();
            return false;
        }
        
        return true;
    });
}

// Disparar
function shoot() {
    const now = Date.now();
    if (now - lastBulletTime > bulletCooldown) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y
        });
        lastBulletTime = now;
    }
}

// Perder vida
function loseLife() {
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Breve invulnerabilidad
        player.x = canvas.width / 2 - player.width / 2;
        alienBullets = [];
    }
}

// Actualizar vidas
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('livesDisplay');
    livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('span');
        lifeIcon.className = 'life-icon';
        lifeIcon.textContent = '🚀';
        livesDisplay.appendChild(lifeIcon);
    }
}

// Siguiente nivel
function nextLevel() {
    level++;
    alienSpeed += 0.5;
    updateScore();
    createAliens();
    bullets = [];
    alienBullets = [];
    
    // Animación de nivel
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.style.background = 'rgba(0, 0, 0, 0.8)';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>¡NIVEL ${level}!</h2>
            <p>Puntuación: ${score}</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    isPaused = true;
    setTimeout(() => {
        overlay.remove();
        isPaused = false;
    }, 2000);
}

// Actualizar puntuación
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('highScore').textContent = highScore;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceInvadersHighScore', highScore);
    }
}

// Game Over
function gameOver() {
    cancelAnimationFrame(gameLoop);
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>GAME OVER</h2>
            <p>Puntuación Final: ${score}</p>
            <p>Nivel Alcanzado: ${level}</p>
            <p>Récord: ${highScore}</p>
            <button class="start-button" onclick="location.reload()">JUGAR DE NUEVO</button>
            <button class="back-button" onclick="window.location.href='../../index.html'">MENÚ PRINCIPAL</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Dibujar todo
function draw() {
    drawBackground();
    drawPlayer();
    drawAliens();
    drawBullets();
}

// Loop principal
function update() {
    if (!isPaused) {
        updatePlayer();
        updateAliens();
        updateBullets();
        draw();
    }
    gameLoop = requestAnimationFrame(update);
}

// Controles
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            player.leftPressed = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            player.rightPressed = true;
            e.preventDefault();
            break;
        case ' ':
            shoot();
            e.preventDefault();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            player.leftPressed = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            player.rightPressed = false;
            break;
    }
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
    difficulty = document.getElementById('difficulty').value;
    
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gameBoard').style.display = 'block';
    
    score = 0;
    level = 1;
    lives = 3;
    alienSpeed = 1;
    
    document.getElementById('highScore').textContent = highScore;
    
    initGame();
    updateScore();
    update();
});

