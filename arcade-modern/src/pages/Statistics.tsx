import { motion } from 'framer-motion';
import { useStatsContext } from '../context/StatsContext';
import { Trophy, Target, Clock, TrendingUp, Award, Gamepad2 } from 'lucide-react';

const Statistics = () => {
  const { stats, formatTime } = useStatsContext();

  const games = [
    { name: 'Tetris', key: 'tetris', emoji: '🧩', color: 'from-purple-600 to-pink-600' },
    { name: 'Snake', key: 'snake', emoji: '🐍', color: 'from-cyan-600 to-blue-600' },
    { name: 'Pong', key: 'pong', emoji: '🏓', color: 'from-green-600 to-emerald-600' },
    { name: 'Tic-Tac-Toe', key: 'tictactoe', emoji: '⭕', color: 'from-pink-600 to-rose-600' },
    { name: 'Space Invaders', key: 'spaceinvaders', emoji: '👾', color: 'from-orange-600 to-yellow-600' },
    { name: 'Connect Four', key: 'connectfour', emoji: '🔴', color: 'from-indigo-600 to-purple-600' },
    { name: 'Ajedrez', key: 'chess', emoji: '♟️', color: 'from-amber-600 to-orange-600' },
    { name: 'Parqués', key: 'parchis', emoji: '🎲', color: 'from-rose-600 to-pink-600' },
    { name: 'UNO', key: 'uno', emoji: '🎴', color: 'from-sky-600 to-blue-600' },
  ];

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
            <span className="neon-text-blue">ESTADÍSTICAS</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl px-4">
            Rastrea tu progreso y celebra tus logros
          </p>
        </motion.div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {[
            { icon: Gamepad2, label: 'Partidas Jugadas', value: stats.totalGamesPlayed, color: 'text-neon-yellow', gradient: 'from-yellow-600 to-orange-600' },
            { icon: Trophy, label: 'Logros Desbloqueados', value: stats.achievements.length, color: 'text-neon-pink', gradient: 'from-pink-600 to-rose-600' },
            { icon: Target, label: 'Puntuación Total', value: stats.totalScore.toLocaleString(), color: 'text-neon-green', gradient: 'from-green-600 to-emerald-600' },
            { icon: Clock, label: 'Tiempo Total', value: formatTime(stats.totalTime), color: 'text-neon-blue', gradient: 'from-blue-600 to-cyan-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-br ${stat.gradient} -z-10`} />
              <div className="glass-dark rounded-2xl p-6 border border-white/10 group-hover:border-neon-pink/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Per-Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold neon-text-green mb-4 sm:mb-6">
            📊 ESTADÍSTICAS POR JUEGO
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game) => {
              const gameStats = stats[game.key as keyof typeof stats] as any;
              const winRate = gameStats.gamesPlayed > 0 
                ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) 
                : 0;

              return (
                <motion.div
                  key={game.key}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="glass rounded-xl p-6 border border-white/10 hover:border-neon-pink/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl`}>
                      {game.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{game.name}</h3>
                      <p className="text-white/60 text-sm">{gameStats.gamesPlayed} partidas</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Récord:</span>
                      <span className="text-neon-yellow font-bold">{gameStats.highScore.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Victorias:</span>
                      <span className="text-neon-green font-bold">{gameStats.gamesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Derrotas:</span>
                      <span className="text-neon-pink font-bold">{gameStats.gamesLost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">% Victoria:</span>
                      <span className="text-neon-blue font-bold">{winRate}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 w-full bg-dark-800 rounded-full h-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${game.color} rounded-full transition-all duration-500`}
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-3xl font-bold neon-text-yellow mb-6">
            🏆 LOGROS DESBLOQUEADOS
          </h2>
          
          {stats.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass rounded-lg p-4 border border-neon-yellow/30 hover:border-neon-yellow transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-neon-yellow" />
                    <div>
                      <p className="font-bold text-white">{achievement}</p>
                      <p className="text-white/60 text-xs">Logro desbloqueado</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                ¡Aún no has desbloqueado ningún logro!
              </p>
              <p className="text-white/40 text-sm">
                Juega más para ganar logros increíbles
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;

