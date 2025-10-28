# Changelog - Arcade Retro

## Versión 2.1 - Correcciones de UX y Responsive (Actual)

### 🐛 Correcciones de Bugs

#### Problema 1: Dropdowns cortados en dispositivos móviles
**Síntoma:** Al abrir los selectores de dificultad o modo de juego, el menú desplegable se cortaba o no se veía completamente.

**Solución:**
- ✅ Agregado `overflow: visible` a `.game-settings`, `.setting-group`, `.game-board` y `.game-container`
- ✅ Agregado `z-index: 100` a los selectores para que aparezcan sobre otros elementos
- ✅ Mejorado el responsive con `max-width: 100%` y `width: auto` en los selectores
- ✅ Agregado media query específico para móviles con mejor espaciado

**Archivos modificados:**
- `css/styles.css` - Líneas 422-474, 485, 998-1020

#### Problema 2: Las flechas del teclado mueven la página
**Síntoma:** Al presionar las flechas del teclado durante el juego, además de mover el personaje/pieza, también se desplazaba la página hacia arriba/abajo/izquierda/derecha.

**Solución:**
- ✅ Creado script global `js/preventScroll.js` que previene el scroll con flechas del teclado
- ✅ Agregado `preventDefault()` en todos los eventos de teclado de Tetris
- ✅ Detecta automáticamente cuando estás en un input/select para no interferir
- ✅ Incluido el script en todos los juegos

**Archivos creados:**
- `js/preventScroll.js` - Nuevo archivo

**Archivos modificados:**
- `games/tetris/tetris.html` - Agregado script preventScroll
- `games/tetris/tetris.js` - Agregado preventDefault() a todos los controles
- `games/snake/snake.html` - Agregado script preventScroll
- `games/pong/pong.html` - Agregado script preventScroll
- `games/spaceinvaders/spaceinvaders.html` - Agregado script preventScroll
- `games/tictactoe/tictactoe.html` - Agregado script preventScroll
- `games/connectfour/connectfour.html` - Agregado script preventScroll

### 📱 Mejoras de Responsive

- ✅ Selectores con tamaño mínimo de 150px en móvil
- ✅ Labels en display block en dispositivos pequeños
- ✅ Padding reducido en configuración de juegos para móviles
- ✅ Font-size ajustado para mejor legibilidad

---

## Versión 2.0 - Versión Ultra Mejorada

### ✨ Nuevas Características

#### 🎵 Sistema de Sonidos 8-bit
- Generación de sonidos con Web Audio API
- 15+ efectos de sonido diferentes
- Control de volumen y toggle on/off
- Efectos específicos por juego

#### ✨ Sistema de Partículas
- Explosiones, confetti, estrellas
- Efectos de trail y texto flotante
- Screen shake
- Animaciones 60 FPS

#### 🏆 Sistema de Logros
- 17+ logros desbloqueables
- Notificaciones animadas
- Progreso por porcentaje
- Persistencia local

#### 📊 Sistema de Estadísticas
- Tiempo jugado
- Mejores puntuaciones
- Rachas ganadoras
- LocalStorage

#### 🎨 Temas Desbloqueables
- 6 temas únicos
- Variables CSS dinámicas
- Sistema de desbloqueo por logros

#### 📱 PWA
- Instalable
- Funciona offline
- Service Worker

#### ⚙️ Panel de Configuración
- Menú lateral
- Control de audio
- Selector de temas
- Estadísticas en tiempo real

---

## Versión 1.0 - Versión Original

### 🎮 Características Iniciales
- 6 juegos clásicos funcionales
- Diseño retro arcade
- IA con algoritmo Minimax
- Responsive básico
- Sin sonidos ni efectos especiales

---

## Próximas Mejoras Planeadas (v2.2)

### 🎯 En Desarrollo
- [ ] Iconos PWA personalizados
- [ ] Más efectos de partículas
- [ ] Música de fondo continua
- [ ] Más logros específicos por juego
- [ ] Tutorial interactivo
- [ ] Leaderboard en la nube

### 💡 Ideas Futuras
- [ ] Más juegos (Breakout, Pac-Man)
- [ ] Modo competitivo online
- [ ] Compartir en redes sociales
- [ ] Editor de temas personalizado
- [ ] Desafíos diarios

---

**Última actualización:** Versión 2.1
**Fecha:** 2025

