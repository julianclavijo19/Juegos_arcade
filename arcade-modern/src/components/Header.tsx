import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onSettingsClick?: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleTheme = () => setIsDark(!isDark);

  const navItems = [
    { name: 'Juegos', path: '/' },
    { name: 'Estadísticas', path: '/estadisticas' },
    { name: 'Logros', path: '/logros' },
    { name: 'Temas', path: '/temas' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center shadow-neon-pink">
                <span className="text-xl sm:text-2xl">🕹️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold neon-text-pink animate-flicker">
                  ARCADE
                </h1>
                <p className="text-xs text-neon-blue">RETRO EDITION</p>
              </div>
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className={`font-semibold transition-colors ${
                    location.pathname === item.path
                      ? 'text-neon-pink'
                      : 'text-white/80 hover:text-neon-pink'
                  }`}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center hover:bg-neon-blue/20 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-neon-yellow" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="hidden sm:flex w-10 h-10 rounded-full glass items-center justify-center hover:bg-neon-blue/20 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-neon-pink" />
              ) : (
                <Volume2 className="w-5 h-5 text-neon-green" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center hover:bg-neon-pink/20 transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neon-pink" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

