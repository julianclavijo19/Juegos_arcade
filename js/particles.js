// Sistema de Partículas para efectos visuales
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
    }
    
    createParticle(x, y, options = {}) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * (options.speed || 4),
            vy: (Math.random() - 0.5) * (options.speed || 4),
            life: options.life || 1.0,
            decay: options.decay || 0.02,
            size: options.size || 3,
            color: options.color || '#ff006e',
            shape: options.shape || 'circle',
            gravity: options.gravity || 0
        };
        
        this.particles.push(particle);
    }
    
    createExplosion(x, y, count = 20, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = options.speed || 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed * (0.5 + Math.random()),
                vy: Math.sin(angle) * speed * (0.5 + Math.random()),
                life: 1.0,
                decay: options.decay || 0.02,
                size: options.size || 4,
                color: options.color || '#ff006e',
                shape: 'circle',
                gravity: options.gravity || 0.1
            });
        }
    }
    
    createConfetti(x, y, count = 30) {
        const colors = ['#ff006e', '#3a86ff', '#06ffa5', '#ffb703', '#8338ec'];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 3,
                life: 1.0,
                decay: 0.015,
                size: 5 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? 'square' : 'circle',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                gravity: 0.2
            });
        }
    }
    
    createTrail(x, y, color = '#06ffa5', count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 0.8,
                decay: 0.05,
                size: 2 + Math.random() * 2,
                color: color,
                shape: 'circle',
                gravity: 0
            });
        }
    }
    
    createStars(x, y, count = 10) {
        const colors = ['#ffb703', '#ffd93d', '#fff'];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.03,
                size: 3 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: 'star',
                rotation: 0,
                rotationSpeed: 0.1,
                gravity: 0
            });
        }
    }
    
    createTextFloat(x, y, text, color = '#06ffa5') {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -1.5,
            life: 1.0,
            decay: 0.015,
            size: 20,
            color: color,
            shape: 'text',
            text: text,
            gravity: 0
        });
    }
    
    update() {
        this.particles = this.particles.filter(particle => {
            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            
            // Actualizar vida
            particle.life -= particle.decay;
            
            // Actualizar rotación si existe
            if (particle.rotation !== undefined) {
                particle.rotation += particle.rotationSpeed;
            }
            
            // Mantener solo partículas vivas
            return particle.life > 0;
        });
    }
    
    draw() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            
            if (particle.shape === 'circle') {
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Glow effect
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.fill();
            } 
            else if (particle.shape === 'square') {
                this.ctx.fillStyle = particle.color;
                this.ctx.translate(particle.x, particle.y);
                if (particle.rotation) this.ctx.rotate(particle.rotation);
                this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            }
            else if (particle.shape === 'star') {
                this.drawStar(particle.x, particle.y, particle.size, particle.color, particle.rotation);
            }
            else if (particle.shape === 'text') {
                this.ctx.font = `bold ${particle.size}px 'Courier New'`;
                this.ctx.fillStyle = particle.color;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.fillText(particle.text, particle.x, particle.y);
            }
            
            this.ctx.restore();
        });
    }
    
    drawStar(x, y, size, color, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x1 = Math.cos(angle) * size;
            const y1 = Math.sin(angle) * size;
            
            if (i === 0) {
                this.ctx.moveTo(x1, y1);
            } else {
                this.ctx.lineTo(x1, y1);
            }
            
            const angle2 = angle + Math.PI / 5;
            const x2 = Math.cos(angle2) * (size * 0.4);
            const y2 = Math.sin(angle2) * (size * 0.4);
            this.ctx.lineTo(x2, y2);
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    clear() {
        this.particles = [];
    }
    
    // Screen shake effect
    static screenShake(element, intensity = 5, duration = 300) {
        const originalTransform = element.style.transform;
        const startTime = Date.now();
        
        function shake() {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const progress = 1 - (elapsed / duration);
                const x = (Math.random() - 0.5) * intensity * progress;
                const y = (Math.random() - 0.5) * intensity * progress;
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                element.style.transform = originalTransform;
            }
        }
        
        shake();
    }
}

// Función de utilidad global
window.screenShake = (intensity, duration) => {
    const gameBoard = document.querySelector('.game-board') || document.body;
    ParticleSystem.screenShake(gameBoard, intensity, duration);
};

