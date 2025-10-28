import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Dice6 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

type PlayerColor = 'red' | 'yellow' | 'green' | 'blue';
type PlayerType = 'human' | 'ai';
type Piece = {
  id: number;
  color: PlayerColor;
  position: number; // -1: home, 0-67: board, 68+: goal
  isInGoal: boolean;
  isInHome: boolean;
};

type Player = {
  color: PlayerColor;
  type: PlayerType;
  pieces: Piece[];
  score: number;
};

const ParchisGame = () => {
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [numPlayers, setNumPlayers] = useState<2 | 3 | 4>(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rollingDice, setRollingDice] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [canRollAgain, setCanRollAgain] = useState(false);

  const playerColors: Record<PlayerColor, string> = {
    red: '#ff006e',
    yellow: '#ffbe0b',
    green: '#06ffa5',
    blue: '#3a86ff'
  };

  const playerStartPositions: Record<PlayerColor, number> = {
    red: 0,
    yellow: 17,
    green: 34,
    blue: 51
  };

  const initializeGame = useCallback((num: number) => {
    const colors: PlayerColor[] = ['red', 'yellow', 'green', 'blue'].slice(0, num) as PlayerColor[];
    const newPlayers: Player[] = colors.map((color, index) => ({
      color,
      type: index === 0 ? 'human' : 'ai',
      pieces: Array.from({ length: 4 }, (_, i) => ({
        id: index * 4 + i,
        color,
        position: -1,
        isInGoal: false,
        isInHome: true
      })),
      score: 0
    }));
    
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setSelectedPieceId(null);
    setWinner(null);
    setCanRollAgain(false);
  }, []);

  const rollDice = useCallback(() => {
    if (rollingDice || !gameStarted) return;
    
    setRollingDice(true);
    setSelectedPieceId(null);
    
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setRollingDice(false);
        setCanRollAgain(finalValue === 6);
      }
    }, 100);
  }, [rollingDice, gameStarted]);

  const canMovePiece = useCallback((piece: Piece, diceVal: number): boolean => {
    if (!diceVal) return false;
    
    // Can exit home only with 6
    if (piece.isInHome) {
      return diceVal === 6;
    }
    
    // Can't move if already in goal
    if (piece.isInGoal) {
      return false;
    }
    
    // Check if move would go past goal
    const newPosition = piece.position + diceVal;
    const goalPosition = 68;
    
    if (newPosition >= goalPosition) {
      return newPosition === goalPosition || newPosition <= goalPosition + 3;
    }
    
    return true;
  }, []);

  const movePiece = useCallback((pieceId: number, diceVal: number) => {
    if (!diceVal) return;
    
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(player => ({
        ...player,
        pieces: player.pieces.map(piece => {
          if (piece.id === pieceId) {
            if (piece.isInHome && diceVal === 6) {
              // Move out of home
              return {
                ...piece,
                isInHome: false,
                position: playerStartPositions[piece.color]
              };
            } else if (!piece.isInHome && !piece.isInGoal) {
              const newPos = piece.position + diceVal;
              
              // Check if reached goal
              if (newPos >= 68) {
                return {
                  ...piece,
                  position: newPos,
                  isInGoal: true
                };
              }
              
              return {
                ...piece,
                position: (newPos % 68)
              };
            }
          }
          return piece;
        })
      }));
      
      // Check for winner
      const playerWithAllPiecesInGoal = newPlayers.find(p => 
        p.pieces.every(piece => piece.isInGoal)
      );
      
      if (playerWithAllPiecesInGoal) {
        setWinner(playerWithAllPiecesInGoal.color);
        
        updateGameStats('parchis', {
          gamesPlayed: 1,
          gamesWon: playerWithAllPiecesInGoal.type === 'human' ? 1 : 0,
          gamesLost: playerWithAllPiecesInGoal.type === 'ai' ? 1 : 0,
          totalScore: playerWithAllPiecesInGoal.type === 'human' ? 1 : 0,
        });
        
        if (playerWithAllPiecesInGoal.type === 'human') {
          addAchievement('Victoria en Parqués', 'parchis');
        }
      }
      
      return newPlayers;
    });
    
    // Next turn (unless rolled 6)
    if (!canRollAgain) {
      setTimeout(() => {
        setCurrentPlayerIndex(prev => (prev + 1) % numPlayers);
        setDiceValue(null);
      }, 500);
    } else {
      setDiceValue(null);
      setCanRollAgain(false);
    }
    
    setSelectedPieceId(null);
  }, [canRollAgain, numPlayers, updateGameStats, addAchievement]);

  const handlePieceClick = useCallback((pieceId: number) => {
    if (!diceValue || winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.type !== 'human') return;
    
    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    if (!piece || !canMovePiece(piece, diceValue)) return;
    
    movePiece(pieceId, diceValue);
  }, [diceValue, winner, players, currentPlayerIndex, canMovePiece, movePiece]);

  // AI turn
  useCallback(() => {
    if (!gameStarted || winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer?.type === 'ai' && diceValue && !rollingDice) {
      const timer = setTimeout(() => {
        // Find movable pieces
        const movablePieces = currentPlayer.pieces.filter(p => canMovePiece(p, diceValue));
        
        if (movablePieces.length > 0) {
          // Prefer moving pieces closer to goal
          movablePieces.sort((a, b) => b.position - a.position);
          movePiece(movablePieces[0].id, diceValue);
        } else {
          // No valid moves, next turn
          setCurrentPlayerIndex(prev => (prev + 1) % numPlayers);
          setDiceValue(null);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Auto-roll for AI
    if (!diceValue && !rollingDice && currentPlayer?.type === 'ai' && !winner) {
      const timer = setTimeout(() => {
        rollDice();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameStarted, winner, players, currentPlayerIndex, diceValue, rollingDice, canMovePiece, movePiece, numPlayers, rollDice])();

  const startGame = useCallback(() => {
    initializeGame(numPlayers);
    setGameStarted(true);
  }, [numPlayers, initializeGame]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setWinner(null);
  }, []);

  const renderBoard = () => {
    if (!gameStarted) return null;

    return (
      <div className="relative w-full max-w-2xl aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4">
        {/* Center area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white rounded-xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">🎲 PARQUÉS</p>
              {diceValue && (
                <motion.div
                  key={diceValue}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  className="text-6xl"
                >
                  {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1]}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Player homes (corners) */}
        {players.map((player, idx) => {
          const positions = [
            { top: '5%', left: '5%' },
            { top: '5%', right: '5%' },
            { bottom: '5%', left: '5%' },
            { bottom: '5%', right: '5%' }
          ];
          
          return (
            <div
              key={player.color}
              className="absolute w-1/4 h-1/4 rounded-xl p-2"
              style={{
                ...positions[idx],
                backgroundColor: `${playerColors[player.color]}40`,
                border: currentPlayerIndex === idx ? `4px solid ${playerColors[player.color]}` : 'none'
              }}
            >
              <div className="grid grid-cols-2 gap-1 h-full">
                {player.pieces.filter(p => p.isInHome).map((piece) => (
                  <motion.button
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`rounded-full flex items-center justify-center text-2xl ${
                      selectedPieceId === piece.id ? 'ring-4 ring-white' : ''
                    } ${canMovePiece(piece, diceValue || 0) ? 'cursor-pointer' : 'opacity-50'}`}
                    style={{ backgroundColor: playerColors[player.color] }}
                  >
                    ⬤
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Pieces on board */}
        {players.map(player =>
          player.pieces
            .filter(p => !p.isInHome && !p.isInGoal)
            .map(piece => {
              // Calculate position on board (simplified circular path)
              const angle = (piece.position / 68) * Math.PI * 2 - Math.PI / 2;
              const radius = 35; // percentage
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              
              return (
                <motion.button
                  key={piece.id}
                  onClick={() => handlePieceClick(piece.id)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, left: `${x}%`, top: `${y}%` }}
                  whileHover={{ scale: 1.2 }}
                  className={`absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                    selectedPieceId === piece.id ? 'ring-4 ring-white' : ''
                  } ${canMovePiece(piece, diceValue || 0) ? 'cursor-pointer' : ''}`}
                  style={{
                    backgroundColor: playerColors[piece.color],
                    zIndex: 10
                  }}
                >
                  <span className="text-2xl">⬤</span>
                </motion.button>
              );
            })
        )}
      </div>
    );
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
            <span className="neon-text-pink">PARQUÉS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🎲 El clásico juego de mesa familiar
          </p>
        </motion.div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-dark rounded-2xl p-6 sm:p-8 border border-neon-pink/30">
              <h2 className="text-2xl sm:text-3xl font-bold neon-text-pink mb-6 text-center">
                CONFIGURACIÓN
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold neon-text-yellow mb-3">Número de Jugadores</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([2, 3, 4] as const).map(num => (
                      <motion.button
                        key={num}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNumPlayers(num)}
                        className={`py-4 px-6 rounded-xl font-bold transition-all ${
                          numPlayers === num
                            ? 'bg-neon-pink text-white shadow-neon-pink'
                            : 'glass text-white/60 hover:text-white'
                        }`}
                      >
                        {num} Jugadores
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-3 text-center">
                    (Tú vs IA)
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full btn-neon btn-pink py-6 text-xl sm:text-2xl"
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
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-pink/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-pink mb-4">🎮 JUGADORES</h3>
                <div className="space-y-2">
                  {players.map((player, idx) => {
                    const piecesInGoal = player.pieces.filter(p => p.isInGoal).length;
                    const isCurrentPlayer = idx === currentPlayerIndex;
                    
                    return (
                      <div
                        key={player.color}
                        className={`p-3 rounded-lg ${isCurrentPlayer ? 'ring-2' : 'opacity-60'}`}
                        style={{
                          backgroundColor: `${playerColors[player.color]}20`,
                          borderColor: playerColors[player.color]
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: playerColors[player.color] }}
                            />
                            <span className="font-bold">
                              {player.type === 'human' ? 'TÚ' : 'IA'} ({player.color.toUpperCase()})
                            </span>
                          </div>
                          <span className="text-sm">{piecesInGoal}/4 🏁</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-3">📖 REGLAS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/70">
                  <li>🎲 Tira el dado para moverte</li>
                  <li>⚅ Con 6 sacas fichas de casa</li>
                  <li>🏁 Lleva todas las fichas a la meta</li>
                  <li>🎯 El primero en lograrlo gana</li>
                  <li>🔄 Saca 6 para tirar de nuevo</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-blue/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-blue mb-3">💡 CONSEJO</h3>
                <p className="text-xs sm:text-sm text-white/70">
                  Intenta sacar todas tus fichas de casa rápido y distribúyelas en el tablero.
                </p>
              </div>
            </motion.div>

            {/* Center - Game Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-neon-pink/50">
                {renderBoard()}

                <div className="flex flex-col gap-3 mt-6">
                  {!winner && players[currentPlayerIndex]?.type === 'human' && !diceValue && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={rollDice}
                      disabled={rollingDice}
                      className="btn-neon btn-pink py-4 text-lg flex items-center justify-center gap-2"
                    >
                      <Dice6 className="w-6 h-6" />
                      {rollingDice ? 'TIRANDO...' : 'TIRAR DADO'}
                    </motion.button>
                  )}

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      className="flex-1 btn-neon btn-blue py-2 text-sm"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      NUEVA
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/')}
                      className="flex-1 btn-neon btn-green py-2 text-sm"
                    >
                      <Home className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {winner && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-2xl backdrop-blur-sm"
                    >
                      <div className="text-center p-6">
                        <motion.h2
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="text-5xl sm:text-6xl font-bold mb-4"
                          style={{ color: playerColors[winner] }}
                        >
                          {players.find(p => p.color === winner)?.type === 'human' ? '¡GANASTE!' : '¡IA GANA!'}
                        </motion.h2>
                        <p className="text-2xl text-white/80 mb-2">Victoria del jugador</p>
                        <p className="text-3xl font-bold" style={{ color: playerColors[winner] }}>
                          {winner.toUpperCase()}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-green/30">
                <h3 className="text-xl sm:text-2xl font-bold neon-text-green mb-4">🎯 OBJETIVO</h3>
                <p className="text-xs sm:text-sm text-white/70 mb-3">
                  Sé el primero en llevar tus 4 fichas desde la casa hasta la meta.
                </p>
                <p className="text-xs sm:text-sm text-white/60">
                  Muévete estratégicamente y usa los 6 a tu favor para tiradas extras.
                </p>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-purple/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-purple mb-3">🏆 LOGROS</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li>🏆 Primera Victoria</li>
                  <li>🏆 Victoria contra 3 IAs</li>
                  <li>🏆 Completar en menos de 50 turnos</li>
                  <li>🏆 Victoria perfecta (sin piezas capturadas)</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neon-yellow/30">
                <h3 className="text-lg sm:text-xl font-bold neon-text-yellow mb-3">🎲 DADO</h3>
                <div className="text-center">
                  {diceValue ? (
                    <motion.div
                      key={diceValue}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      className="text-8xl mb-2"
                    >
                      {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1]}
                    </motion.div>
                  ) : (
                    <div className="text-6xl mb-2 opacity-30">🎲</div>
                  )}
                  {canRollAgain && (
                    <p className="text-neon-green font-bold animate-pulse">
                      ¡TIRA DE NUEVO!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParchisGame;

