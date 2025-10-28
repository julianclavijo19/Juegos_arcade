import { motion } from 'framer-motion';
import { useStatsContext } from '../context/StatsContext';
import { Palette, Check, Lock } from 'lucide-react';

const Themes = () => {
  const { stats } = useStatsContext();

  const themes = [
    {
      id: 'neon',
      name: 'Neón Clásico',
      description: 'El tema por defecto con colores neón vibrantes',
      colors: ['#ff006e', '#3a86ff', '#06ffa5'],
      unlocked: true,
      requirement: 'Disponible por defecto',
    },
    {
      id: 'cyberpunk',
      name: 'Ciberpunk',
      description: 'Amarillo y verde estilo Matrix',
      colors: ['#ffb703', '#06ffa5', '#000000'],
      unlocked: stats.totalGamesPlayed >= 10,
      requirement: 'Juega 10 partidas',
    },
    {
      id: 'retro',
      name: 'Retro Wave',
      description: 'Púrpura y rosa nostálgicos de los 80s',
      colors: ['#8338ec', '#ff006e', '#fb5607'],
      unlocked: stats.totalScore >= 5000,
      requirement: 'Alcanza 5,000 puntos',
    },
    {
      id: 'matrix',
      name: 'Matrix',
      description: 'Verde fosforescente sobre negro',
      colors: ['#06ffa5', '#000000', '#0a0a1a'],
      unlocked: stats.totalTime >= 3600,
      requirement: 'Juega durante 1 hora',
    },
    {
      id: 'sunset',
      name: 'Atardecer',
      description: 'Naranja, rosa y violeta cálidos',
      colors: ['#fb5607', '#ff006e', '#8338ec'],
      unlocked: stats.achievements.length >= 5,
      requirement: 'Desbloquea 5 logros',
    },
    {
      id: 'ocean',
      name: 'Océano',
      description: 'Azules profundos y turquesa',
      colors: ['#3a86ff', '#06ffa5', '#0f3460'],
      unlocked: stats.totalGamesPlayed >= 50,
      requirement: 'Juega 50 partidas',
    },
    {
      id: 'fire',
      name: 'Fuego',
      description: 'Rojo, naranja y amarillo ardientes',
      colors: ['#ff006e', '#fb5607', '#ffb703'],
      unlocked: stats.totalScore >= 50000,
      requirement: 'Alcanza 50,000 puntos',
    },
    {
      id: 'galaxy',
      name: 'Galaxia',
      description: 'Púrpura, azul y rosa cósmicos',
      colors: ['#8338ec', '#3a86ff', '#ff006e'],
      unlocked: stats.achievements.length >= 15,
      requirement: 'Desbloquea 15 logros',
    },
  ];

  const unlockedThemes = themes.filter(t => t.unlocked);
  const lockedThemes = themes.filter(t => !t.unlocked);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-purple">TEMAS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl px-4">
            Personaliza tu experiencia arcade
          </p>
          <p className="text-white/50 text-xs sm:text-sm mt-2">
            {unlockedThemes.length} de {themes.length} temas desbloqueados
          </p>
        </motion.div>

        {/* Unlocked Themes */}
        {unlockedThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold neon-text-green mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8" />
              TEMAS DESBLOQUEADOS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {unlockedThemes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-br from-neon-pink to-neon-blue -z-10" />
                  <div className="glass-dark rounded-2xl p-6 border-2 border-white/10 group-hover:border-neon-pink/50 transition-all">
                    {/* Color Preview */}
                    <div className="flex gap-2 mb-4">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-20 rounded-lg shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Theme Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                        {theme.name}
                        <Check className="w-5 h-5 text-neon-green" />
                      </h3>
                      <p className="text-white/70 text-sm mb-2">{theme.description}</p>
                      <p className="text-neon-green text-xs">✓ {theme.requirement}</p>
                    </div>

                    {/* Apply Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full btn-neon btn-pink py-2 text-sm"
                    >
                      APLICAR TEMA
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked Themes */}
        {lockedThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white/50 mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8" />
              TEMAS BLOQUEADOS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lockedThemes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="glass-dark rounded-2xl p-6 border border-white/10 opacity-60"
                >
                  {/* Color Preview (Grayscale) */}
                  <div className="flex gap-2 mb-4 grayscale">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-20 rounded-lg"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Theme Info */}
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                      {theme.name}
                      <Lock className="w-4 h-4 text-white/40" />
                    </h3>
                    <p className="text-white/50 text-sm mb-2">{theme.description}</p>
                    <p className="text-white/40 text-xs">🔒 {theme.requirement}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Themes;

