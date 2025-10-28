// Sistema de Logros/Achievements
class AchievementSystem {
    constructor() {
        this.achievements = {
            // Generales
            'first_game': {
                id: 'first_game',
                name: 'Primera Partida',
                description: 'Juega tu primer juego',
                icon: '🎮',
                unlocked: false,
                game: 'general'
            },
            'play_all': {
                id: 'play_all',
                name: 'Explorador',
                description: 'Juega todos los juegos al menos una vez',
                icon: '🗺️',
                unlocked: false,
                game: 'general'
            },
            'master_player': {
                id: 'master_player',
                name: 'Maestro Jugador',
                description: 'Alcanza 10,000 puntos totales',
                icon: '👑',
                unlocked: false,
                game: 'general'
            },
            'speed_demon': {
                id: 'speed_demon',
                name: 'Demonio de Velocidad',
                description: 'Juega 50 partidas en total',
                icon: '⚡️',
                unlocked: false,
                game: 'general'
            },
            
            // Tetris
            'tetris_first_win': {
                id: 'tetris_first_win',
                name: 'Primer Bloque',
                description: 'Completa tu primera línea en Tetris',
                icon: '🧩',
                unlocked: false,
                game: 'tetris'
            },
            'tetris_combo': {
                id: 'tetris_combo',
                name: 'Combo Maestro',
                description: 'Completa 4 líneas simultáneas (Tetris)',
                icon: '💥',
                unlocked: false,
                game: 'tetris'
            },
            'tetris_level_10': {
                id: 'tetris_level_10',
                name: 'Nivel Experto',
                description: 'Alcanza el nivel 10 en Tetris',
                icon: '🏆',
                unlocked: false,
                game: 'tetris'
            },
            
            // Snake
            'snake_length_20': {
                id: 'snake_length_20',
                name: 'Serpiente Larga',
                description: 'Alcanza una longitud de 20 en Snake',
                icon: '🐍',
                unlocked: false,
                game: 'snake'
            },
            'snake_no_walls': {
                id: 'snake_no_walls',
                name: 'Fantasma',
                description: 'Sobrevive 100 segundos sin tocar paredes',
                icon: '👻',
                unlocked: false,
                game: 'snake'
            },
            
            // Tres en Raya
            'tictactoe_win_hard': {
                id: 'tictactoe_win_hard',
                name: 'Imposible Derrotado',
                description: 'Gana contra la IA en dificultad imposible',
                icon: '🧠',
                unlocked: false,
                game: 'tictactoe'
            },
            'tictactoe_streak_5': {
                id: 'tictactoe_streak_5',
                name: 'Racha Ganadora',
                description: 'Gana 5 partidas seguidas',
                icon: '🔥',
                unlocked: false,
                game: 'tictactoe'
            },
            
            // Pong
            'pong_perfect': {
                id: 'pong_perfect',
                name: 'Partida Perfecta',
                description: 'Gana sin que el oponente anote',
                icon: '🏓',
                unlocked: false,
                game: 'pong'
            },
            'pong_comeback': {
                id: 'pong_comeback',
                name: 'Remontada Épica',
                description: 'Gana después de estar 5 puntos abajo',
                icon: '💪',
                unlocked: false,
                game: 'pong'
            },
            
            // Space Invaders
            'space_level_5': {
                id: 'space_level_5',
                name: 'Defensor Galáctico',
                description: 'Alcanza el nivel 5 en Space Invaders',
                icon: '👾',
                unlocked: false,
                game: 'spaceinvaders'
            },
            'space_no_hit': {
                id: 'space_no_hit',
                name: 'Piloto Intocable',
                description: 'Completa un nivel sin recibir daño',
                icon: '✨',
                unlocked: false,
                game: 'spaceinvaders'
            },
            
            // Connect Four
            'connect_diagonal': {
                id: 'connect_diagonal',
                name: 'Estratega Diagonal',
                description: 'Gana con una línea diagonal en Connect Four',
                icon: '🎯',
                unlocked: false,
                game: 'connectfour'
            },
            'connect_win_hard': {
                id: 'connect_win_hard',
                name: 'Mente Maestra',
                description: 'Gana contra la IA en dificultad difícil',
                icon: '🧩',
                unlocked: false,
                game: 'connectfour'
            }
        };
        
        this.loadProgress();
    }
    
    loadProgress() {
        const saved = localStorage.getItem('arcadeAchievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            Object.keys(savedAchievements).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = savedAchievements[key].unlocked;
                }
            });
        }
    }
    
    saveProgress() {
        localStorage.setItem('arcadeAchievements', JSON.stringify(this.achievements));
    }
    
    unlock(achievementId) {
        const achievement = this.achievements[achievementId];
        
        if (!achievement) {
            console.warn(`Logro no encontrado: ${achievementId}`);
            return false;
        }
        
        if (achievement.unlocked) {
            return false; // Ya desbloqueado
        }
        
        achievement.unlocked = true;
        this.saveProgress();
        
        // Mostrar notificación
        this.showNotification(achievement);
        
        // Reproducir sonido
        if (window.soundSystem) {
            window.soundSystem.playAchievement();
        }
        
        return true;
    }
    
    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">¡LOGRO DESBLOQUEADO!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
    
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = Object.values(this.achievements).filter(a => a.unlocked).length;
        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100)
        };
    }
    
    getByGame(gameName) {
        return Object.values(this.achievements).filter(a => a.game === gameName);
    }
    
    getAllUnlocked() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }
    
    checkGeneralAchievements() {
        const stats = window.statsSystem ? window.statsSystem.getStats() : null;
        
        if (stats) {
            // Primera partida
            if (stats.totalGamesPlayed >= 1) {
                this.unlock('first_game');
            }
            
            // Explorador
            const gamesPlayed = Object.values(stats.games).filter(g => g.played > 0).length;
            if (gamesPlayed >= 6) {
                this.unlock('play_all');
            }
            
            // Maestro Jugador
            if (stats.totalScore >= 10000) {
                this.unlock('master_player');
            }
            
            // Demonio de velocidad
            if (stats.totalGamesPlayed >= 50) {
                this.unlock('speed_demon');
            }
        }
    }
}

// Instancia global
window.achievementSystem = new AchievementSystem();

