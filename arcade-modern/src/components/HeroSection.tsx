import { motion } from 'framer-motion';
import { Play, Trophy, Star, Zap } from 'lucide-react';

const HeroSection = () => {
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  const stats = [
    { icon: Trophy, label: 'Juegos', value: '6+', color: 'text-neon-yellow' },
    { icon: Star, label: 'Jugadores', value: '10K+', color: 'text-neon-green' },
    { icon: Zap, label: 'Partidas', value: '50K+', color: 'text-neon-blue' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 retro-grid opacity-20" />
      
      {/* Glowing orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/30 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Floating emoji */}
          <motion.div
            animate={floatingAnimation}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-6 sm:mb-8 inline-block filter drop-shadow-2xl"
          >
            🕹️
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 px-4"
          >
            <span className="neon-text-pink animate-flicker">ARCADE</span>
            <br />
            <span className="text-gradient">RETRO EDITION</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4"
          >
            Revive la nostalgia de los clásicos con tecnología moderna. 
            <br className="hidden sm:block" />
            <span className="neon-text-blue">9 juegos legendarios</span> reimaginados para ti.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-14 md:mb-16 px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 0, 110, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon btn-pink text-base sm:text-lg px-8 sm:px-10 md:px-12 py-3 sm:py-4 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                <span className="whitespace-nowrap">EMPEZAR A JUGAR</span>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon btn-blue text-base sm:text-lg px-8 sm:px-10 md:px-12 py-3 sm:py-4 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="whitespace-nowrap">VER LOGROS</span>
              </span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 w-full"
          >
            {stats.map(({ icon: Icon, label, value, color }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-neon-pink/50 transition-all duration-300"
              >
                <Icon className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 ${color}`} />
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text-green mb-1 sm:mb-2">{value}</div>
                <div className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-neon-blue rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

