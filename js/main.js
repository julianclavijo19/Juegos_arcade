// Sistema de Menú Principal Mejorado
document.addEventListener('DOMContentLoaded', function() {
    initializeMenu();
    initializeSettings();
    initializePWA();
    updateUI();
    
    // Sonido de bienvenida
    setTimeout(() => {
        if (window.soundSystem) {
            window.soundSystem.playGameStart();
        }
    }, 500);
});

// Inicializar menú de juegos
function initializeMenu() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            
            // Sonido
            if (window.soundSystem) {
                window.soundSystem.playMenuSelect();
            }
            
            // Transición
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                window.location.href = `games/${game}/${game}.html`;
            }, 200);
        });
        
        // Efecto hover
        card.addEventListener('mouseenter', function() {
            if (window.soundSystem) {
                window.soundSystem.playMenuHover();
            }
        });
    });
}

// Inicializar panel de configuración
function initializeSettings() {
    const settingsButton = document.getElementById('settingsButton');
    const closeSettings = document.getElementById('closeSettings');
    const settingsPanel = document.getElementById('settingsPanel');
    
    // Abrir panel
    settingsButton.addEventListener('click', () => {
        settingsPanel.classList.add('open');
        if (window.soundSystem) {
            window.soundSystem.playButtonClick();
        }
        updateSettingsPanel();
    });
    
    // Cerrar panel
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
        if (window.soundSystem) {
            window.soundSystem.playButtonClick();
        }
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (settingsPanel.classList.contains('open') && 
            !settingsPanel.contains(e.target) && 
            !settingsButton.contains(e.target)) {
            settingsPanel.classList.remove('open');
        }
    });
    
    // Control de volumen
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (window.soundSystem) {
        volumeSlider.value = window.soundSystem.masterVolume * 100;
        volumeValue.textContent = Math.round(window.soundSystem.masterVolume * 100);
    }
    
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        volumeValue.textContent = e.target.value;
        if (window.soundSystem) {
            window.soundSystem.setVolume(volume);
        }
    });
    
    // Toggle de sonido
    const soundToggle = document.getElementById('soundToggle');
    if (window.soundSystem) {
        soundToggle.checked = window.soundSystem.enabled;
    }
    
    soundToggle.addEventListener('change', (e) => {
        if (window.soundSystem) {
            window.soundSystem.toggle();
            if (e.target.checked) {
                window.soundSystem.playButtonClick();
            }
        }
    });
    
    // Botón de reset
    document.getElementById('resetStats').addEventListener('click', () => {
        if (window.statsSystem) {
            window.statsSystem.reset();
        }
    });
}

// Actualizar panel de configuración
function updateSettingsPanel() {
    // Actualizar estadísticas
    if (window.statsSystem) {
        const stats = window.statsSystem.getStats();
        document.getElementById('totalGames').textContent = stats.totalGamesPlayed;
        document.getElementById('totalScore').textContent = stats.totalScore.toLocaleString();
        document.getElementById('totalTime').textContent = window.statsSystem.formatTime(stats.totalTimePlayed);
    }
    
    // Actualizar logros
    if (window.achievementSystem) {
        const progress = window.achievementSystem.getProgress();
        document.getElementById('achievementProgress').textContent = `${progress.percentage}%`;
        
        const achievementList = document.getElementById('achievementList');
        achievementList.innerHTML = '';
        
        const achievements = Object.values(window.achievementSystem.achievements);
        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="achievement-item-icon">${achievement.icon}</div>
                <div class="achievement-item-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievementList.appendChild(item);
        });
    }
    
    // Actualizar temas
    if (window.themeSystem) {
        const themesContainer = document.getElementById('themesContainer');
        themesContainer.innerHTML = '';
        
        const themes = window.themeSystem.getAllThemes();
        themes.forEach(theme => {
            const card = document.createElement('div');
            card.className = `theme-card ${theme.unlocked ? '' : 'locked'} ${theme.id === window.themeSystem.currentTheme ? 'active' : ''}`;
            card.innerHTML = `
                <div class="theme-icon">${theme.icon}</div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-requirement">${theme.requirement}</div>
            `;
            
            if (theme.unlocked) {
                card.addEventListener('click', () => {
                    window.themeSystem.applyTheme(theme.id);
                    updateSettingsPanel();
                    if (window.soundSystem) {
                        window.soundSystem.playButtonClick();
                    }
                });
            }
            
            themesContainer.appendChild(card);
        });
    }
}

// Actualizar UI
function updateUI() {
    // Verificar desbloqueos de temas
    if (window.themeSystem) {
        window.themeSystem.checkUnlocks();
    }
}

// Inicializar PWA
function initializePWA() {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    }
    
    // Prompt de instalación
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botón de instalación si no está instalado
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            installPrompt.classList.add('show');
        }
    });
    
    installPrompt.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('PWA instalada');
            if (window.soundSystem) {
                window.soundSystem.playPowerUp();
            }
        }
        
        deferredPrompt = null;
        installPrompt.classList.remove('show');
    });
    
    // Detectar si ya está instalado
    window.addEventListener('appinstalled', () => {
        console.log('PWA instalada exitosamente');
        installPrompt.classList.remove('show');
        if (window.achievementSystem) {
            // Podríamos agregar un logro por instalar la app
        }
    });
}

// Animación de botones del arcade
const buttons = document.querySelectorAll('.button');
buttons.forEach(button => {
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        if (window.soundSystem) {
            window.soundSystem.playButtonClick();
        }
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

// Animación del joystick
const joystick = document.querySelector('.joystick');
if (joystick) {
    let isDragging = false;
    
    joystick.addEventListener('mousedown', () => {
        isDragging = true;
        joystick.style.transform = 'scale(0.95)';
        if (window.soundSystem) {
            window.soundSystem.playMove();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            joystick.style.transform = 'scale(1)';
        }
    });
}

// Actualizar estadísticas periódicamente
setInterval(() => {
    if (document.getElementById('settingsPanel').classList.contains('open')) {
        updateUI();
    }
}, 5000);
