import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#ff006e', '#3a86ff', '#06ffa5', '#ffb703', '#8338ec', '#fb5607', '#00f5ff'];

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
];

interface Piece {
  shape: number[][];
  pos: { x: number; y: number };
  colorIndex: number;
}

const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const boardRef = useRef<number[][]>(Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
  const currentPieceRef = useRef<Piece | null>(null);
  const nextPieceRef = useRef<Piece | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const dropTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const createPiece = useCallback((): Piece => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex].map(row => [...row]),
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      colorIndex: shapeIndex,
    };
  }, []);

  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;
    
    // Highlight
    const gradient = ctx.createLinearGradient(
      x * BLOCK_SIZE, y * BLOCK_SIZE,
      x * BLOCK_SIZE + BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
  }, []);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw placed blocks
    boardRef.current.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock(ctx, x, y, COLORS[cell - 1]);
        }
      });
    });

    // Draw current piece
    if (currentPieceRef.current) {
      const { shape, pos, colorIndex } = currentPieceRef.current;
      shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            drawBlock(ctx, pos.x + x, pos.y + y, COLORS[colorIndex]);
          }
        });
      });
    }
  }, [drawBlock]);

  const collision = useCallback((piece: Piece, offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.pos.x + x + offsetX;
          const newY = piece.pos.y + y + offsetY;
          
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && boardRef.current[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const merge = useCallback(() => {
    if (!currentPieceRef.current) return;
    
    const { shape, pos, colorIndex } = currentPieceRef.current;
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0) {
            boardRef.current[boardY][boardX] = colorIndex + 1;
          }
        }
      });
    });
  }, []);

  const clearLines = useCallback(() => {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
      if (boardRef.current[y].every(cell => cell !== 0)) {
        boardRef.current.splice(y, 1);
        boardRef.current.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(prev => prev + points);
      setLines(prev => {
        const newLines = prev + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        setLevel(newLevel);
        return newLines;
      });
      
      // Logros
      if (linesCleared === 4) {
        addAchievement('Tetris!', 'tetris');
      }
    }
  }, [level, addAchievement]);

  const rotate = useCallback(() => {
    if (!currentPieceRef.current || paused) return;
    
    const piece = currentPieceRef.current;
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    
    const rotatedPiece = { ...piece, shape: rotated };
    
    if (!collision(rotatedPiece)) {
      currentPieceRef.current = rotatedPiece;
      drawBoard();
    }
  }, [collision, drawBoard, paused]);

  const move = useCallback((dir: number) => {
    if (!currentPieceRef.current || paused) return;
    
    if (!collision(currentPieceRef.current, dir, 0)) {
      currentPieceRef.current.pos.x += dir;
      drawBoard();
    }
  }, [collision, drawBoard, paused]);

  const drop = useCallback(() => {
    if (!currentPieceRef.current || paused) return false;
    
    if (!collision(currentPieceRef.current, 0, 1)) {
      currentPieceRef.current.pos.y++;
      dropTimeRef.current = 0;
      return false;
    } else {
      merge();
      clearLines();
      
      currentPieceRef.current = nextPieceRef.current;
      nextPieceRef.current = createPiece();
      
      if (currentPieceRef.current && collision(currentPieceRef.current)) {
        endGame();
        return true;
      }
      
      dropTimeRef.current = 0;
      return false;
    }
  }, [collision, merge, clearLines, createPiece, paused]);

  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current || paused) return;
    
    while (!collision(currentPieceRef.current, 0, 1)) {
      currentPieceRef.current.pos.y++;
      setScore(prev => prev + 2);
    }
    
    drop();
    drawBoard();
  }, [collision, drop, drawBoard, paused]);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Guardar estadísticas
    const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const won = score > 10000;
    
    updateGameStats('tetris', {
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
    
    // Logros
    if (score >= 1000) addAchievement('Primera Mil', 'tetris');
    if (score >= 10000) addAchievement('Maestro Tetris', 'tetris');
    if (lines >= 50) addAchievement('Limpiador de Líneas', 'tetris');
  }, [score, highScore, updateGameStats, addAchievement]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    boardRef.current = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    currentPieceRef.current = createPiece();
    nextPieceRef.current = createPiece();
    dropTimeRef.current = 0;
    lastTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    drawBoard();
  }, [createPiece, drawBoard]);

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
      lastTimeRef.current = time;
      
      dropTimeRef.current += deltaTime;
      const dropInterval = Math.max(100, 1000 - (level - 1) * 50);
      
      if (dropTimeRef.current > dropInterval) {
        drop();
      }
      
      drawBoard();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, level, drop, drawBoard]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          move(-1);
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          move(1);
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          drop();
          setScore(prev => prev + 1);
          break;
        case 'ArrowUp':
        case 'w':
        case ' ':
          e.preventDefault();
          rotate();
          break;
        case 'Shift':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, move, drop, rotate, hardDrop, togglePause]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-pink">TETRIS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🧩 El clásico juego de bloques reimaginado
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left Panel - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
              <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4">📊 ESTADÍSTICAS</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Puntuación</div>
                  <div className="text-3xl sm:text-4xl font-bold neon-text-green">{score.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Nivel</div>
                  <div className="text-2xl sm:text-3xl font-bold neon-text-blue">{level}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Líneas</div>
                  <div className="text-2xl sm:text-3xl font-bold neon-text-pink">{lines}</div>
                </div>
                {highScore > 0 && (
                  <div>
                    <div className="text-white/60 text-sm mb-1">Récord</div>
                    <div className="text-xl sm:text-2xl font-bold neon-text-yellow">{highScore.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🎮 CONTROLES</h3>
              <div className="space-y-2 text-xs sm:text-sm text-white/70">
                <div className="flex justify-between gap-4">
                  <span>← → A D</span>
                  <span>Mover</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>↑ W ESPACIO</span>
                  <span>Rotar</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>↓ S</span>
                  <span>Bajar</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>SHIFT</span>
                  <span>Caída rápida</span>
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
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-pink/50">
              <canvas
                ref={canvasRef}
                width={COLS * BLOCK_SIZE}
                height={ROWS * BLOCK_SIZE}
                className="rounded-lg shadow-neon-pink mx-auto"
              />

              {/* Overlays */}
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
                        <p className="text-3xl sm:text-4xl font-bold neon-text-green">{score.toLocaleString()}</p>
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
                      <p className="text-white/70">Presiona P o ESC para continuar</p>
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
                        className="btn-neon btn-pink px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-2xl"
                      >
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 inline mr-3" fill="currentColor" />
                        INICIAR JUEGO
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Control Buttons */}
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

          {/* Right Panel - Next Piece & Tips */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
              <h3 className="text-xl sm:text-2xl font-bold neon-text-purple mb-4">🔮 SIGUIENTE</h3>
              <div className="w-32 h-32 bg-dark-900 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-5xl sm:text-6xl">🧩</span>
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-4">💡 CONSEJOS</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/70">
                <li>• Completa líneas para puntos</li>
                <li>• 4 líneas = TETRIS (800 pts)</li>
                <li>• Usa SHIFT para caída rápida</li>
                <li>• El nivel sube cada 10 líneas</li>
                <li>• Planifica tus movimientos</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                LOGROS
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>🏆 Primera Mil (1,000 pts)</li>
                <li>🏆 Maestro Tetris (10,000 pts)</li>
                <li>🏆 Tetris! (4 líneas a la vez)</li>
                <li>🏆 Limpiador (50 líneas)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;

