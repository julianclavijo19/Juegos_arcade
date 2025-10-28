import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStatsContext } from '../context/StatsContext';

type CardColor = 'red' | 'yellow' | 'green' | 'blue' | 'black';
type CardType = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

type Card = {
  id: string;
  color: CardColor;
  type: CardType;
};

type Player = {
  id: number;
  name: string;
  cards: Card[];
  isHuman: boolean;
};

const UnoGame = () => {
  const navigate = useNavigate();
  const { updateGameStats, addAchievement } = useStatsContext();
  
  const [numPlayers, setNumPlayers] = useState<2 | 3 | 4>(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [direction, setDirection] = useState(1); // 1 = clockwise, -1 = counter-clockwise
  const [winner, setWinner] = useState<number | null>(null);
  const [selectedWildColor, setSelectedWildColor] = useState<CardColor | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [unoCallRequired, setUnoCallRequired] = useState(false);

  const colorMap: Record<CardColor, string> = {
    red: '#ff006e',
    yellow: '#ffbe0b',
    green: '#06ffa5',
    blue: '#3a86ff',
    black: '#1a1a2e'
  };

  const createDeck = useCallback((): Card[] => {
    const colors: CardColor[] = ['red', 'yellow', 'green', 'blue'];
    const numbers: CardType[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const actions: CardType[] = ['skip', 'reverse', 'draw2'];
    
    const cards: Card[] = [];
    let id = 0;
    
    // Number cards (2 of each except 0)
    colors.forEach(color => {
      cards.push({ id: `${id++}`, color, type: '0' });
      numbers.slice(1).forEach(num => {
        cards.push({ id: `${id++}`, color, type: num });
        cards.push({ id: `${id++}`, color, type: num });
      });
    });
    
    // Action cards (2 of each per color)
    colors.forEach(color => {
      actions.forEach(action => {
        cards.push({ id: `${id++}`, color, type: action });
        cards.push({ id: `${id++}`, color, type: action });
      });
    });
    
    // Wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      cards.push({ id: `${id++}`, color: 'black', type: 'wild' });
      cards.push({ id: `${id++}`, color: 'black', type: 'wild4' });
    }
    
    return cards.sort(() => Math.random() - 0.5);
  }, []);

  const initializeGame = useCallback((num: number) => {
    const newDeck = createDeck();
    const newPlayers: Player[] = Array.from({ length: num }, (_, i) => ({
      id: i,
      name: i === 0 ? 'TÚ' : `IA ${i}`,
      cards: [],
      isHuman: i === 0
    }));
    
    // Deal 7 cards to each player
    newPlayers.forEach(player => {
      player.cards = newDeck.splice(0, 7);
    });
    
    // First card to discard pile (not special)
    let firstCard = newDeck.shift()!;
    while (firstCard.type === 'wild' || firstCard.type === 'wild4') {
      newDeck.push(firstCard);
      firstCard = newDeck.shift()!;
    }
    
    setPlayers(newPlayers);
    setDeck(newDeck);
    setDiscardPile([firstCard]);
    setCurrentPlayerIndex(0);
    setDirection(1);
    setWinner(null);
    setUnoCallRequired(false);
  }, [createDeck]);

  const canPlayCard = useCallback((card: Card, topCard: Card): boolean => {
    if (card.type === 'wild' || card.type === 'wild4') return true;
    if (topCard.color === 'black' && selectedWildColor) {
      return card.color === selectedWildColor;
    }
    return card.color === topCard.color || card.type === topCard.type;
  }, [selectedWildColor]);

  const drawCard = useCallback((playerId: number, count: number = 1) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = newPlayers[playerId];
      
      let drawnCards: Card[] = [];
      for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
          // Reshuffle discard pile into deck
          const newDeck = discardPile.slice(0, -1).sort(() => Math.random() - 0.5);
          setDeck(newDeck);
          drawnCards.push(newDeck.shift()!);
        } else {
          drawnCards.push(deck.shift()!);
        }
      }
      
      player.cards.push(...drawnCards);
      return newPlayers;
    });
  }, [deck, discardPile]);

  const playCard = useCallback((playerId: number, cardIndex: number) => {
    const player = players[playerId];
    const card = player.cards[cardIndex];
    const topCard = discardPile[discardPile.length - 1];
    
    if (!canPlayCard(card, topCard)) return;
    
    // Remove card from player hand
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[playerId].cards.splice(cardIndex, 1);
      
      // Check UNO (1 card left)
      if (newPlayers[playerId].cards.length === 1) {
        setUnoCallRequired(true);
      }
      
      // Check winner
      if (newPlayers[playerId].cards.length === 0) {
        setWinner(playerId);
        
        updateGameStats('uno', {
          gamesPlayed: 1,
          gamesWon: player.isHuman ? 1 : 0,
          gamesLost: player.isHuman ? 0 : 1,
          totalScore: player.isHuman ? 1 : 0,
        });
        
        if (player.isHuman) {
          addAchievement('Victoria en UNO', 'uno');
        }
        
        return newPlayers;
      }
      
      return newPlayers;
    });
    
    // Add card to discard pile
    setDiscardPile(prev => [...prev, card]);
    
    // Handle special cards
    let nextPlayerOffset = direction;
    
    if (card.type === 'wild' || card.type === 'wild4') {
      if (player.isHuman) {
        setShowColorPicker(true);
        return; // Wait for color selection
      } else {
        // AI picks random color
        const colors: CardColor[] = ['red', 'yellow', 'green', 'blue'];
        setSelectedWildColor(colors[Math.floor(Math.random() * colors.length)]);
        
        if (card.type === 'wild4') {
          const nextPlayer = (currentPlayerIndex + direction + numPlayers) % numPlayers;
          drawCard(nextPlayer, 4);
          nextPlayerOffset = direction * 2; // Skip next player
        }
      }
    } else if (card.type === 'skip') {
      nextPlayerOffset = direction * 2;
    } else if (card.type === 'reverse') {
      setDirection(prev => -prev);
      nextPlayerOffset = -direction;
    } else if (card.type === 'draw2') {
      const nextPlayer = (currentPlayerIndex + direction + numPlayers) % numPlayers;
      drawCard(nextPlayer, 2);
      nextPlayerOffset = direction * 2;
    }
    
    // Next turn
    setCurrentPlayerIndex(prev => (prev + nextPlayerOffset + numPlayers) % numPlayers);
    setUnoCallRequired(false);
  }, [players, discardPile, canPlayCard, direction, currentPlayerIndex, numPlayers, drawCard, updateGameStats, addAchievement]);

  const handleColorSelect = useCallback((color: CardColor) => {
    setSelectedWildColor(color);
    setShowColorPicker(false);
    
    const card = discardPile[discardPile.length - 1];
    
    if (card.type === 'wild4') {
      const nextPlayer = (currentPlayerIndex + direction + numPlayers) % numPlayers;
      drawCard(nextPlayer, 4);
      setCurrentPlayerIndex((currentPlayerIndex + direction * 2 + numPlayers) % numPlayers);
    } else {
      setCurrentPlayerIndex((currentPlayerIndex + direction + numPlayers) % numPlayers);
    }
  }, [discardPile, currentPlayerIndex, direction, numPlayers, drawCard]);

  const handleDrawCard = useCallback(() => {
    if (winner) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer.isHuman) return;
    
    drawCard(currentPlayerIndex, 1);
    
    // Auto-pass turn
    setTimeout(() => {
      setCurrentPlayerIndex(prev => (prev + direction + numPlayers) % numPlayers);
    }, 500);
  }, [players, currentPlayerIndex, winner, drawCard, direction, numPlayers]);

  // AI turn
  useEffect(() => {
    if (!gameStarted || winner || showColorPicker) return;
    
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isHuman) return;
    
    const timer = setTimeout(() => {
      const topCard = discardPile[discardPile.length - 1];
      const playableCards = currentPlayer.cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => canPlayCard(card, topCard));
      
      if (playableCards.length > 0) {
        // Prefer special cards
        const specialCard = playableCards.find(({ card }) => 
          ['skip', 'reverse', 'draw2', 'wild', 'wild4'].includes(card.type)
        );
        const cardToPlay = specialCard || playableCards[0];
        playCard(currentPlayerIndex, cardToPlay.index);
      } else {
        drawCard(currentPlayerIndex, 1);
        setCurrentPlayerIndex(prev => (prev + direction + numPlayers) % numPlayers);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [gameStarted, winner, showColorPicker, players, currentPlayerIndex, discardPile, canPlayCard, playCard, drawCard, direction, numPlayers]);

  const startGame = useCallback(() => {
    initializeGame(numPlayers);
    setGameStarted(true);
  }, [numPlayers, initializeGame]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setWinner(null);
  }, []);

  const renderCard = (card: Card, _index?: number, onClick?: () => void) => {
    const isWild = card.color === 'black';
    const displayColor = isWild && selectedWildColor ? selectedWildColor : card.color;
    
    return (
      <motion.div
        key={card.id}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={onClick ? { scale: 1.1, y: -10 } : {}}
        onClick={onClick}
        className={`relative w-16 sm:w-20 h-24 sm:h-28 rounded-xl flex items-center justify-center cursor-pointer shadow-lg ${
          onClick ? 'hover:shadow-2xl' : ''
        }`}
        style={{
          backgroundColor: colorMap[displayColor],
          border: '4px solid white'
        }}
      >
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-bold text-white">
            {card.type === 'wild' && '🌈'}
            {card.type === 'wild4' && '🌈+4'}
            {card.type === 'skip' && '🚫'}
            {card.type === 'reverse' && '🔄'}
            {card.type === 'draw2' && '+2'}
            {!['wild', 'wild4', 'skip', 'reverse', 'draw2'].includes(card.type) && card.type}
          </div>
        </div>
      </motion.div>
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
            <span className="neon-text-blue">UNO</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg">
            🎴 ¡El juego de cartas más emocionante!
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
                            ? 'bg-neon-blue text-white shadow-neon-blue'
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
                  className="w-full btn-neon btn-blue py-6 text-xl sm:text-2xl"
                >
                  COMENZAR PARTIDA
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Other players' hands */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {players.filter((_, idx) => idx !== 0).map(player => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-dark rounded-xl p-4 border ${
                    currentPlayerIndex === player.id ? 'border-neon-yellow' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{player.name}</span>
                    <span className="text-sm text-white/60">{player.cards.length} cartas</span>
                  </div>
                  <div className="flex gap-1">
                    {player.cards.slice(0, 7).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg border-2 border-white"
                      />
                    ))}
                    {player.cards.length > 7 && (
                      <div className="flex items-center justify-center text-white/60 text-sm">
                        +{player.cards.length - 7}
                      </div>
                    )}
                  </div>
                  {unoCallRequired && player.cards.length === 1 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-center mt-2 text-neon-yellow font-bold"
                    >
                      ¡UNO!
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Game Board */}
            <div className="glass-dark rounded-2xl p-6 sm:p-8 border-2 border-neon-blue/50">
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* Deck */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDrawCard}
                    disabled={!players[0] || !players[0].isHuman || currentPlayerIndex !== 0 || winner !== null}
                    className="relative w-20 h-28 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center cursor-pointer shadow-lg disabled:opacity-50 border-4 border-white"
                  >
                    <Plus className="w-12 h-12 text-white" />
                  </motion.button>
                  <p className="text-xs text-white/60 mt-2">{deck.length} cartas</p>
                </div>

                {/* Discard Pile */}
                <div className="text-center">
                  {discardPile.length > 0 && renderCard(discardPile[discardPile.length - 1])}
                  <p className="text-xs text-white/60 mt-2">Descarte</p>
                </div>
              </div>

              {/* Direction indicator */}
              <div className="text-center mb-4">
                <span className="text-2xl">{direction === 1 ? '➡️' : '⬅️'}</span>
                <p className="text-xs text-white/60">Dirección</p>
              </div>

              {/* Your hand */}
              {players[0] && (
                <div className="border-t-2 border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold neon-text-green">Tu Mano</h3>
                    {unoCallRequired && players[0].cards.length === 1 && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-2xl font-bold neon-text-yellow"
                      >
                        ¡UNO!
                      </motion.span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {players[0].cards.map((card, index) => {
                      const topCard = discardPile[discardPile.length - 1];
                      const canPlay = currentPlayerIndex === 0 && canPlayCard(card, topCard) && !winner;
                      
                      return renderCard(
                        card,
                        index,
                        canPlay ? () => playCard(0, index) : undefined
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 mt-6">
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
                  className="flex-1 btn-neon btn-pink py-2 text-sm"
                >
                  <Home className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Color Picker */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-2xl backdrop-blur-sm z-50"
                  >
                    <div className="text-center p-6">
                      <h3 className="text-2xl font-bold neon-text-blue mb-6">Elige un color</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(['red', 'yellow', 'green', 'blue'] as CardColor[]).map(color => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleColorSelect(color)}
                            className="w-24 h-24 rounded-xl shadow-lg"
                            style={{ backgroundColor: colorMap[color] }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winner */}
              <AnimatePresence>
                {winner !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-2xl backdrop-blur-sm z-50"
                  >
                    <div className="text-center p-6">
                      <motion.h2
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-5xl sm:text-6xl font-bold neon-text-green mb-4"
                      >
                        {players[winner]?.isHuman ? '¡GANASTE!' : '¡IA GANA!'}
                      </motion.h2>
                      <p className="text-2xl text-white/80">{players[winner]?.name} es el ganador</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rules */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-dark rounded-xl p-4 border border-neon-yellow/30">
                <h3 className="text-lg font-bold neon-text-yellow mb-2">📖 REGLAS</h3>
                <ul className="space-y-1 text-xs text-white/70">
                  <li>🎴 Combina color o número</li>
                  <li>🌈 Comodín cambia color</li>
                  <li>🚫 Saltar pierde turno</li>
                  <li>🔄 Reversa cambia sentido</li>
                  <li>+2/+4 Siguiente roba cartas</li>
                </ul>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-neon-green/30">
                <h3 className="text-lg font-bold neon-text-green mb-2">🎯 OBJETIVO</h3>
                <p className="text-xs text-white/70">
                  Sé el primero en quedarte sin cartas. Di "UNO" cuando te quede solo una carta.
                </p>
              </div>

              <div className="glass-dark rounded-xl p-4 border border-neon-pink/30">
                <h3 className="text-lg font-bold neon-text-pink mb-2">💡 CONSEJO</h3>
                <p className="text-xs text-white/70">
                  Guarda las cartas especiales para momentos clave. Los comodines son tus mejores aliados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnoGame;

