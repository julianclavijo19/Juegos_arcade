// Sistema de Estadísticas y Leaderboard
class StatsSystem {
    constructor() {
        this.stats = {
            totalGamesPlayed: 0,
            totalScore: 0,
            totalTimePlayed: 0, // en segundos
            games: {
                tetris: {
                    played: 0,
                    bestScore: 0,
                    bestLevel: 0,
                    totalLines: 0,
                    timePlayed: 0
                },
                tictactoe: {
                    played: 0,
                    wins: 0,
                    losses: 0,
                    ties: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    timePlayed: 0
                },
                snake: {
                    played: 0,
                    bestScore: 0,
                    bestLength: 0,
                    timePlayed: 0
                },
                pong: {
                    played: 0,
                    wins: 0,
                    losses: 0,
                    bestScore: 0,
                    timePlayed: 0
                },
                spaceinvaders: {
                    played: 0,
                    bestScore: 0,
                    bestLevel: 0,
                    totalKills: 0,
                    timePlayed: 0
                },
                connectfour: {
                    played: 0,
                    wins: 0,
                    losses: 0,
                    ties: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    timePlayed: 0
                }
            }
        };
        
        this.loadStats();
        this.currentGameStart = null;
    }
    
    loadStats() {
        const saved = localStorage.getItem('arcadeStats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }
    
    saveStats() {
        localStorage.setItem('arcadeStats', JSON.stringify(this.stats));
    }
    
    startGame(gameName) {
        this.currentGameStart = Date.now();
        this.currentGame = gameName;
    }
    
    endGame(gameName, result = {}) {
        // Calcular tiempo jugado
        if (this.currentGameStart) {
            const timePlayed = Math.floor((Date.now() - this.currentGameStart) / 1000);
            this.stats.games[gameName].timePlayed += timePlayed;
            this.stats.totalTimePlayed += timePlayed;
        }
        
        // Incrementar juegos jugados
        this.stats.games[gameName].played++;
        this.stats.totalGamesPlayed++;
        
        // Actualizar estadísticas específicas según el juego
        this.updateGameStats(gameName, result);
        
        // Guardar
        this.saveStats();
        
        // Verificar logros generales
        if (window.achievementSystem) {
            window.achievementSystem.checkGeneralAchievements();
        }
        
        this.currentGameStart = null;
    }
    
    updateGameStats(gameName, result) {
        const gameStats = this.stats.games[gameName];
        
        switch(gameName) {
            case 'tetris':
                if (result.score > gameStats.bestScore) {
                    gameStats.bestScore = result.score;
                }
                if (result.level > gameStats.bestLevel) {
                    gameStats.bestLevel = result.level;
                }
                if (result.lines) {
                    gameStats.totalLines += result.lines;
                }
                this.stats.totalScore += result.score || 0;
                
                // Logros
                if (window.achievementSystem) {
                    if (result.lines >= 1) {
                        window.achievementSystem.unlock('tetris_first_win');
                    }
                    if (result.level >= 10) {
                        window.achievementSystem.unlock('tetris_level_10');
                    }
                }
                break;
                
            case 'snake':
                if (result.score > gameStats.bestScore) {
                    gameStats.bestScore = result.score;
                }
                if (result.length > gameStats.bestLength) {
                    gameStats.bestLength = result.length;
                }
                this.stats.totalScore += result.score || 0;
                
                // Logros
                if (window.achievementSystem && result.length >= 20) {
                    window.achievementSystem.unlock('snake_length_20');
                }
                break;
                
            case 'tictactoe':
                if (result.win) {
                    gameStats.wins++;
                    gameStats.currentStreak++;
                    if (gameStats.currentStreak > gameStats.bestStreak) {
                        gameStats.bestStreak = gameStats.currentStreak;
                    }
                } else if (result.loss) {
                    gameStats.losses++;
                    gameStats.currentStreak = 0;
                } else if (result.tie) {
                    gameStats.ties++;
                }
                
                // Logros
                if (window.achievementSystem) {
                    if (result.win && result.difficulty === 'hard') {
                        window.achievementSystem.unlock('tictactoe_win_hard');
                    }
                    if (gameStats.currentStreak >= 5) {
                        window.achievementSystem.unlock('tictactoe_streak_5');
                    }
                }
                break;
                
            case 'pong':
                if (result.win) {
                    gameStats.wins++;
                } else {
                    gameStats.losses++;
                }
                if (result.score > gameStats.bestScore) {
                    gameStats.bestScore = result.score;
                }
                this.stats.totalScore += result.score || 0;
                
                // Logros
                if (window.achievementSystem) {
                    if (result.win && result.opponentScore === 0) {
                        window.achievementSystem.unlock('pong_perfect');
                    }
                }
                break;
                
            case 'spaceinvaders':
                if (result.score > gameStats.bestScore) {
                    gameStats.bestScore = result.score;
                }
                if (result.level > gameStats.bestLevel) {
                    gameStats.bestLevel = result.level;
                }
                if (result.kills) {
                    gameStats.totalKills += result.kills;
                }
                this.stats.totalScore += result.score || 0;
                
                // Logros
                if (window.achievementSystem && result.level >= 5) {
                    window.achievementSystem.unlock('space_level_5');
                }
                break;
                
            case 'connectfour':
                if (result.win) {
                    gameStats.wins++;
                    gameStats.currentStreak++;
                    if (gameStats.currentStreak > gameStats.bestStreak) {
                        gameStats.bestStreak = gameStats.currentStreak;
                    }
                    
                    // Logro
                    if (window.achievementSystem) {
                        if (result.difficulty === 'hard') {
                            window.achievementSystem.unlock('connect_win_hard');
                        }
                        if (result.winType === 'diagonal') {
                            window.achievementSystem.unlock('connect_diagonal');
                        }
                    }
                } else if (result.loss) {
                    gameStats.losses++;
                    gameStats.currentStreak = 0;
                } else if (result.tie) {
                    gameStats.ties++;
                }
                break;
        }
    }
    
    getStats() {
        return this.stats;
    }
    
    getGameStats(gameName) {
        return this.stats.games[gameName];
    }
    
    getLeaderboard() {
        const games = Object.keys(this.stats.games).map(gameName => {
            const gameStats = this.stats.games[gameName];
            let score = 0;
            
            // Calcular puntuación según tipo de juego
            if (gameName === 'tetris' || gameName === 'snake' || gameName === 'spaceinvaders') {
                score = gameStats.bestScore;
            } else if (gameName === 'tictactoe' || gameName === 'connectfour') {
                score = gameStats.wins;
            } else if (gameName === 'pong') {
                score = gameStats.wins;
            }
            
            return {
                game: gameName,
                score: score,
                played: gameStats.played
            };
        });
        
        return games.sort((a, b) => b.score - a.score);
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
    
    reset() {
        if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
            localStorage.removeItem('arcadeStats');
            localStorage.removeItem('arcadeAchievements');
            location.reload();
        }
    }
}

// Instancia global
window.statsSystem = new StatsSystem();

