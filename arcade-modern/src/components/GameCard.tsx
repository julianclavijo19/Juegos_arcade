import { motion } from 'framer-motion';
import { Gamepad2, Users, Zap } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  emoji: string;
  players: string;
  difficulty: string;
  color: string;
  gradient: string;
  onClick?: () => void;
}

const GameCard = ({
  title,
  description,
  emoji,
  players,
  difficulty,
  gradient,
  onClick,
}: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.02,
        y: -10,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer will-change-transform"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${gradient} -z-10`} />
      
      {/* Card */}
      <div className="relative glass-dark rounded-2xl p-6 overflow-hidden border-2 border-white/10 group-hover:border-neon-pink/50 transition-all duration-300">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 scanline opacity-30" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="text-7xl mb-4 filter drop-shadow-2xl"
          >
            {emoji}
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-2 neon-text-yellow">
            {title}
          </h3>

          {/* Description */}
          <p className="text-white/70 mb-4 text-sm">
            {description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 glass px-3 py-1 rounded-full text-xs"
            >
              <Users className="w-4 h-4 text-neon-green" />
              <span className="text-white/80">{players}</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 glass px-3 py-1 rounded-full text-xs"
            >
              <Zap className="w-4 h-4 text-neon-blue" />
              <span className="text-white/80">{difficulty}</span>
            </motion.div>
          </div>

          {/* Play button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 btn-neon btn-pink text-sm py-3"
          >
            <span className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              JUGAR AHORA
            </span>
          </motion.button>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-neon-pink/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-neon-blue/20 to-transparent rounded-tr-full" />
      </div>
    </motion.div>
  );
};

export default GameCard;

