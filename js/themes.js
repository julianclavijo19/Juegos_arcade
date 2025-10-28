// Sistema de Temas Desbloqueables
class ThemeSystem {
    constructor() {
        this.themes = {
            classic: {
                id: 'classic',
                name: 'Arcade Clásico',
                icon: '🕹️',
                unlocked: true,
                requirement: 'Desbloqueado por defecto',
                colors: {
                    primary: '#ff006e',
                    secondary: '#3a86ff',
                    accent: '#06ffa5',
                    warning: '#ffb703',
                    background: '#1a1a2e',
                    text: '#ffffff'
                }
            },
            cyberpunk: {
                id: 'cyberpunk',
                name: 'Cyberpunk 2077',
                icon: '🌆',
                unlocked: false,
                requirement: 'Alcanza 5,000 puntos totales',
                requiredPoints: 5000,
                colors: {
                    primary: '#ff003c',
                    secondary: '#00f0ff',
                    accent: '#fcee0c',
                    warning: '#ff6b00',
                    background: '#0a0e27',
                    text: '#e0e0e0'
                }
            },
            neon: {
                id: 'neon',
                name: 'Neón Sintético',
                icon: '💎',
                unlocked: false,
                requirement: 'Desbloquea 10 logros',
                requiredAchievements: 10,
                colors: {
                    primary: '#ff00ff',
                    secondary: '#00ffff',
                    accent: '#ff00aa',
                    warning: '#ffff00',
                    background: '#0d0221',
                    text: '#f0f0f0'
                }
            },
            retro_green: {
                id: 'retro_green',
                name: 'Terminal Retro',
                icon: '💻',
                unlocked: false,
                requirement: 'Juega 20 partidas',
                requiredGames: 20,
                colors: {
                    primary: '#00ff00',
                    secondary: '#00cc00',
                    accent: '#00ff99',
                    warning: '#ffff00',
                    background: '#001100',
                    text: '#00ff00'
                }
            },
            sunset: {
                id: 'sunset',
                name: 'Atardecer Vaporwave',
                icon: '🌅',
                unlocked: false,
                requirement: 'Alcanza nivel 10 en cualquier juego',
                requiredLevel: 10,
                colors: {
                    primary: '#ff6ec7',
                    secondary: '#ff9a56',
                    accent: '#ffd93d',
                    warning: '#ff1654',
                    background: '#1a1a3e',
                    text: '#fff5f5'
                }
            },
            matrix: {
                id: 'matrix',
                name: 'Matrix Code',
                icon: '💚',
                unlocked: false,
                requirement: 'Completa todos los juegos',
                requiredAllGames: true,
                colors: {
                    primary: '#00ff41',
                    secondary: '#008f11',
                    accent: '#00ff88',
                    warning: '#39ff14',
                    background: '#000000',
                    text: '#00ff41'
                }
            }
        };
        
        this.currentTheme = 'classic';
        this.loadTheme();
        this.checkUnlocks();
    }
    
    loadTheme() {
        const saved = localStorage.getItem('arcadeCurrentTheme');
        if (saved && this.themes[saved] && this.themes[saved].unlocked) {
            this.currentTheme = saved;
        }
        
        const savedUnlocks = localStorage.getItem('arcadeThemesUnlocked');
        if (savedUnlocks) {
            const unlocked = JSON.parse(savedUnlocks);
            unlocked.forEach(themeId => {
                if (this.themes[themeId]) {
                    this.themes[themeId].unlocked = true;
                }
            });
        }
        
        this.applyTheme(this.currentTheme);
    }
    
    saveTheme() {
        localStorage.setItem('arcadeCurrentTheme', this.currentTheme);
        
        const unlocked = Object.values(this.themes)
            .filter(t => t.unlocked)
            .map(t => t.id);
        localStorage.setItem('arcadeThemesUnlocked', JSON.stringify(unlocked));
    }
    
    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme || !theme.unlocked) return;
        
        this.currentTheme = themeId;
        
        // Aplicar variables CSS
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-warning', theme.colors.warning);
        root.style.setProperty('--color-background', theme.colors.background);
        root.style.setProperty('--color-text', theme.colors.text);
        
        this.saveTheme();
        
        // Efecto visual al cambiar tema
        document.body.style.animation = 'none';
        setTimeout(() => {
            document.body.style.animation = 'themeChange 0.5s ease';
        }, 10);
    }
    
    checkUnlocks() {
        const stats = window.statsSystem ? window.statsSystem.getStats() : null;
        const achievements = window.achievementSystem ? window.achievementSystem.getProgress() : null;
        
        if (!stats) return;
        
        // Cyberpunk - 5000 puntos
        if (stats.totalScore >= 5000 && !this.themes.cyberpunk.unlocked) {
            this.unlockTheme('cyberpunk');
        }
        
        // Neon - 10 logros
        if (achievements && achievements.unlocked >= 10 && !this.themes.neon.unlocked) {
            this.unlockTheme('neon');
        }
        
        // Retro Green - 20 partidas
        if (stats.totalGamesPlayed >= 20 && !this.themes.retro_green.unlocked) {
            this.unlockTheme('retro_green');
        }
        
        // Sunset - Nivel 10
        const hasLevel10 = Object.values(stats.games).some(game => 
            game.bestLevel >= 10
        );
        if (hasLevel10 && !this.themes.sunset.unlocked) {
            this.unlockTheme('sunset');
        }
        
        // Matrix - Todos los juegos
        const allGamesPlayed = Object.values(stats.games).every(game => game.played > 0);
        if (allGamesPlayed && !this.themes.matrix.unlocked) {
            this.unlockTheme('matrix');
        }
    }
    
    unlockTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme || theme.unlocked) return;
        
        theme.unlocked = true;
        this.saveTheme();
        
        // Notificación
        this.showUnlockNotification(theme);
        
        if (window.soundSystem) {
            window.soundSystem.playPowerUp();
        }
    }
    
    showUnlockNotification(theme) {
        const notification = document.createElement('div');
        notification.className = 'theme-unlock-notification';
        notification.innerHTML = `
            <div class="theme-unlock-content">
                <div class="theme-unlock-icon">${theme.icon}</div>
                <div class="theme-unlock-text">
                    <div class="theme-unlock-title">¡NUEVO TEMA DESBLOQUEADO!</div>
                    <div class="theme-unlock-name">${theme.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
    
    getUnlockedThemes() {
        return Object.values(this.themes).filter(t => t.unlocked);
    }
    
    getAllThemes() {
        return Object.values(this.themes);
    }
}

// Instancia global
window.themeSystem = new ThemeSystem();

