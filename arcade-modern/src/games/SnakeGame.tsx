import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

const CELL_SIZE = 20;
const GRID_SIZE = 20;
const CANVAS_SIZE = CELL_SIZE * GRID_SIZE;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const speedMap = { slow: 150, normal: 100, fast: 60 };

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff006e';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        segment.x * CELL_SIZE + CELL_SIZE,
        segment.y * CELL_SIZE + CELL_SIZE
      );
      
      if (isHead) {
        gradient.addColorStop(0, '#06ffa5');
        gradient.addColorStop(1, '#00d489');
      } else {
        gradient.addColorStop(0, '#3a86ff');
        gradient.addColorStop(1, '#2d6fd6');
      }
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = isHead ? '#06ffa5' : '#3a86ff';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      ctx.shadowBlur = 0;
    });
  }, [snake, food]);

  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameStarted || paused || gameOver) return;

    setDirection(nextDirection);

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (nextDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (checkCollision(head, prevSnake.slice(1))) {
        endGame();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        
        // Achievements
        if (newSnake.length === 10) addAchievement('Serpiente Creciente', 'snake');
        if (newSnake.length === 50) addAchievement('Serpiente Gigante', 'snake');
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameStarted, paused, gameOver, nextDirection, food, checkCollision, generateFood, addAchievement]);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const won = score >= 200;
    
    updateGameStats('snake', {
      gamesPlayed: 1,
      gamesWon: won ? 1 : 0,
      gamesLost: won ? 0 : 1,
      highScore: Math.max(score, highScore),
      totalScore: score,
      totalTime: timePlayed,
    });
    
    if (score > highScore) {
      setHighScore(score);
    }
    
    if (score >= 100) addAchievement('Centurión', 'snake');
    if (score >= 500) addAchievement('Maestro Snake', 'snake');
  }, [score, highScore, updateGameStats, addAchievement]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setFood(generateFood([{ x: 10, y: 10 }]));
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
  }, [generateFood]);

  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || paused) return;

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      
      if (deltaTime > speedMap[speed]) {
        moveSnake();
        lastTimeRef.current = time;
      }
      
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, speed, moveSnake, drawGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, direction, togglePause]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-green">SNAKE</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🐍 La serpiente hambrienta clásica
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4">📊 ESTADÍSTICAS</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Puntuación</div>
                  <div className="text-3xl sm:text-4xl font-bold neon-text-green">{score}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Longitud</div>
                  <div className="text-2xl sm:text-3xl font-bold neon-text-blue">{snake.length}</div>
                </div>
                {highScore > 0 && (
                  <div>
                    <div className="text-white/60 text-sm mb-1">Récord</div>
                    <div className="text-xl sm:text-2xl font-bold neon-text-yellow">{highScore}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-blue mb-3">⚡ VELOCIDAD</h3>
              <div className="flex gap-2">
                {(['slow', 'normal', 'fast'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    disabled={gameStarted && !gameOver}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      speed === s
                        ? 'bg-neon-blue text-white shadow-neon-blue'
                        : 'glass text-white/60 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    {s === 'slow' && '🐢'}
                    {s === 'normal' && '🏃'}
                    {s === 'fast' && '⚡'}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-purple mb-3">🎮 CONTROLES</h3>
              <div className="space-y-2 text-xs sm:text-sm text-white/70">
                <div className="flex justify-between gap-4">
                  <span>↑ ↓ ← → WASD</span>
                  <span>Mover</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>P ESC</span>
                  <span>Pausar</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center - Game Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mx-auto"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-green/50">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="rounded-lg shadow-neon-green mx-auto"
              />

              <AnimatePresence>
                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="text-center p-4">
                      <motion.h2
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold neon-text-pink mb-4"
                      >
                        GAME OVER
                      </motion.h2>
                      <div className="mb-4">
                        <p className="text-xl sm:text-2xl text-neon-yellow mb-2">Puntuación Final</p>
                        <p className="text-3xl sm:text-4xl font-bold neon-text-green">{score}</p>
                        <p className="text-lg text-white/60 mt-2">Longitud: {snake.length}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startGame}
                          className="btn-neon btn-green px-6 py-3 text-sm sm:text-base"
                        >
                          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                          REINTENTAR
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/')}
                          className="btn-neon btn-blue px-6 py-3 text-sm sm:text-base"
                        >
                          <Home className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                          MENÚ
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paused && !gameOver && gameStarted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.h2
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-5xl sm:text-6xl font-bold neon-text-blue mb-4"
                      >
                        PAUSA
                      </motion.h2>
                      <p className="text-white/70">Presiona P o ESC</p>
                    </div>
                  </motion.div>
                )}

                {!gameStarted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="text-center p-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="btn-neon btn-green px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-2xl"
                      >
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 inline mr-3" fill="currentColor" />
                        INICIAR
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                disabled={!gameStarted || gameOver}
                className="flex-1 btn-neon btn-blue py-2 sm:py-3 disabled:opacity-50 text-sm sm:text-base"
              >
                {paused ? <Play className="w-4 h-4 sm:w-5 sm:h-5" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="flex-1 btn-neon btn-green py-2 sm:py-3 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="flex-1 btn-neon btn-pink py-2 sm:py-3 text-sm sm:text-base"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
              <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                OBJETIVOS
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/70">
                <li>🎯 Come para crecer</li>
                <li>🎯 No choques con paredes</li>
                <li>🎯 No te muerdas la cola</li>
                <li>🎯 Alcanza 100 puntos</li>
                <li>🎯 Longitud 50 (épico)</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🏆 LOGROS</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>🏆 Centurión (100 pts)</li>
                <li>🏆 Serpiente Creciente (10 largo)</li>
                <li>🏆 Serpiente Gigante (50 largo)</li>
                <li>🏆 Maestro Snake (500 pts)</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-pink mb-3">💡 CONSEJO</h3>
              <p className="text-xs sm:text-sm text-white/70">
                ¡Planifica tu camino! No te encierres a ti mismo. 
                Mantén espacio para maniobrar mientras creces.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;

