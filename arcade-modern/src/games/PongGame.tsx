import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const BALL_SPEED_BASE = 4;
const PADDLE_SPEED = 6;

type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballX, setBallX] = useState(CANVAS_WIDTH / 2);
  const [ballY, setBallY] = useState(CANVAS_HEIGHT / 2);
  const [ballVX, setBallVX] = useState(BALL_SPEED_BASE);
  const [ballVY, setBallVY] = useState(BALL_SPEED_BASE * (Math.random() > 0.5 ? 1 : -1));
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const TARGET_SCORE = 11;

  const difficultyMap = {
    easy: { speed: 0.3, precision: 0.6, reactionTime: 0.3 },
    normal: { speed: 0.5, precision: 0.8, reactionTime: 0.15 },
    hard: { speed: 0.7, precision: 0.95, reactionTime: 0.05 },
    impossible: { speed: 1.0, precision: 0.999, reactionTime: 0.0 }
  };

  const resetBall = useCallback((direction: number = 1) => {
    setBallX(CANVAS_WIDTH / 2);
    setBallY(CANVAS_HEIGHT / 2);
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    setBallVX(BALL_SPEED_BASE * direction * Math.cos(angle));
    setBallVY(BALL_SPEED_BASE * Math.sin(angle));
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#ffffff20';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle (left)
    const playerGradient = ctx.createLinearGradient(0, playerY, 0, playerY + PADDLE_HEIGHT);
    playerGradient.addColorStop(0, '#06ffa5');
    playerGradient.addColorStop(1, '#00d489');
    ctx.fillStyle = playerGradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#06ffa5';
    ctx.fillRect(30, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Draw AI paddle (right)
    const aiGradient = ctx.createLinearGradient(CANVAS_WIDTH - 30 - PADDLE_WIDTH, aiY, CANVAS_WIDTH - 30, aiY + PADDLE_HEIGHT);
    aiGradient.addColorStop(0, '#ff006e');
    aiGradient.addColorStop(1, '#d10057');
    ctx.fillStyle = aiGradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff006e';
    ctx.fillRect(CANVAS_WIDTH - 30 - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Draw ball
    ctx.fillStyle = '#ffbe0b';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw scores
    ctx.fillStyle = '#06ffa5';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60);
    
    ctx.fillStyle = '#ff006e';
    ctx.fillText(aiScore.toString(), 3 * CANVAS_WIDTH / 4, 60);

  }, [playerY, aiY, ballX, ballY, playerScore, aiScore]);

  const updateAI = useCallback(() => {
    const config = difficultyMap[difficulty];
    const paddleCenter = aiY + PADDLE_HEIGHT / 2;
    
    // Predecir dónde va a estar la bola
    let targetY = ballY;
    
    if (ballVX > 0) {
      // La bola viene hacia la IA
      const timeToReach = (CANVAS_WIDTH - 30 - PADDLE_WIDTH - ballX) / ballVX;
      targetY = ballY + ballVY * timeToReach * config.precision;
      
      // Asegurar que está dentro de los límites
      while (targetY < 0 || targetY > CANVAS_HEIGHT) {
        if (targetY < 0) targetY = -targetY;
        if (targetY > CANVAS_HEIGHT) targetY = 2 * CANVAS_HEIGHT - targetY;
      }
    }
    
    // Agregar error basado en dificultad
    const error = (1 - config.precision) * 50 * (Math.random() - 0.5);
    targetY += error;
    
    // Mover la paleta
    const diff = targetY - paddleCenter;
    const moveSpeed = PADDLE_SPEED * config.speed * (1 + config.reactionTime);
    
    if (Math.abs(diff) > moveSpeed) {
      setAiY(prev => {
        let newY = prev + (diff > 0 ? moveSpeed : -moveSpeed);
        newY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
        return newY;
      });
    }
  }, [aiY, ballX, ballY, ballVX, ballVY, difficulty]);

  const updatePlayer = useCallback(() => {
    let newY = playerY;
    
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      newY -= PADDLE_SPEED;
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      newY += PADDLE_SPEED;
    }
    
    newY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
    setPlayerY(newY);
  }, [playerY]);

  const updateBall = useCallback(() => {
    let newX = ballX + ballVX;
    let newY = ballY + ballVY;
    let newVX = ballVX;
    let newVY = ballVY;

    // Colisión con paredes superior e inferior
    if (newY - BALL_SIZE <= 0 || newY + BALL_SIZE >= CANVAS_HEIGHT) {
      newVY = -newVY;
      newY = newY - BALL_SIZE <= 0 ? BALL_SIZE : CANVAS_HEIGHT - BALL_SIZE;
    }

    // Colisión con paddle del jugador
    if (newX - BALL_SIZE <= 30 + PADDLE_WIDTH &&
        newY >= playerY &&
        newY <= playerY + PADDLE_HEIGHT) {
      newVX = Math.abs(newVX) * 1.05; // Aumentar velocidad ligeramente
      newVY += ((newY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
      newX = 30 + PADDLE_WIDTH + BALL_SIZE;
    }

    // Colisión con paddle de IA
    if (newX + BALL_SIZE >= CANVAS_WIDTH - 30 - PADDLE_WIDTH &&
        newY >= aiY &&
        newY <= aiY + PADDLE_HEIGHT) {
      newVX = -Math.abs(newVX) * 1.05;
      newVY += ((newY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)) * 3;
      newX = CANVAS_WIDTH - 30 - PADDLE_WIDTH - BALL_SIZE;
    }

    // Punto para la IA
    if (newX - BALL_SIZE <= 0) {
      setAiScore(prev => {
        const newScore = prev + 1;
        if (newScore >= TARGET_SCORE) {
          endGame('ai');
        }
        return newScore;
      });
      resetBall(1);
      return;
    }

    // Punto para el jugador
    if (newX + BALL_SIZE >= CANVAS_WIDTH) {
      setPlayerScore(prev => {
        const newScore = prev + 1;
        if (newScore >= TARGET_SCORE) {
          endGame('player');
        }
        return newScore;
      });
      resetBall(-1);
      return;
    }

    setBallX(newX);
    setBallY(newY);
    setBallVX(newVX);
    setBallVY(newVY);
  }, [ballX, ballY, ballVX, ballVY, playerY, aiY, resetBall]);

  const endGame = useCallback((winner: 'player' | 'ai') => {
    setGameOver(true);
    setWinner(winner);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const won = winner === 'player';
    
    updateGameStats('pong', {
      gamesPlayed: 1,
      gamesWon: won ? 1 : 0,
      gamesLost: won ? 0 : 1,
      highScore: won ? TARGET_SCORE : playerScore,
      totalScore: playerScore,
      totalTime: timePlayed,
    });
    
    if (won) {
      if (difficulty === 'hard') addAchievement('Campeón Pong Difícil', 'pong');
      if (difficulty === 'impossible') addAchievement('Desafío Imposible Completado', 'pong');
      addAchievement('Primera Victoria Pong', 'pong');
    }
  }, [playerScore, difficulty, updateGameStats, addAchievement]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setPaused(false);
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    setPlayerY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    resetBall(Math.random() > 0.5 ? 1 : -1);
    startTimeRef.current = Date.now();
  }, [resetBall]);

  const togglePause = useCallback(() => {
    if (gameStarted && !gameOver) {
      setPaused(prev => !prev);
    }
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || paused) {
      drawGame();
      return;
    }

    const gameLoop = () => {
      updatePlayer();
      updateAI();
      updateBall();
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, updatePlayer, updateAI, updateBall, drawGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(key);
      
      if ((key === 'p' || key === 'escape') && !gameOver) {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  }, [gameOver, togglePause]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-yellow">PONG</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🏓 El clásico juego de tenis de mesa arcade
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
              <h3 className="text-xl sm:text-2xl font-bold neon-text-green mb-4">🏆 MARCADOR</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-1">TÚ</div>
                  <div className="text-4xl sm:text-5xl font-bold neon-text-green">{playerScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-1">IA</div>
                  <div className="text-4xl sm:text-5xl font-bold neon-text-pink">{aiScore}</div>
                </div>
              </div>
              <div className="mt-4 text-center text-white/50 text-xs">
                Primero a {TARGET_SCORE} puntos
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-blue mb-3">🤖 DIFICULTAD IA</h3>
              <div className="space-y-2">
                {(['easy', 'normal', 'hard', 'impossible'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    disabled={gameStarted && !gameOver}
                    className={`w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      difficulty === d
                        ? 'bg-neon-blue text-white shadow-neon-blue'
                        : 'glass text-white/60 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    {d === 'easy' && '😊 FÁCIL'}
                    {d === 'normal' && '🙂 NORMAL'}
                    {d === 'hard' && '😤 DIFÍCIL'}
                    {d === 'impossible' && '💀 IMPOSIBLE'}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-white/50">
                {difficulty === 'easy' && 'IA lenta y con errores'}
                {difficulty === 'normal' && 'IA equilibrada'}
                {difficulty === 'hard' && 'IA rápida y precisa'}
                {difficulty === 'impossible' && 'IA perfecta, ¡imposible de vencer!'}
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-purple mb-3">🎮 CONTROLES</h3>
              <div className="space-y-2 text-xs sm:text-sm text-white/70">
                <div className="flex justify-between gap-4">
                  <span>↑ W</span>
                  <span>Arriba</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>↓ S</span>
                  <span>Abajo</span>
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
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-yellow/50">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg shadow-neon-yellow mx-auto max-w-full"
                style={{ width: '100%', height: 'auto' }}
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
                        className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${
                          winner === 'player' ? 'neon-text-green' : 'neon-text-pink'
                        }`}
                      >
                        {winner === 'player' ? '¡VICTORIA!' : 'DERROTA'}
                      </motion.h2>
                      <div className="mb-4">
                        <p className="text-xl sm:text-2xl text-neon-yellow mb-2">Puntuación Final</p>
                        <p className="text-3xl sm:text-4xl font-bold">
                          <span className="neon-text-green">{playerScore}</span>
                          {' - '}
                          <span className="neon-text-pink">{aiScore}</span>
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startGame}
                          className="btn-neon btn-green px-6 py-3 text-sm sm:text-base"
                        >
                          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                          REVANCHA
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
              <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4">🎯 OBJETIVO</h3>
              <p className="text-xs sm:text-sm text-white/70 mb-4">
                Sé el primero en alcanzar {TARGET_SCORE} puntos golpeando la bola más allá del oponente.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>⚡ La bola acelera con cada golpe</li>
                <li>⚡ Golpea en ángulo para dificultar</li>
                <li>⚡ Predice la trayectoria</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🏆 LOGROS</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>🏆 Primera Victoria</li>
                <li>🏆 Vencer IA Difícil</li>
                <li>🏆 Desafío Imposible</li>
                <li>🏆 Sin recibir puntos</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-pink mb-3">💡 CONSEJO PRO</h3>
              <p className="text-xs sm:text-sm text-white/70">
                La bola se desvía según dónde golpee tu paleta. 
                Golpea en los bordes para ángulos más cerrados.
                ¡La práctica hace al maestro!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PongGame;

