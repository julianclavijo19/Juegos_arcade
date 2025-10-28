import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameCard from './GameCard';

const GamesSection = () => {
  const navigate = useNavigate();
  
  const games = [
    {
      id: 'tetris',
      title: 'TETRIS',
      description: 'El clásico juego de bloques que desafía tu lógica y reflejos',
      emoji: '🧩',
      players: '1 Jugador',
      difficulty: '3 Niveles',
      color: 'purple',
      gradient: 'bg-gradient-to-br from-purple-600 to-pink-600',
    },
    {
      id: 'tictactoe',
      title: 'TRES EN RAYA',
      description: 'Demuestra tu estrategia en el juego más clásico de todos',
      emoji: '⭕',
      players: '1-2 Jugadores',
      difficulty: 'IA Avanzada',
      color: 'pink',
      gradient: 'bg-gradient-to-br from-pink-600 to-rose-600',
    },
    {
      id: 'snake',
      title: 'SNAKE',
      description: 'Controla la serpiente hambrienta y conviértete en leyenda',
      emoji: '🐍',
      players: '1 Jugador',
      difficulty: '3 Velocidades',
      color: 'cyan',
      gradient: 'bg-gradient-to-br from-cyan-600 to-blue-600',
    },
    {
      id: 'pong',
      title: 'PONG',
      description: 'El primer juego de arcade vuelve con estilo retro-futurista',
      emoji: '🏓',
      players: '1-2 Jugadores',
      difficulty: 'IA Inteligente',
      color: 'green',
      gradient: 'bg-gradient-to-br from-green-600 to-emerald-600',
    },
    {
      id: 'spaceinvaders',
      title: 'SPACE INVADERS',
      description: 'Defiende la Tierra de la invasión alienígena espacial',
      emoji: '👾',
      players: '1 Jugador',
      difficulty: 'Oleadas Infinitas',
      color: 'orange',
      gradient: 'bg-gradient-to-br from-orange-600 to-yellow-600',
    },
    {
      id: 'connectfour',
      title: 'CONNECT FOUR',
      description: 'Conecta 4 fichas y demuestra tu superioridad estratégica',
      emoji: '🔴',
      players: '1-2 Jugadores',
      difficulty: 'IA Estratégica',
      color: 'indigo',
      gradient: 'bg-gradient-to-br from-indigo-600 to-purple-600',
    },
    {
      id: 'chess',
      title: 'AJEDREZ',
      description: 'El juego de estrategia definitivo con IA avanzada',
      emoji: '♟️',
      players: '1-2 Jugadores',
      difficulty: 'IA Minimax',
      color: 'amber',
      gradient: 'bg-gradient-to-br from-amber-600 to-orange-600',
    },
    {
      id: 'parchis',
      title: 'PARQUÉS',
      description: 'El clásico juego de mesa familiar multijugador',
      emoji: '🎲',
      players: '2-4 Jugadores',
      difficulty: 'IA Estratégica',
      color: 'rose',
      gradient: 'bg-gradient-to-br from-rose-600 to-pink-600',
    },
    {
      id: 'uno',
      title: 'UNO',
      description: '¡El juego de cartas más emocionante del mundo!',
      emoji: '🎴',
      players: '2-4 Jugadores',
      difficulty: 'IA Táctica',
      color: 'sky',
      gradient: 'bg-gradient-to-br from-sky-600 to-blue-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleGameClick = (gameId: string) => {
    // Navegar a la ruta del juego (se implementarán próximamente)
    navigate(`/juego/${gameId}`);
  };

  return (
    <section id="juegos" className="relative py-12 sm:py-16 md:py-20 px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-12 md:mb-16"
      >
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
        >
          <span className="neon-text-yellow">JUEGOS</span>
          <br />
          <span className="text-gradient-green">DISPONIBLES</span>
        </motion.h2>
        <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4">
          Selecciona tu favorito y revive la época dorada de los arcades
        </p>
      </motion.div>

      {/* Games Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {games.map((game) => (
            <GameCard
              key={game.id}
              {...game}
              onClick={() => handleGameClick(game.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-neon-purple/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-neon-green/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default GamesSection;

