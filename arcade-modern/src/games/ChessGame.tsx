import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | null;
type PieceColor = 'w' | 'b' | null;
type Piece = { type: PieceType; color: PieceColor };
type Board = (Piece | null)[][];
type Position = { row: number; col: number };
type GameMode = '1p' | '2p';

const pieceEmojis: Record<string, string> = {
  'wp': '♙', 'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚'
};

const ChessGame = () => {
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const initializeBoard = (): Board => {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces
    board[0] = [
      { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
      { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
    ];
    board[1] = Array(8).fill({ type: 'p', color: 'b' });
    
    // White pieces
    board[6] = Array(8).fill({ type: 'p', color: 'w' });
    board[7] = [
      { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
      { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
    ];
    
    return board;
  };

  const [board, setBoard] = useState<Board>(initializeBoard());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w');
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('1p');
  const [gameStarted, setGameStarted] = useState(false);
  const [whiteScore, setWhiteScore] = useState(0);
  const [blackScore, setBlackScore] = useState(0);
  const [capturedPieces, setCapturedPieces] = useState<{ w: Piece[]; b: Piece[] }>({ w: [], b: [] });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const getPieceValue = (piece: Piece | null): number => {
    if (!piece || !piece.type) return 0;
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    return values[piece.type] || 0;
  };

  const getValidMoves = useCallback((pos: Position, boardState: Board, checkForCheck = true): Position[] => {
    const piece = boardState[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];
    const { row, col } = pos;
    const { type, color } = piece;

    const addMoveIfValid = (r: number, c: number) => {
      if (!isValidPosition(r, c)) return false;
      const targetPiece = boardState[r][c];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: r, col: c });
        return !targetPiece;
      }
      return false;
    };

    if (type === 'p') {
      const direction = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      
      // Forward move
      if (!boardState[row + direction][col]) {
        moves.push({ row: row + direction, col });
        // Two squares from start
        if (row === startRow && !boardState[row + 2 * direction][col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      
      // Capture diagonally
      [-1, 1].forEach(dc => {
        const newRow = row + direction;
        const newCol = col + dc;
        if (isValidPosition(newRow, newCol)) {
          const target = boardState[newRow][newCol];
          if (target && target.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      });
    } else if (type === 'n') {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
    } else if (type === 'b') {
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
        }
      });
    } else if (type === 'r') {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
        }
      });
    } else if (type === 'q') {
      [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
        }
      });
    } else if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            addMoveIfValid(row + dr, col + dc);
          }
        }
      }
    }

    // Filter out moves that would put king in check (simplified)
    if (checkForCheck && color !== null) {
      return moves.filter(move => {
        const testBoard = boardState.map(r => [...r]);
        testBoard[move.row][move.col] = testBoard[row][col];
        testBoard[row][col] = null;
        return !isInCheck(color as 'w' | 'b', testBoard);
      });
    }

    return moves;
  }, []);

  const isInCheck = (color: 'w' | 'b', boardState: Board): boolean => {
    // Find king position
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color && piece.type === 'k' && piece.color === color) {
          kingPos = { row: r, col: c };
          break;
        }
      }
      if (kingPos) break;
    }
    
    if (!kingPos) return false;

    // Check if any opponent piece can attack the king
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color && piece.color !== color) {
          const moves = getValidMoves({ row: r, col: c }, boardState, false);
          if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  const evaluateBoard = (boardState: Board): number => {
    let score = 0;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          const value = getPieceValue(piece);
          const positionBonus = (piece.type === 'p' && ((piece.color === 'w' && r < 4) || (piece.color === 'b' && r > 3))) ? 0.5 : 0;
          const centerBonus = (r >= 3 && r <= 4 && c >= 3 && c <= 4) ? 0.3 : 0;
          
          const totalValue = value + positionBonus + centerBonus;
          score += piece.color === 'b' ? totalValue : -totalValue;
        }
      }
    }
    
    return score;
  };

  const minimax = useCallback((
    boardState: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number => {
    if (depth === 0) return evaluateBoard(boardState);

    const color: 'w' | 'b' = maximizing ? 'b' : 'w';
    let bestValue = maximizing ? -Infinity : Infinity;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color === color) {
          const moves = getValidMoves({ row: r, col: c }, boardState);
          
          for (const move of moves) {
            const testBoard = boardState.map(row => [...row]);
            testBoard[move.row][move.col] = testBoard[r][c];
            testBoard[r][c] = null;
            
            const value = minimax(testBoard, depth - 1, alpha, beta, !maximizing);
            
            if (maximizing) {
              bestValue = Math.max(bestValue, value);
              alpha = Math.max(alpha, value);
            } else {
              bestValue = Math.min(bestValue, value);
              beta = Math.min(beta, value);
            }
            
            if (beta <= alpha) return bestValue;
          }
        }
      }
    }
    
    return bestValue === Infinity || bestValue === -Infinity ? 0 : bestValue;
  }, [getValidMoves]);

  const getAIMove = useCallback((boardState: Board): { from: Position; to: Position } | null => {
    let bestMove: { from: Position; to: Position } | null = null;
    let bestValue = -Infinity;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece && piece.color === 'b') {
          const moves = getValidMoves({ row: r, col: c }, boardState);
          
          for (const move of moves) {
            const testBoard = boardState.map(row => [...row]);
            testBoard[move.row][move.col] = testBoard[r][c];
            testBoard[r][c] = null;
            
            const value = minimax(testBoard, 2, -Infinity, Infinity, false);
            
            if (value > bestValue) {
              bestValue = value;
              bestMove = { from: { row: r, col: c }, to: move };
            }
          }
        }
      }
    }
    
    return bestMove;
  }, [minimax, getValidMoves]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (winner || !gameStarted) return;
    if (gameMode === '1p' && currentPlayer === 'b') return;

    const piece = board[row][col];

    if (selectedPos) {
      // Try to move
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      
      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const captured = newBoard[row][col];
        
        if (captured) {
          setCapturedPieces(prev => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], captured]
          }));
        }
        
        newBoard[row][col] = newBoard[selectedPos.row][selectedPos.col];
        newBoard[selectedPos.row][selectedPos.col] = null;
        
        // Pawn promotion
        if (newBoard[row][col]?.type === 'p' && (row === 0 || row === 7)) {
          newBoard[row][col] = { type: 'q', color: currentPlayer };
        }
        
        const notation = `${String.fromCharCode(97 + selectedPos.col)}${8 - selectedPos.row}-${String.fromCharCode(97 + col)}${8 - row}`;
        setMoveHistory(prev => [...prev, notation]);
        
        setBoard(newBoard);
        setSelectedPos(null);
        setValidMoves([]);
        
        // Check for checkmate (simplified - check if opponent has no valid moves)
        const nextPlayer: 'w' | 'b' = currentPlayer === 'w' ? 'b' : 'w';
        let hasValidMoves = false;
        
        for (let r = 0; r < 8 && !hasValidMoves; r++) {
          for (let c = 0; c < 8 && !hasValidMoves; c++) {
            const p = newBoard[r][c];
            if (p && p.color === nextPlayer) {
              const moves = getValidMoves({ row: r, col: c }, newBoard);
              if (moves.length > 0) hasValidMoves = true;
            }
          }
        }
        
        if (!hasValidMoves) {
          setWinner(currentPlayer);
          if (currentPlayer === 'w') {
            setWhiteScore(prev => prev + 1);
          } else {
            setBlackScore(prev => prev + 1);
          }
          
          updateGameStats('chess', {
            gamesPlayed: 1,
            gamesWon: currentPlayer === 'w' ? 1 : 0,
            gamesLost: currentPlayer === 'b' ? 1 : 0,
            totalScore: currentPlayer === 'w' ? 1 : 0,
          });
          
          if (currentPlayer === 'w') {
            addAchievement('Victoria en Ajedrez', 'chess');
          }
        } else {
          setCurrentPlayer(nextPlayer);
        }
      } else {
        // Select new piece
        if (piece && piece.color === currentPlayer) {
          setSelectedPos({ row, col });
          setValidMoves(getValidMoves({ row, col }, board));
        } else {
          setSelectedPos(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select piece
      if (piece && piece.color === currentPlayer) {
        setSelectedPos({ row, col });
        setValidMoves(getValidMoves({ row, col }, board));
      }
    }
  }, [board, selectedPos, validMoves, currentPlayer, winner, gameStarted, gameMode, getValidMoves, updateGameStats, addAchievement]);

  // AI turn
  useCallback(() => {
    if (gameMode === '1p' && currentPlayer === 'b' && !winner && gameStarted) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        
        if (aiMove) {
          const newBoard = board.map(r => [...r]);
          const captured = newBoard[aiMove.to.row][aiMove.to.col];
          
          if (captured) {
            setCapturedPieces(prev => ({
              ...prev,
              b: [...prev.b, captured]
            }));
          }
          
          newBoard[aiMove.to.row][aiMove.to.col] = newBoard[aiMove.from.row][aiMove.from.col];
          newBoard[aiMove.from.row][aiMove.from.col] = null;
          
          if (newBoard[aiMove.to.row][aiMove.to.col]?.type === 'p' && aiMove.to.row === 7) {
            newBoard[aiMove.to.row][aiMove.to.col] = { type: 'q', color: 'b' };
          }
          
          setBoard(newBoard);
          setCurrentPlayer('w');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, gameStarted, gameMode, board, getAIMove])();

  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setSelectedPos(null);
    setValidMoves([]);
    setCurrentPlayer('w');
    setWinner(null);
    setCapturedPieces({ w: [], b: [] });
    setMoveHistory([]);
  }, []);

  const resetAll = useCallback(() => {
    resetGame();
    setWhiteScore(0);
    setBlackScore(0);
    setGameStarted(false);
  }, [resetGame]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    resetGame();
  }, [resetGame]);

  const isValidMoveCell = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col);
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
            <span className="neon-text-green">AJEDREZ</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            ♟️ El juego de estrategia definitivo
          </p>
        </motion.div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-neon-green/30">
              <h2 className="text-2xl sm:text-3xl font-bold neon-text-green mb-6 text-center">
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
                          ? 'bg-neon-green text-black shadow-neon-green'
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
                          ? 'bg-neon-green text-black shadow-neon-green'
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
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-green mb-4">📊 MARCADOR</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl mb-2">♔</div>
                    <div className="text-white/60 text-sm mb-1">Blancas</div>
                    <div className="text-3xl font-bold neon-text-blue">{whiteScore}</div>
                  </div>
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-5xl mb-2">♚</div>
                    <div className="text-white/60 text-sm mb-1">
                      {gameMode === '1p' ? 'IA (Negras)' : 'Negras'}
                    </div>
                    <div className="text-3xl font-bold neon-text-pink">{blackScore}</div>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
                <h3 className="text-lg font-bold neon-text-blue mb-3">
                  {winner ? '🏆 FIN' : '🎮 TURNO'}
                </h3>
                {!winner ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl mb-2"
                    >
                      {currentPlayer === 'w' ? '♔' : '♚'}
                    </motion.div>
                    <p className="text-lg neon-text-blue">
                      {currentPlayer === 'w' ? 'Blancas' : gameMode === '1p' ? 'IA pensando...' : 'Negras'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {winner === 'draw' ? '🤝' : winner === 'w' ? '♔' : '♚'}
                    </div>
                    <p className={`text-xl font-bold ${
                      winner === 'draw' ? 'neon-text-yellow' :
                      winner === 'w' ? 'neon-text-blue' : 'neon-text-pink'
                    }`}>
                      {winner === 'draw' ? 'EMPATE' : winner === 'w' ? '¡BLANCAS GANAN!' : '¡NEGRAS GANAN!'}
                    </p>
                  </div>
                )}
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
                <h3 className="text-lg font-bold neon-text-purple mb-3">👑 CAPTURADAS</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Por Blancas:</div>
                    <div className="flex flex-wrap gap-1 text-2xl">
                      {capturedPieces.w.map((p, i) => (
                        <span key={i}>{pieceEmojis[`${p.color}${p.type}`]}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Por Negras:</div>
                    <div className="flex flex-wrap gap-1 text-2xl">
                      {capturedPieces.b.map((p, i) => (
                        <span key={i}>{pieceEmojis[`${p.color}${p.type}`]}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Center - Chess Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-green/50">
                <div className="inline-block">
                  <div className="grid gap-0 border-4 border-amber-900/50">
                    {board.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex">
                        {row.map((piece, colIndex) => {
                          const isLight = (rowIndex + colIndex) % 2 === 0;
                          const isSelected = selectedPos?.row === rowIndex && selectedPos?.col === colIndex;
                          const isValidMove = isValidMoveCell(rowIndex, colIndex);
                          
                          return (
                            <motion.div
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() => handleCellClick(rowIndex, colIndex)}
                              whileHover={{ scale: 1.05 }}
                              className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer relative transition-all ${
                                isLight ? 'bg-amber-100' : 'bg-amber-800'
                              } ${isSelected ? 'ring-4 ring-neon-blue' : ''}
                              ${isValidMove ? 'ring-4 ring-neon-green' : ''}`}
                            >
                              {piece && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-4xl sm:text-5xl"
                                >
                                  {pieceEmojis[`${piece.color}${piece.type}`]}
                                </motion.span>
                              )}
                              {isValidMove && !piece && (
                                <div className="w-3 h-3 rounded-full bg-neon-green/50" />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex-1 btn-neon btn-green py-2 sm:py-3 text-sm"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    NUEVA
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetAll}
                    className="flex-1 btn-neon btn-blue py-2 sm:py-3 text-sm"
                  >
                    REINICIAR
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="flex-1 btn-neon btn-pink py-2 sm:py-3 text-sm"
                  >
                    <Home className="w-4 h-4" />
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
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-xl font-bold neon-text-yellow mb-3">📜 HISTORIAL</h3>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs text-white/70">
                  {moveHistory.length === 0 ? (
                    <p className="text-white/50">No hay movimientos aún</p>
                  ) : (
                    moveHistory.map((move, i) => (
                      <div key={i}>
                        {i % 2 === 0 && <span className="font-bold">{Math.floor(i / 2) + 1}. </span>}
                        {move}{' '}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-lg font-bold neon-text-green mb-3">📖 REGLAS BÁSICAS</h3>
                <ul className="space-y-1 text-xs text-white/70">
                  <li>♟ Peones: 1 adelante (2 inicio)</li>
                  <li>♜ Torres: Horizontal/Vertical</li>
                  <li>♞ Caballos: Forma de L</li>
                  <li>♝ Alfiles: Diagonal</li>
                  <li>♛ Reina: Todo</li>
                  <li>♚ Rey: 1 casilla</li>
                </ul>
              </div>

              {gameMode === '1p' && (
                <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
                  <h3 className="text-lg font-bold neon-text-pink mb-3">🤖 IA</h3>
                  <p className="text-xs text-white/70">
                    La IA usa Minimax con evaluación de posición avanzada. 
                    ¡Un oponente digno!
                  </p>
                </div>
              )}

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
                <h3 className="text-lg font-bold neon-text-blue mb-3">💡 CONSEJO</h3>
                <p className="text-xs text-white/70">
                  Controla el centro, desarrolla piezas rápido y protege tu rey.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;

