import { motion } from 'framer-motion';
import { useStatsContext } from '../context/StatsContext';
import { Lock, Trophy, Star } from 'lucide-react';

const Achievements = () => {
  const { stats } = useStatsContext();

  const allAchievements = [
    // Logros generales
    { id: 'first_game', name: 'Primera Partida', description: 'Juega tu primera partida', icon: '🎮', condition: (s: any) => s.totalGamesPlayed >= 1 },
    { id: 'ten_games', name: 'Jugador Activo', description: 'Juega 10 partidas', icon: '🏃', condition: (s: any) => s.totalGamesPlayed >= 10 },
    { id: 'fifty_games', name: 'Veterano', description: 'Juega 50 partidas', icon: '⭐', condition: (s: any) => s.totalGamesPlayed >= 50 },
    { id: 'hundred_games', name: 'Leyenda', description: 'Juega 100 partidas', icon: '👑', condition: (s: any) => s.totalGamesPlayed >= 100 },
    
    // Puntuación
    { id: 'score_1k', name: 'Mil Puntos', description: 'Alcanza 1,000 puntos totales', icon: '💯', condition: (s: any) => s.totalScore >= 1000 },
    { id: 'score_10k', name: 'Diez Mil', description: 'Alcanza 10,000 puntos totales', icon: '💰', condition: (s: any) => s.totalScore >= 10000 },
    { id: 'score_100k', name: 'Maestro de Puntos', description: 'Alcanza 100,000 puntos', icon: '💎', condition: (s: any) => s.totalScore >= 100000 },
    
    // Tiempo
    { id: 'time_1h', name: 'Primera Hora', description: 'Juega durante 1 hora', icon: '⏰', condition: (s: any) => s.totalTime >= 3600 },
    { id: 'time_10h', name: 'Dedicado', description: 'Juega durante 10 horas', icon: '⌛', condition: (s: any) => s.totalTime >= 36000 },
    { id: 'time_50h', name: 'Adicto', description: 'Juega durante 50 horas', icon: '🔥', condition: (s: any) => s.totalTime >= 180000 },
    
    // Juegos específicos - Tetris
    { id: 'tetris_first', name: 'Bloques Iniciales', description: 'Completa una partida de Tetris', icon: '🧩', condition: (s: any) => s.tetris.gamesPlayed >= 1 },
    { id: 'tetris_master', name: 'Maestro Tetris', description: 'Alcanza 10,000 puntos en Tetris', icon: '🎯', condition: (s: any) => s.tetris.highScore >= 10000 },
    
    // Snake
    { id: 'snake_first', name: 'Primera Serpiente', description: 'Completa una partida de Snake', icon: '🐍', condition: (s: any) => s.snake.gamesPlayed >= 1 },
    { id: 'snake_long', name: 'Serpiente Larga', description: 'Alcanza 50 de largo en Snake', icon: '🏆', condition: (s: any) => s.snake.highScore >= 50 },
    
    // Pong
    { id: 'pong_first', name: 'Primer Rebote', description: 'Juega tu primera partida de Pong', icon: '🏓', condition: (s: any) => s.pong.gamesPlayed >= 1 },
    { id: 'pong_win', name: 'Campeón Pong', description: 'Gana una partida de Pong', icon: '🥇', condition: (s: any) => s.pong.gamesWon >= 1 },
    
    // Multi-juegos
    { id: 'all_games', name: 'Explorador', description: 'Juega todos los juegos disponibles', icon: '🌟', condition: (s: any) => 
      s.tetris.gamesPlayed >= 1 && s.snake.gamesPlayed >= 1 && s.pong.gamesPlayed >= 1 && 
      s.tictactoe.gamesPlayed >= 1 && s.spaceinvaders.gamesPlayed >= 1 && s.connectfour.gamesPlayed >= 1
    },
    { id: 'perfect_day', name: 'Día Perfecto', description: 'Gana 5 partidas seguidas', icon: '✨', condition: () => false }, // TODO: implementar streak
  ];

  const unlockedAchievements = allAchievements.filter(a => a.condition(stats));
  const lockedAchievements = allAchievements.filter(a => !a.condition(stats));
  const progress = (unlockedAchievements.length / allAchievements.length) * 100;

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
            <span className="neon-text-yellow">LOGROS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 px-4">
            Desbloquea logros épicos jugando
          </p>
          
          {/* Progress */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80">Progreso Total</span>
              <span className="text-neon-green font-bold text-xl">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple rounded-full"
              />
            </div>
            <p className="text-white/60 text-sm mt-2">
              {unlockedAchievements.length} de {allAchievements.length} logros desbloqueados
            </p>
          </div>
        </motion.div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold neon-text-green mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
              DESBLOQUEADOS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {unlockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-br from-neon-yellow to-neon-green -z-10" />
                  <div className="glass-dark rounded-2xl p-6 border-2 border-neon-yellow/50 group-hover:border-neon-yellow transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-yellow to-neon-green flex items-center justify-center text-4xl flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                          {achievement.name}
                          <Star className="w-5 h-5 text-neon-yellow" fill="currentColor" />
                        </h3>
                        <p className="text-white/70 text-sm">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white/50 mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8" />
              BLOQUEADOS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-dark rounded-2xl p-6 border border-white/10 opacity-60"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-dark-800 flex items-center justify-center text-4xl flex-shrink-0 grayscale">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                        {achievement.name}
                        <Lock className="w-4 h-4 text-white/40" />
                      </h3>
                      <p className="text-white/50 text-sm">{achievement.description}</p>
                    </div>
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

export default Achievements;

