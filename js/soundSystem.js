// Sistema de Sonidos Arcade 8-bit
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSettings();
        } catch (e) {
            console.warn('Web Audio API no soportada');
            this.enabled = false;
        }
    }
    
    loadSettings() {
        const savedVolume = localStorage.getItem('arcadeVolume');
        const savedEnabled = localStorage.getItem('arcadeSoundEnabled');
        
        if (savedVolume !== null) this.masterVolume = parseFloat(savedVolume);
        if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
    }
    
    saveSettings() {
        localStorage.setItem('arcadeVolume', this.masterVolume.toString());
        localStorage.setItem('arcadeSoundEnabled', this.enabled.toString());
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
    }
    
    // Generar tono básico
    playTone(frequency, duration, type = 'square', volume = 1) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.masterVolume * volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Sonidos específicos del arcade
    playMenuSelect() {
        this.playTone(800, 0.1, 'square', 0.3);
    }
    
    playMenuHover() {
        this.playTone(600, 0.05, 'sine', 0.2);
    }
    
    playButtonClick() {
        this.playTone(1200, 0.05, 'square', 0.25);
    }
    
    playGameStart() {
        this.playTone(523.25, 0.1, 'square', 0.4);
        setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.4), 100);
        setTimeout(() => this.playTone(783.99, 0.15, 'square', 0.4), 200);
    }
    
    playGameOver() {
        this.playTone(392, 0.15, 'square', 0.4);
        setTimeout(() => this.playTone(329.63, 0.15, 'square', 0.4), 150);
        setTimeout(() => this.playTone(261.63, 0.3, 'square', 0.4), 300);
    }
    
    playVictory() {
        const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.15, 'square', 0.4), i * 80);
        });
    }
    
    playScorePoint() {
        this.playTone(1046.5, 0.1, 'square', 0.35);
        setTimeout(() => this.playTone(1318.51, 0.1, 'triangle', 0.35), 50);
    }
    
    playCollision() {
        this.playNoise(0.1, 0.3);
    }
    
    playShoot() {
        this.playTone(1200, 0.05, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(900, 0.05, 'sawtooth', 0.3), 30);
        setTimeout(() => this.playTone(600, 0.05, 'sawtooth', 0.2), 60);
    }
    
    playExplosion() {
        this.playNoise(0.3, 0.5);
    }
    
    playPowerUp() {
        const notes = [261.63, 329.63, 392, 523.25, 659.25];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.08, 'sine', 0.4), i * 40);
        });
    }
    
    playMove() {
        this.playTone(440, 0.05, 'sine', 0.25);
    }
    
    playLineClear() {
        this.playTone(880, 0.1, 'square', 0.4);
        setTimeout(() => this.playTone(1046.5, 0.15, 'square', 0.4), 100);
    }
    
    playLevelUp() {
        const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        melody.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.12, 'square', 0.4), i * 60);
        });
    }
    
    playAchievement() {
        const notes = [659.25, 659.25, 783.99, 1046.5];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.15, 'sine', 0.45), i * 100);
        });
    }
    
    // Generar ruido blanco
    playNoise(duration, volume = 1) {
        if (!this.enabled || !this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        noise.buffer = buffer;
        noise.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(this.masterVolume * volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        noise.start(this.audioContext.currentTime);
    }
    
    // Música de fondo simple (loop)
    playBackgroundMusic() {
        if (!this.enabled || !this.audioContext) return;
        
        const melody = [
            { note: 523.25, duration: 0.2 },
            { note: 587.33, duration: 0.2 },
            { note: 659.25, duration: 0.2 },
            { note: 587.33, duration: 0.2 },
            { note: 523.25, duration: 0.3 },
            { note: 392, duration: 0.3 }
        ];
        
        let time = 0;
        melody.forEach(({ note, duration }) => {
            setTimeout(() => {
                if (this.enabled) {
                    this.playTone(note, duration * 0.8, 'square', 0.15);
                }
            }, time * 1000);
            time += duration;
        });
    }
}

// Instancia global
window.soundSystem = new SoundSystem();

