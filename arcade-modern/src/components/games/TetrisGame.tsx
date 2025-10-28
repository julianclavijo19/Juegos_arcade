import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

interface Position {
  x: number;
  y: number;
}

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
];

const COLORS = ['#ff006e', '#3a86ff', '#06ffa5', '#ffb703', '#8338ec', '#fb5607', '#06ffa5'];

const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const boardRef = useRef<number[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const currentPieceRef = useRef<{
    shape: number[][];
    pos: Position;
    color: string;
  } | null>(null);

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
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

    // Draw board pieces
    boardRef.current.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = COLORS[cell - 1];
          ctx.fillRect(
            x * BLOCK_SIZE + 1,
            y * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2
          );
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS[cell - 1];
          ctx.fillRect(
            x * BLOCK_SIZE + 1,
            y * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2
          );
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw current piece
    if (currentPieceRef.current) {
      const { shape, pos, color } = currentPieceRef.current;
      ctx.fillStyle = color;
      shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillRect(
              (pos.x + x) * BLOCK_SIZE + 1,
              (pos.y + y) * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2
            );
            
            // Add glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillRect(
              (pos.x + x) * BLOCK_SIZE + 1,
              (pos.y + y) * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2
            );
            ctx.shadowBlur = 0;
          }
        });
      });
    }
  }, []);

  const createPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      color: COLORS[shapeIndex],
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLines(0);
    setLevel(1);
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    currentPieceRef.current = createPiece();
    drawBoard();
  };

  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setPaused(!paused);
    }
  };

  useEffect(() => {
    drawBoard();
  }, [drawBoard, score, lines]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold mb-4">
            <span className="neon-text-pink">TETRIS</span>
          </h1>
          <p className="text-white/70 text-lg">
            🧩 El clásico juego de bloques reimaginado
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-8 items-start">
          {/* Left Panel - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-2xl p-6 border border-neon-blue/30">
              <h3 className="text-2xl font-bold neon-text-yellow mb-4">📊 ESTADÍSTICAS</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">Puntuación</div>
                  <div className="text-4xl font-bold neon-text-green">{score}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Nivel</div>
                  <div className="text-3xl font-bold neon-text-blue">{level}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Líneas</div>
                  <div className="text-3xl font-bold neon-text-pink">{lines}</div>
                </div>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 border border-neon-green/30">
              <h3 className="text-xl font-bold neon-text-green mb-3">🎮 CONTROLES</h3>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex justify-between">
                  <span>← →</span>
                  <span>Mover</span>
                </div>
                <div className="flex justify-between">
                  <span>↑</span>
                  <span>Rotar</span>
                </div>
                <div className="flex justify-between">
                  <span>↓</span>
                  <span>Bajar rápido</span>
                </div>
                <div className="flex justify-between">
                  <span>ESPACIO</span>
                  <span>Caída instantánea</span>
                </div>
                <div className="flex justify-between">
                  <span>P</span>
                  <span>Pausar</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center - Game Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="glass-dark rounded-2xl p-6 border-2 border-neon-pink/50">
              <canvas
                ref={canvasRef}
                width={COLS * BLOCK_SIZE}
                height={ROWS * BLOCK_SIZE}
                className="rounded-lg shadow-neon-pink"
              />

              {/* Game Over Overlay */}
              <AnimatePresence>
                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.h2
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-6xl font-bold neon-text-pink mb-4"
                      >
                        GAME OVER
                      </motion.h2>
                      <p className="text-2xl text-neon-yellow mb-6">Puntuación: {score}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="btn-neon btn-green px-8 py-4 text-lg"
                      >
                        <RotateCcw className="w-5 h-5 inline mr-2" />
                        REINTENTAR
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paused Overlay */}
              <AnimatePresence>
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
                        className="text-6xl font-bold neon-text-blue mb-4"
                      >
                        PAUSA
                      </motion.h2>
                      <p className="text-white/70">Presiona P para continuar</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start Screen */}
              <AnimatePresence>
                {!gameStarted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="btn-neon btn-pink px-12 py-6 text-2xl"
                      >
                        <Play className="w-8 h-8 inline mr-3" fill="currentColor" />
                        INICIAR JUEGO
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                disabled={!gameStarted || gameOver}
                className="flex-1 btn-neon btn-blue py-3 disabled:opacity-50"
              >
                {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="flex-1 btn-neon btn-green py-3"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="flex-1 btn-neon btn-pink py-3"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Panel - Next Piece & High Scores */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-2xl p-6 border border-neon-purple/30">
              <h3 className="text-2xl font-bold neon-text-purple mb-4">🔮 SIGUIENTE</h3>
              <div className="w-32 h-32 bg-dark-900 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-6xl">🧩</span>
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-6 border border-neon-yellow/30">
              <h3 className="text-xl font-bold neon-text-yellow mb-4">🏆 RÉCORDS</h3>
              <div className="space-y-3">
                {[
                  { name: 'Tu Récord', score: 15240 },
                  { name: 'Global', score: 89450 },
                  { name: 'Hoy', score: 23100 },
                ].map((record, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/60">{record.name}</span>
                    <span className="text-neon-green font-bold">{record.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;

