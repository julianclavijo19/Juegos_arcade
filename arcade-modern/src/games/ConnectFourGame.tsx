import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

type Player = 1 | 2 | null;
type Board = Player[][];
type GameMode = '1p' | '2p';

const ROWS = 6;
const COLS = 7;

const ConnectFourGame = () => {
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [board, setBoard] = useState<Board>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('1p');
  const [gameStarted, setGameStarted] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const checkWinner = useCallback((boardToCheck: Board): { winner: Player | 'draw'; cells: [number, number][] } => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (boardToCheck[row][col] &&
            boardToCheck[row][col] === boardToCheck[row][col + 1] &&
            boardToCheck[row][col] === boardToCheck[row][col + 2] &&
            boardToCheck[row][col] === boardToCheck[row][col + 3]) {
          return {
            winner: boardToCheck[row][col],
            cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
          };
        }
      }
    }

    // Check vertical
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS; col++) {
        if (boardToCheck[row][col] &&
            boardToCheck[row][col] === boardToCheck[row + 1][col] &&
            boardToCheck[row][col] === boardToCheck[row + 2][col] &&
            boardToCheck[row][col] === boardToCheck[row + 3][col]) {
          return {
            winner: boardToCheck[row][col],
            cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
          };
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (boardToCheck[row][col] &&
            boardToCheck[row][col] === boardToCheck[row + 1][col + 1] &&
            boardToCheck[row][col] === boardToCheck[row + 2][col + 2] &&
            boardToCheck[row][col] === boardToCheck[row + 3][col + 3]) {
          return {
            winner: boardToCheck[row][col],
            cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
          };
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        if (boardToCheck[row][col] &&
            boardToCheck[row][col] === boardToCheck[row + 1][col - 1] &&
            boardToCheck[row][col] === boardToCheck[row + 2][col - 2] &&
            boardToCheck[row][col] === boardToCheck[row + 3][col - 3]) {
          return {
            winner: boardToCheck[row][col],
            cells: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]
          };
        }
      }
    }

    // Check draw
    if (boardToCheck.every(row => row.every(cell => cell !== null))) {
      return { winner: 'draw', cells: [] };
    }

    return { winner: null, cells: [] };
  }, []);

  const evaluatePosition = useCallback((boardToCheck: Board, player: 1 | 2): number => {
    let score = 0;
    const opponent: 1 | 2 = player === 1 ? 2 : 1;

    const evaluateWindow = (window: Player[]): number => {
      let windowScore = 0;
      const playerCount = window.filter(c => c === player).length;
      const opponentCount = window.filter(c => c === opponent).length;
      const emptyCount = window.filter(c => c === null).length;

      if (playerCount === 4) windowScore += 100;
      else if (playerCount === 3 && emptyCount === 1) windowScore += 5;
      else if (playerCount === 2 && emptyCount === 2) windowScore += 2;

      if (opponentCount === 3 && emptyCount === 1) windowScore -= 4;

      return windowScore;
    };

    // Score center column
    const centerArray = boardToCheck.map(row => row[Math.floor(COLS / 2)]);
    score += centerArray.filter(c => c === player).length * 3;

    // Score horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [boardToCheck[row][col], boardToCheck[row][col + 1], 
                       boardToCheck[row][col + 2], boardToCheck[row][col + 3]];
        score += evaluateWindow(window);
      }
    }

    // Score vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const window = [boardToCheck[row][col], boardToCheck[row + 1][col],
                       boardToCheck[row + 2][col], boardToCheck[row + 3][col]];
        score += evaluateWindow(window);
      }
    }

    // Score diagonals
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [boardToCheck[row][col], boardToCheck[row + 1][col + 1],
                       boardToCheck[row + 2][col + 2], boardToCheck[row + 3][col + 3]];
        score += evaluateWindow(window);
      }
    }

    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const window = [boardToCheck[row][col], boardToCheck[row + 1][col - 1],
                       boardToCheck[row + 2][col - 2], boardToCheck[row + 3][col - 3]];
        score += evaluateWindow(window);
      }
    }

    return score;
  }, []);

  const minimax = useCallback((
    boardState: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): number => {
    const result = checkWinner(boardState);
    const validCols = getValidColumns(boardState);

    if (result.winner === 2) return 100000000;
    if (result.winner === 1) return -100000000;
    if (result.winner === 'draw') return 0;
    if (depth === 0) return evaluatePosition(boardState, 2);

    if (maximizingPlayer) {
      let value = -Infinity;
      for (const col of validCols) {
        const boardCopy = boardState.map(row => [...row]);
        dropPiece(boardCopy, col, 2);
        value = Math.max(value, minimax(boardCopy, depth - 1, alpha, beta, false));
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    } else {
      let value = Infinity;
      for (const col of validCols) {
        const boardCopy = boardState.map(row => [...row]);
        dropPiece(boardCopy, col, 1);
        value = Math.min(value, minimax(boardCopy, depth - 1, alpha, beta, true));
        beta = Math.min(beta, value);
        if (alpha >= beta) break;
      }
      return value;
    }
  }, [checkWinner, evaluatePosition]);

  const getValidColumns = (boardState: Board): number[] => {
    return Array.from({ length: COLS }, (_, i) => i).filter(col => boardState[0][col] === null);
  };

  const dropPiece = (boardState: Board, col: number, player: 1 | 2): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (boardState[row][col] === null) {
        boardState[row][col] = player;
        return row;
      }
    }
    return -1;
  };

  const getAIMove = useCallback((boardState: Board): number => {
    const validCols = getValidColumns(boardState);
    
    let bestScore = -Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const boardCopy = boardState.map(row => [...row]);
      dropPiece(boardCopy, col, 2);
      const score = minimax(boardCopy, 4, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }

    return bestCol;
  }, [minimax]);

  const handleColumnClick = useCallback((col: number) => {
    if (winner || !gameStarted) return;
    if (gameMode === '1p' && currentPlayer === 2) return;
    if (board[0][col] !== null) return;

    const newBoard = board.map(row => [...row]);
    const row = dropPiece(newBoard, col, currentPlayer);
    
    if (row === -1) return;

    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      
      if (result.winner === 1) {
        setP1Score(prev => prev + 1);
      } else if (result.winner === 2) {
        setP2Score(prev => prev + 1);
      }
      
      updateGameStats('connectfour', {
        gamesPlayed: 1,
        gamesWon: result.winner === 1 ? 1 : 0,
        gamesLost: result.winner === 2 ? 1 : 0,
        totalScore: result.winner === 1 ? 1 : 0,
      });
      
      if (result.winner === 1) {
        addAchievement('Victoria Connect Four', 'connectfour');
      }
      
      return;
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  }, [board, currentPlayer, winner, gameStarted, gameMode, checkWinner, updateGameStats, addAchievement]);

  // AI turn
  useCallback(() => {
    if (gameMode === '1p' && currentPlayer === 2 && !winner && gameStarted) {
      const timer = setTimeout(() => {
        const aiCol = getAIMove(board);
        const newBoard = board.map(row => [...row]);
        dropPiece(newBoard, aiCol, 2);
        setBoard(newBoard);
        
        const result = checkWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningCells(result.cells);
          
          if (result.winner === 1) {
            setP1Score(prev => prev + 1);
          } else if (result.winner === 2) {
            setP2Score(prev => prev + 1);
          }
          
          updateGameStats('connectfour', {
            gamesPlayed: 1,
            gamesWon: result.winner === 1 ? 1 : 0,
            gamesLost: result.winner === 2 ? 1 : 0,
            totalScore: result.winner === 1 ? 1 : 0,
          });
          
          return;
        }
        
        setCurrentPlayer(1);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameStarted, gameMode, board, getAIMove, checkWinner, updateGameStats])();

  const resetGame = useCallback(() => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
  }, []);

  const resetAll = useCallback(() => {
    resetGame();
    setP1Score(0);
    setP2Score(0);
    setGameStarted(false);
  }, [resetGame]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    resetGame();
  }, [resetGame]);

  const isWinningCell = (row: number, col: number) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-yellow">CONNECT FOUR</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🔴🟡 Conecta 4 fichas y gana
          </p>
        </motion.div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-neon-yellow/30">
              <h2 className="text-2xl sm:text-3xl font-bold neon-text-yellow mb-6 text-center">
                CONFIGURACIÓN
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold neon-text-blue mb-3">Modo de Juego</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameMode('1p')}
                      className={`py-4 px-6 rounded-xl font-bold transition-all ${
                        gameMode === '1p'
                          ? 'bg-neon-yellow text-black shadow-neon-yellow'
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
                          ? 'bg-neon-yellow text-black shadow-neon-yellow'
                          : 'glass text-white/60 hover:text-white'
                      }`}
                    >
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      2 Jugadores
                    </motion.button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full btn-neon btn-yellow py-6 text-xl sm:text-2xl"
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
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-yellow mb-4">📊 MARCADOR</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl sm:text-6xl mb-2">🔴</div>
                    <div className="text-white/60 text-sm mb-1">Jugador 1</div>
                    <div className="text-3xl sm:text-4xl font-bold neon-text-pink">{p1Score}</div>
                  </div>
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl sm:text-6xl mb-2">🟡</div>
                    <div className="text-white/60 text-sm mb-1">
                      {gameMode === '1p' ? 'IA' : 'Jugador 2'}
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold neon-text-yellow">{p2Score}</div>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-blue mb-3">
                  {winner ? '🏆 RESULTADO' : '🎮 TURNO'}
                </h3>
                {!winner ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl sm:text-7xl mb-2"
                    >
                      {currentPlayer === 1 ? '🔴' : '🟡'}
                    </motion.div>
                    <p className="text-xl neon-text-blue">
                      {currentPlayer === 1 ? 'Jugador 1' : gameMode === '1p' ? 'IA pensando...' : 'Jugador 2'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl sm:text-7xl mb-2">
                      {winner === 'draw' ? '🤝' : winner === 1 ? '🔴' : '🟡'}
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold ${
                      winner === 'draw' ? 'neon-text-blue' :
                      winner === 1 ? 'neon-text-pink' : 'neon-text-yellow'
                    }`}>
                      {winner === 'draw' ? '¡EMPATE!' : winner === 1 ? '¡ROJO GANA!' : '¡AMARILLO GANA!'}
                    </p>
                  </div>
                )}
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🎯 REGLAS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/70">
                  <li>✓ Conecta 4 fichas del mismo color</li>
                  <li>✓ Horizontal, vertical o diagonal</li>
                  <li>✓ Las fichas caen por gravedad</li>
                  <li>✓ El primero en conectar 4 gana</li>
                </ul>
              </div>
            </motion.div>

            {/* Center - Game Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-yellow/50">
                <div className="inline-block bg-blue-900/50 rounded-2xl p-4">
                  <div className="grid gap-2">
                    {board.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2">
                        {row.map((cell, colIndex) => (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            onMouseEnter={() => setHoveredCol(colIndex)}
                            onMouseLeave={() => setHoveredCol(null)}
                            onClick={() => handleColumnClick(colIndex)}
                            whileHover={{ scale: 1.05 }}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                              isWinningCell(rowIndex, colIndex)
                                ? 'ring-4 ring-neon-green'
                                : hoveredCol === colIndex && !cell && rowIndex === 0 && !winner
                                ? 'bg-white/20'
                                : 'bg-blue-950/80'
                            }`}
                          >
                            <AnimatePresence>
                              {cell && (
                                <motion.div
                                  initial={{ scale: 0, y: -100 }}
                                  animate={{ scale: 1, y: 0 }}
                                  className="text-4xl sm:text-5xl"
                                >
                                  {cell === 1 ? '🔴' : '🟡'}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
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
                    REINICIAR
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
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-purple mb-4">🎮 CÓMO JUGAR</h3>
                <p className="text-xs sm:text-sm text-white/70 mb-3">
                  Haz clic en cualquier columna para soltar tu ficha. 
                  Las fichas caen hasta el fondo o sobre otra ficha.
                </p>
                <p className="text-xs sm:text-sm text-white/70">
                  ¡El primero en conectar 4 fichas en cualquier dirección gana!
                </p>
              </div>

              {gameMode === '1p' && (
                <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
                  <h3 className="text-lg sm:text-xl font-bold neon-text-pink mb-3">🤖 IA ESTRATÉGICA</h3>
                  <p className="text-xs sm:text-sm text-white/70">
                    La IA usa el algoritmo Minimax con evaluación de posiciones avanzada. 
                    ¡Piensa varios movimientos adelante!
                  </p>
                </div>
              )}

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-green mb-3">🏆 LOGROS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li>🏆 Primera victoria</li>
                  <li>🏆 Vencer IA</li>
                  <li>🏆 3 victorias seguidas</li>
                  <li>🏆 Victoria diagonal</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-3">💡 ESTRATEGIA</h3>
                <p className="text-xs sm:text-sm text-white/70">
                  Controla el centro del tablero y crea múltiples amenazas. 
                  ¡Bloquea a tu oponente antes de que conecte 4!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectFourGame;

