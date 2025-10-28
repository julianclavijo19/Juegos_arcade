import { motion } from 'framer-motion';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: Award,
      label: 'Logros Desbloqueados',
      value: '12',
      total: '30',
      percentage: 40,
      color: 'text-neon-yellow',
      gradient: 'from-yellow-600 to-orange-600',
    },
    {
      icon: Target,
      label: 'Puntuación Total',
      value: '125,430',
      total: '∞',
      percentage: 65,
      color: 'text-neon-pink',
      gradient: 'from-pink-600 to-rose-600',
    },
    {
      icon: Clock,
      label: 'Tiempo Jugado',
      value: '24h 32m',
      total: '∞',
      percentage: 80,
      color: 'text-neon-blue',
      gradient: 'from-blue-600 to-cyan-600',
    },
    {
      icon: TrendingUp,
      label: 'Racha Actual',
      value: '7 días',
      total: 'Record: 15',
      percentage: 47,
      color: 'text-neon-green',
      gradient: 'from-green-600 to-emerald-600',
    },
  ];

  return (
    <section id="estadisticas" className="relative py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            <span className="neon-text-blue">TUS</span>
            <br />
            <span className="text-gradient">ESTADÍSTICAS</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg md:text-xl px-4">
            Rastrea tu progreso y celebra tus logros
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-br ${stat.gradient} -z-10`} />
              
              <div className="glass-dark rounded-2xl p-6 border border-white/10 group-hover:border-neon-pink/50 transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>

                {/* Value */}
                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-white/60 text-sm mb-3">
                  {stat.label}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stat.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                  />
                </div>

                {/* Total */}
                <div className="text-white/40 text-xs mt-2">
                  de {stat.total}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-dark rounded-2xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-bold neon-text-green mb-6">
            📊 ACTIVIDAD RECIENTE
          </h3>
          
          <div className="space-y-4">
            {[
              { game: 'TETRIS', action: 'Nuevo récord personal', score: '15,240', time: 'Hace 2 horas' },
              { game: 'SNAKE', action: 'Logro desbloqueado: "Velocista"', score: '-', time: 'Hace 5 horas' },
              { game: 'SPACE INVADERS', action: 'Completado nivel 10', score: '8,900', time: 'Ayer' },
              { game: 'PONG', action: 'Victoria contra IA Difícil', score: '21-19', time: 'Hace 2 días' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <div className="font-bold text-neon-yellow mb-1">{activity.game}</div>
                  <div className="text-white/60 text-sm">{activity.action}</div>
                </div>
                <div className="text-right">
                  <div className="text-neon-green font-bold">{activity.score}</div>
                  <div className="text-white/40 text-xs">{activity.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default StatsSection;

