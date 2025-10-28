import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const ALIEN_WIDTH = 40;
const ALIEN_HEIGHT = 30;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;

type Position = { x: number; y: number };
type Bullet = Position & { active: boolean };
type Alien = Position & { active: boolean; row: number; col: number };

const SpaceInvadersGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [playerBullets, setPlayerBullets] = useState<Bullet[]>([]);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [alienBullets, setAlienBullets] = useState<Bullet[]>([]);
  const [alienDirection, setAlienDirection] = useState(1);
  const [alienSpeed, setAlienSpeed] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);
  const lastShotTime = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const alienShootInterval = useRef<number>(0);

  const initializeAliens = useCallback((lvl: number) => {
    const newAliens: Alien[] = [];
    const rows = Math.min(5 + Math.floor(lvl / 2), 7);
    const cols = 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newAliens.push({
          x: 50 + col * 60,
          y: 50 + row * 50,
          active: true,
          row,
          col
        });
      }
    }
    
    return newAliens;
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff20';
    for (let i = 0; i < 100; i++) {
      const x = (i * 123) % CANVAS_WIDTH;
      const y = (i * 456) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw player
    ctx.fillStyle = '#06ffa5';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06ffa5';
    // Ship body
    ctx.beginPath();
    ctx.moveTo(playerX + PLAYER_WIDTH / 2, playerX > -1000 ? CANVAS_HEIGHT - 50 : -1000);
    ctx.lineTo(playerX, CANVAS_HEIGHT - 20);
    ctx.lineTo(playerX + PLAYER_WIDTH, CANVAS_HEIGHT - 20);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw player bullets
    playerBullets.forEach(bullet => {
      if (bullet.active) {
        ctx.fillStyle = '#ffbe0b';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffbe0b';
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
        ctx.shadowBlur = 0;
      }
    });

    // Draw aliens
    aliens.forEach(alien => {
      if (alien.active) {
        const color = alien.row === 0 ? '#ff006e' : alien.row === 1 ? '#fb5607' : '#3a86ff';
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        // Simple alien shape
        ctx.fillRect(alien.x + 5, alien.y, ALIEN_WIDTH - 10, ALIEN_HEIGHT - 10);
        ctx.fillRect(alien.x, alien.y + 10, ALIEN_WIDTH, ALIEN_HEIGHT - 15);
        ctx.shadowBlur = 0;
      }
    });

    // Draw alien bullets
    alienBullets.forEach(bullet => {
      if (bullet.active) {
        ctx.fillStyle = '#ff006e';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff006e';
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
        ctx.shadowBlur = 0;
      }
    });

    // Draw HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`NIVEL: ${level}`, 20, 30);
    ctx.fillText(`VIDAS: ${'❤️'.repeat(lives)}`, 200, 30);
    ctx.fillText(`PUNTOS: ${score}`, CANVAS_WIDTH - 200, 30);

  }, [playerX, playerBullets, aliens, alienBullets, score, lives, level]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver || paused) return;

    // Update player
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      setPlayerX(prev => Math.max(0, prev - 5));
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      setPlayerX(prev => Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev + 5));
    }
    if (keysPressed.current.has(' ') || keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      const now = Date.now();
      if (now - lastShotTime.current > 300) {
        setPlayerBullets(prev => [...prev, {
          x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: CANVAS_HEIGHT - 60,
          active: true
        }]);
        lastShotTime.current = now;
      }
    }

    // Update player bullets
    setPlayerBullets(prev => prev.map(bullet => ({
      ...bullet,
      y: bullet.y - 8,
      active: bullet.active && bullet.y > 0
    })).filter(b => b.active));

    // Update alien bullets
    setAlienBullets(prev => prev.map(bullet => ({
      ...bullet,
      y: bullet.y + 5,
      active: bullet.active && bullet.y < CANVAS_HEIGHT
    })).filter(b => b.active));

    // Aliens shoot
    alienShootInterval.current++;
    if (alienShootInterval.current > 60 - level * 5) {
      const activeAliens = aliens.filter(a => a.active);
      if (activeAliens.length > 0) {
        const shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];
        setAlienBullets(prev => [...prev, {
          x: shooter.x + ALIEN_WIDTH / 2,
          y: shooter.y + ALIEN_HEIGHT,
          active: true
        }]);
      }
      alienShootInterval.current = 0;
    }

    // Move aliens
    setAliens(prev => {
      let newAliens = [...prev];
      let shouldMoveDown = false;
      
      newAliens = newAliens.map(alien => ({
        ...alien,
        x: alien.x + alienDirection * alienSpeed
      }));
      
      const leftmost = Math.min(...newAliens.filter(a => a.active).map(a => a.x));
      const rightmost = Math.max(...newAliens.filter(a => a.active).map(a => a.x));
      
      if (leftmost <= 0 || rightmost + ALIEN_WIDTH >= CANVAS_WIDTH) {
        shouldMoveDown = true;
        setAlienDirection(prev => -prev);
      }
      
      if (shouldMoveDown) {
        newAliens = newAliens.map(alien => ({
          ...alien,
          y: alien.y + 30
        }));
      }
      
      return newAliens;
    });

    // Check collisions - player bullets vs aliens
    setPlayerBullets(prevBullets => {
      let newBullets = [...prevBullets];
      setAliens(prevAliens => {
        let newAliens = [...prevAliens];
        
        newBullets.forEach(bullet => {
          if (!bullet.active) return;
          
          newAliens.forEach(alien => {
            if (!alien.active) return;
            
            if (bullet.x >= alien.x && bullet.x <= alien.x + ALIEN_WIDTH &&
                bullet.y >= alien.y && bullet.y <= alien.y + ALIEN_HEIGHT) {
              alien.active = false;
              bullet.active = false;
              
              const points = alien.row === 0 ? 30 : alien.row === 1 ? 20 : 10;
              setScore(prev => prev + points);
            }
          });
        });
        
        return newAliens;
      });
      
      return newBullets;
    });

    // Check collisions - alien bullets vs player
    setAlienBullets(prevBullets => {
      const newBullets = prevBullets.map(bullet => {
        if (bullet.active &&
            bullet.x >= playerX && bullet.x <= playerX + PLAYER_WIDTH &&
            bullet.y >= CANVAS_HEIGHT - 60 && bullet.y <= CANVAS_HEIGHT - 20) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              endGame();
            }
            return newLives;
          });
          return { ...bullet, active: false };
        }
        return bullet;
      });
      
      return newBullets;
    });

    // Check if level complete
    const activeAliens = aliens.filter(a => a.active).length;
    if (activeAliens === 0) {
      nextLevel();
    }

    // Check if aliens reached player
    const lowestAlien = Math.max(...aliens.filter(a => a.active).map(a => a.y));
    if (lowestAlien + ALIEN_HEIGHT >= CANVAS_HEIGHT - 60) {
      endGame();
    }

  }, [gameStarted, gameOver, paused, playerX, aliens, alienDirection, alienSpeed, level]);

  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    setAliens(initializeAliens(level + 1));
    setAlienSpeed(prev => prev + 0.2);
    setPlayerBullets([]);
    setAlienBullets([]);
    setPlayerX(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
    
    addAchievement(`Nivel ${level + 1} Completado`, 'spaceinvaders');
    if (level + 1 === 5) addAchievement('Superviviente Espacial', 'spaceinvaders');
  }, [level, initializeAliens, addAchievement]);

  const endGame = useCallback(() => {
    setGameOver(true);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const timePlayed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    updateGameStats('spaceinvaders', {
      gamesPlayed: 1,
      gamesWon: level >= 10 ? 1 : 0,
      gamesLost: 1,
      highScore: Math.max(score, highScore),
      totalScore: score,
      totalTime: timePlayed,
    });
    
    if (score > highScore) {
      setHighScore(score);
    }
    
    if (score >= 1000) addAchievement('Puntuación Alta', 'spaceinvaders');
    if (level >= 10) addAchievement('Maestro Espacial', 'spaceinvaders');
  }, [score, level, highScore, updateGameStats, addAchievement]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setLives(3);
    setLevel(1);
    setAliens(initializeAliens(1));
    setPlayerBullets([]);
    setAlienBullets([]);
    setPlayerX(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
    setAlienSpeed(1);
    setAlienDirection(1);
    alienShootInterval.current = 0;
    startTimeRef.current = Date.now();
  }, [initializeAliens]);

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
      updateGame();
      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, paused, updateGame, drawGame]);

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
            <span className="neon-text-purple">SPACE INVADERS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            👾 ¡Defiende la Tierra de la invasión alienígena!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 md:gap-8 items-start">
          {/* Left Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
              <h3 className="text-xl sm:text-2xl font-bold neon-text-purple mb-4">📊 ESTADÍSTICAS</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-white/60 text-sm mb-1">Puntuación</div>
                  <div className="text-3xl sm:text-4xl font-bold neon-text-yellow">{score}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Nivel</div>
                  <div className="text-2xl sm:text-3xl font-bold neon-text-blue">{level}</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm mb-1">Vidas</div>
                  <div className="text-2xl sm:text-3xl">{'❤️'.repeat(lives)}</div>
                </div>
                {highScore > 0 && (
                  <div>
                    <div className="text-white/60 text-sm mb-1">Récord</div>
                    <div className="text-xl sm:text-2xl font-bold neon-text-green">{highScore}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-blue mb-3">👾 ALIENÍGENAS</h3>
              <div className="space-y-2 text-xs sm:text-sm text-white/70">
                <div className="flex justify-between items-center">
                  <span className="text-neon-pink">Nivel 1</span>
                  <span>30 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-400">Nivel 2</span>
                  <span>20 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neon-blue">Nivel 3</span>
                  <span>10 pts</span>
                </div>
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
                  <span>ESPACIO ↑ W</span>
                  <span>Disparar</span>
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
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-purple/50">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg shadow-neon-purple mx-auto max-w-full"
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
                        className="text-4xl sm:text-5xl md:text-6xl font-bold neon-text-pink mb-4"
                      >
                        GAME OVER
                      </motion.h2>
                      <div className="mb-4">
                        <p className="text-xl sm:text-2xl text-neon-yellow mb-2">Puntuación Final</p>
                        <p className="text-3xl sm:text-4xl font-bold neon-text-purple">{score}</p>
                        <p className="text-lg text-white/60 mt-2">Nivel alcanzado: {level}</p>
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
              <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4">🎯 MISIÓN</h3>
              <p className="text-xs sm:text-sm text-white/70 mb-4">
                ¡Elimina a todos los invasores alienígenas antes de que lleguen a la Tierra!
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>⚡ Cada nivel es más difícil</li>
                <li>⚡ Los aliens se mueven más rápido</li>
                <li>⚡ Disparan con más frecuencia</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🏆 LOGROS</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                <li>🏆 Nivel 5 (Superviviente)</li>
                <li>🏆 Nivel 10 (Maestro)</li>
                <li>🏆 1000+ puntos</li>
                <li>🏆 Sin recibir daño</li>
              </ul>
            </div>

            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
              <h3 className="text-lg sm:text-xl font-bold neon-text-pink mb-3">💡 ESTRATEGIA</h3>
              <p className="text-xs sm:text-sm text-white/70">
                Elimina primero a los aliens de los extremos para reducir su velocidad lateral. 
                ¡Mantén la calma y dispara con precisión!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SpaceInvadersGame;

