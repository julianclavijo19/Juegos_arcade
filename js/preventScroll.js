// Prevenir scroll con flechas del teclado globalmente
document.addEventListener('keydown', function(e) {
    // Prevenir scroll solo si estamos en una página de juego o si es una tecla de juego
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    
    // Si estamos en un input o select, no prevenir
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'SELECT' || 
        e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Prevenir scroll para teclas de juego
    if (gameKeys.includes(e.key)) {
        e.preventDefault();
    }
}, { passive: false });

// Prevenir scroll con la barra espaciadora
window.addEventListener('keydown', function(e) {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

