# 🎮 ARCADE RETRO - Juegos Clásicos

Una colección de 6 juegos clásicos completamente funcionales con un diseño retro tipo máquina arcade. Todos los juegos están implementados en HTML5, CSS3 y JavaScript vanilla, sin necesidad de dependencias externas.

## 🕹️ Juegos Incluidos

### 1. **Tetris** 🎮
- **Tipo:** 1 Jugador
- **Dificultades:** Fácil, Medio, Difícil
- **Características:**
  - Sistema de puntuación y niveles
  - Vista previa de la siguiente pieza
  - Velocidad progresiva según el nivel
  - Controles: Flechas para mover/rotar, Espacio para rotar

### 2. **Tres en Raya (Tic-Tac-Toe)** ❌⭕
- **Tipo:** 1-2 Jugadores
- **Modos:** vs IA o 2 Jugadores
- **Dificultades IA:** Fácil, Medio, Imposible
- **Características:**
  - IA implementada con algoritmo Minimax
  - Seguimiento de puntuación
  - Animaciones de colocación de fichas
  - Detección automática de victoria/empate

### 3. **Snake** 🐍
- **Tipo:** 1 Jugador
- **Dificultades:** Lento, Normal, Rápido
- **Características:**
  - Récord guardado localmente
  - Velocidad progresiva
  - Efectos visuales mejorados
  - Controles: Flechas o WASD, botones móviles

### 4. **Pong** 🏓
- **Tipo:** 1-2 Jugadores
- **Modos:** vs IA o 2 Jugadores
- **Dificultades IA:** Fácil, Medio, Difícil
- **Características:**
  - Física de colisión realista
  - Puntos configurables (5, 10, 15, 21)
  - IA con diferentes niveles de habilidad
  - Controles: Jugador 1 (W/S), Jugador 2 (Flechas)

### 5. **Space Invaders** 👾
- **Tipo:** 1 Jugador
- **Dificultades:** Pocos enemigos, Normal, Muchos enemigos
- **Características:**
  - Sistema de niveles infinito
  - Récord guardado localmente
  - 3 tipos de enemigos
  - Sistema de vidas
  - Controles: Flechas o A/D para mover, Espacio para disparar

### 6. **Connect Four (4 en línea)** 🔴🟡
- **Tipo:** 1-2 Jugadores
- **Modos:** vs IA o 2 Jugadores
- **Dificultades IA:** Fácil, Medio, Difícil
- **Características:**
  - IA estratégica que bloquea y ataca
  - Detección de victoria en todas las direcciones
  - Animaciones de caída de fichas
  - Seguimiento de puntuación

## 🎨 Características de Diseño

- **Tema Retro Arcade:** Diseño inspirado en las clásicas máquinas arcade de los 80s y 90s
- **Efectos Neón:** Textos y bordes con efectos de luz neón
- **Animaciones Suaves:** Transiciones y animaciones fluidas
- **Responsive:** Adaptable a diferentes tamaños de pantalla
- **Paleta de Colores Vibrante:** Colores brillantes y atractivos

## 🚀 Cómo Usar

1. **Abrir el proyecto:**
   - Simplemente abre el archivo `index.html` en tu navegador web

2. **Seleccionar un juego:**
   - Haz clic en cualquier tarjeta de juego del menú principal

3. **Configurar:**
   - Selecciona la dificultad y modo de juego según tus preferencias
   - Haz clic en "INICIAR JUEGO"

4. **Jugar:**
   - Sigue las instrucciones de controles de cada juego
   - Presiona P para pausar en cualquier momento

5. **Volver al menú:**
   - Usa el botón "VOLVER AL MENÚ" en cualquier momento

## 📁 Estructura del Proyecto

```
Juegos/
├── index.html              # Página principal con menú de juegos
├── README.md              # Este archivo
├── css/
│   └── styles.css         # Estilos globales con tema arcade
├── js/
│   └── main.js           # Lógica del menú principal
└── games/
    ├── tetris/
    │   ├── tetris.html
    │   └── tetris.js
    ├── tictactoe/
    │   ├── tictactoe.html
    │   └── tictactoe.js
    ├── snake/
    │   ├── snake.html
    │   └── snake.js
    ├── pong/
    │   ├── pong.html
    │   └── pong.js
    ├── spaceinvaders/
    │   ├── spaceinvaders.html
    │   └── spaceinvaders.js
    └── connectfour/
        ├── connectfour.html
        └── connectfour.js
```

## 🎯 Tecnologías Utilizadas

- **HTML5:** Estructura semántica y Canvas API para los juegos
- **CSS3:** Estilos avanzados con gradientes, animaciones y efectos
- **JavaScript:** Lógica del juego, IA, y manipulación del DOM
- **LocalStorage:** Para guardar récords personales

## 🎮 Controles Generales

### Todos los juegos:
- **P:** Pausar/Reanudar

### Tetris:
- **Flechas:** Mover y rotar
- **Espacio:** Rotar pieza

### Snake:
- **Flechas:** Cambiar dirección

### Pong:
- **Jugador 1:** W (arriba), S (abajo)
- **Jugador 2:** Flechas arriba/abajo

### Space Invaders:
- **A/D o Flechas:** Mover nave
- **Espacio:** Disparar

### Tres en Raya & Connect Four:
- **Mouse/Click:** Seleccionar casilla/columna

## 🌟 Características Técnicas

- **Sin dependencias:** 100% JavaScript vanilla
- **Optimizado:** Usa requestAnimationFrame para animaciones suaves
- **Responsive:** Se adapta a móviles y tablets
- **IA Avanzada:** Algoritmos Minimax y estrategias inteligentes
- **Persistencia:** Récords guardados en LocalStorage

## 🎨 Paleta de Colores

- **Rosa Neón:** #ff006e
- **Azul Eléctrico:** #3a86ff
- **Verde Neón:** #06ffa5
- **Amarillo Arcade:** #ffb703
- **Púrpura:** #8338ec
- **Fondo Oscuro:** #1a1a2e

## 📱 Compatibilidad

- ✅ Chrome (Recomendado)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Opera
- ✅ Navegadores móviles modernos

## 🎉 Disfruta Jugando!

Este proyecto fue creado con pasión por los juegos clásicos. ¡Que lo disfrutes!

---

**Nota:** No se requiere instalación ni configuración. Simplemente abre `index.html` y comienza a jugar.

