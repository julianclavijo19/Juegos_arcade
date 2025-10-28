import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameMode = '1p' | '2p';
type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

const TicTacToeGame = () => {
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('1p');
  const [difficulty, setDifficulty] = useState<Difficulty>('impossible');
  const [gameStarted, setGameStarted] = useState(false);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6] // Diagonal
  ];

  const checkWinner = useCallback((boardToCheck: Board): { winner: Player | 'draw'; line: number[] } => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return { winner: boardToCheck[a], line: combo };
      }
    }
    
    if (boardToCheck.every(cell => cell !== null)) {
      return { winner: 'draw', line: [] };
    }
    
    return { winner: null, line: [] };
  }, []);

  // Algoritmo Minimax mejorado con alpha-beta pruning
  const minimax = useCallback((
    boardState: Board,
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): number => {
    const result = checkWinner(boardState);
    
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = 'O';
          const evaluation = minimax(boardState, depth + 1, false, alpha, beta);
          boardState[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = 'X';
          const evaluation = minimax(boardState, depth + 1, true, alpha, beta);
          boardState[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }, [checkWinner]);

  const getAIMove = useCallback((boardState: Board): number => {
    const emptyIndices = boardState.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1);
    
    if (difficulty === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    
    if (difficulty === 'medium') {
      if (Math.random() < 0.5) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }
    
    // Hard e Impossible usan Minimax
    let bestMove = -1;
    let bestValue = -Infinity;
    
    for (const index of emptyIndices) {
      boardState[index] = 'O';
      const moveValue = minimax([...boardState], 0, false);
      boardState[index] = null;
      
      if (moveValue > bestValue) {
        bestValue = moveValue;
        bestMove = index;
      }
    }
    
    // En modo hard, a veces comete errores
    if (difficulty === 'hard' && Math.random() < 0.15) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    
    return bestMove;
  }, [difficulty, minimax]);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || !gameStarted) return;
    if (gameMode === '1p' && currentPlayer === 'O') return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      if (result.winner === 'X') {
        setXScore(prev => prev + 1);
      } else if (result.winner === 'O') {
        setOScore(prev => prev + 1);
      }
      
      updateGameStats('tictactoe', {
        gamesPlayed: 1,
        gamesWon: result.winner === 'X' ? 1 : 0,
        gamesLost: result.winner === 'O' ? 1 : 0,
        totalScore: result.winner === 'X' ? 1 : 0,
      });
      
      if (result.winner === 'X') {
        if (difficulty === 'impossible') {
          addAchievement('Desafío Imposible Tic-Tac-Toe', 'tictactoe');
        }
        addAchievement('Primera Victoria Tic-Tac-Toe', 'tictactoe');
      }
      
      return;
    }
    
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }, [board, currentPlayer, winner, gameStarted, gameMode, checkWinner, updateGameStats, addAchievement, difficulty]);

  // IA turn
  useEffect(() => {
    if (gameMode === '1p' && currentPlayer === 'O' && !winner && gameStarted) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...board]);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
            
            if (result.winner === 'X') {
              setXScore(prev => prev + 1);
            } else if (result.winner === 'O') {
              setOScore(prev => prev + 1);
            }
            
            updateGameStats('tictactoe', {
              gamesPlayed: 1,
              gamesWon: result.winner === 'X' ? 1 : 0,
              gamesLost: result.winner === 'O' ? 1 : 0,
              totalScore: result.winner === 'X' ? 1 : 0,
            });
            
            return;
          }
          
          setCurrentPlayer('X');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameStarted, gameMode, board, getAIMove, checkWinner, updateGameStats]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
  }, []);

  const resetAll = useCallback(() => {
    resetGame();
    setXScore(0);
    setOScore(0);
    setGameStarted(false);
  }, [resetGame]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    resetGame();
  }, [resetGame]);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-blue">TIC TAC TOE</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            ⭕❌ El juego de estrategia clásico
          </p>
        </motion.div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-neon-blue/30">
              <h2 className="text-2xl sm:text-3xl font-bold neon-text-blue mb-6 text-center">
                CONFIGURACIÓN
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold neon-text-yellow mb-3">Modo de Juego</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameMode('1p')}
                      className={`py-4 px-6 rounded-xl font-bold transition-all ${
                        gameMode === '1p'
                          ? 'bg-neon-blue text-white shadow-neon-blue'
                          : 'glass text-white/60 hover:text-white'
                      }`}
                    >
                      <Cpu className="w-6 h-6 mx-auto mb-2" />
                      vs IA
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameMode('2p')}
                      className={`py-4 px-6 rounded-xl font-bold transition-all ${
                        gameMode === '2p'
                          ? 'bg-neon-blue text-white shadow-neon-blue'
                          : 'glass text-white/60 hover:text-white'
                      }`}
                    >
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      2 Jugadores
                    </motion.button>
                  </div>
                </div>

                {gameMode === '1p' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <h3 className="text-xl font-bold neon-text-green mb-3">Dificultad IA</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(['easy', 'medium', 'hard', 'impossible'] as const).map((d) => (
                        <motion.button
                          key={d}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDifficulty(d)}
                          className={`py-3 px-4 rounded-lg font-bold transition-all text-sm ${
                            difficulty === d
                              ? 'bg-neon-green text-white shadow-neon-green'
                              : 'glass text-white/60 hover:text-white'
                          }`}
                        >
                          {d === 'easy' && '😊 FÁCIL'}
                          {d === 'medium' && '🙂 MEDIO'}
                          {d === 'hard' && '😤 DIFÍCIL'}
                          {d === 'impossible' && '💀 IMPOSIBLE'}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full btn-neon btn-green py-6 text-xl sm:text-2xl"
                >
                  COMENZAR PARTIDA
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 md:gap-8 items-start">
            {/* Left Panel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-blue mb-4">📊 MARCADOR</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl sm:text-6xl mb-2 neon-text-green">❌</div>
                    <div className="text-white/60 text-sm mb-1">Jugador X</div>
                    <div className="text-3xl sm:text-4xl font-bold neon-text-green">{xScore}</div>
                  </div>
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl sm:text-6xl mb-2 neon-text-pink">⭕</div>
                    <div className="text-white/60 text-sm mb-1">
                      {gameMode === '1p' ? 'IA (O)' : 'Jugador O'}
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold neon-text-pink">{oScore}</div>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-3">
                  {winner ? '🏆 RESULTADO' : '🎮 TURNO'}
                </h3>
                {!winner ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl sm:text-7xl mb-2"
                    >
                      {currentPlayer === 'X' ? '❌' : '⭕'}
                    </motion.div>
                    <p className="text-xl neon-text-blue">
                      {currentPlayer === 'X' ? 'Jugador X' : gameMode === '1p' ? 'IA pensando...' : 'Jugador O'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl sm:text-7xl mb-2">
                      {winner === 'draw' ? '🤝' : winner === 'X' ? '❌' : '⭕'}
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold ${
                      winner === 'draw' ? 'neon-text-yellow' :
                      winner === 'X' ? 'neon-text-green' : 'neon-text-pink'
                    }`}>
                      {winner === 'draw' ? '¡EMPATE!' : winner === 'X' ? '¡X GANA!' : '¡O GANA!'}
                    </p>
                  </div>
                )}
              </div>

              {gameMode === '1p' && (
                <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
                  <h3 className="text-lg sm:text-xl font-bold neon-text-purple mb-3">🤖 IA</h3>
                  <p className="text-sm text-white/70">
                    Dificultad: <span className="font-bold neon-text-blue">
                      {difficulty.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    {difficulty === 'impossible' && 'Usa algoritmo Minimax perfecto'}
                    {difficulty === 'hard' && 'Minimax con errores ocasionales'}
                    {difficulty === 'medium' && 'Decisiones semi-aleatorias'}
                    {difficulty === 'easy' && 'Movimientos aleatorios'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Center - Game Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-blue/50">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md mx-auto">
                  {board.map((cell, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: cell ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner}
                      className={`aspect-square rounded-xl text-5xl sm:text-6xl md:text-7xl font-bold transition-all ${
                        winningLine.includes(index)
                          ? 'bg-neon-yellow/30 shadow-neon-yellow'
                          : 'glass hover:bg-white/10'
                      } ${cell ? '' : 'cursor-pointer'}`}
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: cell ? 1 : 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                        className={cell === 'X' ? 'neon-text-green' : 'neon-text-pink'}
                      >
                        {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
                      </motion.span>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex-1 btn-neon btn-green py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    NUEVA RONDA
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetAll}
                    className="flex-1 btn-neon btn-blue py-2 sm:py-3 text-sm sm:text-base"
                  >
                    REINICIAR TODO
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
              </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-green mb-4">🎯 REGLAS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/70">
                  <li>✓ Conecta 3 en línea</li>
                  <li>✓ Horizontal, vertical o diagonal</li>
                  <li>✓ El primero gana</li>
                  <li>✓ Estrategia es clave</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-3">🏆 LOGROS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li>🏆 Primera victoria</li>
                  <li>🏆 Vencer IA Imposible</li>
                  <li>🏆 3 victorias seguidas</li>
                  <li>🏆 Ganar en 5 movimientos</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-pink mb-3">💡 ESTRATEGIA</h3>
                <p className="text-xs sm:text-sm text-white/70">
                  El centro y las esquinas son posiciones clave. 
                  Intenta crear dos amenazas simultáneas para garantizar la victoria.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;

