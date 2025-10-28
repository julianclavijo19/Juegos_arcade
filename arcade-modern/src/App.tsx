import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsProvider } from './context/StatsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import Statistics from './pages/Statistics';
import Achievements from './pages/Achievements';
import Themes from './pages/Themes';
import TetrisGame from './games/TetrisGame';
import SnakeGame from './games/SnakeGame';
import PongGame from './games/PongGame';
import TicTacToeGame from './games/TicTacToeGame';
import SpaceInvadersGame from './games/SpaceInvadersGame';
import ConnectFourGame from './games/ConnectFourGame';
import ChessGame from './games/ChessGame';
import ParchisGame from './games/ParchisGame';
import UnoGame from './games/UnoGame';
import { X } from 'lucide-react';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <StatsProvider>
      <Router>
        <div className="relative min-h-screen">
          {/* Particles Background */}
          <ParticlesBackground />

          {/* Header */}
          <Header onSettingsClick={() => setShowSettings(true)} />

          {/* Main Content */}
          <main className="relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/estadisticas" element={<Statistics />} />
              <Route path="/logros" element={<Achievements />} />
              <Route path="/temas" element={<Themes />} />
              <Route path="/juego/tetris" element={<TetrisGame />} />
              <Route path="/juego/snake" element={<SnakeGame />} />
              <Route path="/juego/pong" element={<PongGame />} />
              <Route path="/juego/tictactoe" element={<TicTacToeGame />} />
              <Route path="/juego/spaceinvaders" element={<SpaceInvadersGame />} />
              <Route path="/juego/connectfour" element={<ConnectFourGame />} />
              <Route path="/juego/chess" element={<ChessGame />} />
              <Route path="/juego/parchis" element={<ParchisGame />} />
              <Route path="/juego/uno" element={<UnoGame />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-dark-800 border-l border-neon-blue/30 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold neon-text-yellow">⚙️ CONFIGURACIÓN</h2>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(false)}
                    className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-neon-pink/20"
                  >
                    <X className="w-6 h-6 text-neon-pink" />
                  </motion.button>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                  {/* Audio Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-6"
                  >
                    <h3 className="text-xl font-bold text-neon-green mb-4">🔊 Audio</h3>
                    <div className="space-y-4">
      <div>
                        <label className="text-white/80 text-sm mb-2 block">
                          Volumen Maestro: <span className="text-neon-blue font-bold">70%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="70"
                          className="w-full accent-neon-blue"
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-green" />
                        <span className="text-white/80">Efectos de sonido</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-green" />
                        <span className="text-white/80">Música de fondo</span>
                      </label>
                    </div>
                  </motion.div>

                  {/* Theme Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-6"
                  >
                    <h3 className="text-xl font-bold text-neon-purple mb-4">🎨 Temas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Neón', colors: ['#ff006e', '#3a86ff'] },
                        { name: 'Ciberpunk', colors: ['#ffb703', '#06ffa5'] },
                        { name: 'Retro', colors: ['#8338ec', '#ff006e'] },
                        { name: 'Matrix', colors: ['#06ffa5', '#000000'] },
                      ].map((theme) => (
                        <motion.button
                          key={theme.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 glass rounded-lg hover:border-neon-pink border border-white/10 transition-all"
                        >
                          <div className="flex gap-2 mb-2">
                            {theme.colors.map((color) => (
                              <div
                                key={color}
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-white/80">{theme.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Graphics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-6"
                  >
                    <h3 className="text-xl font-bold text-neon-blue mb-4">✨ Efectos Visuales</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-blue" />
                        <span className="text-white/80">Partículas</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-blue" />
                        <span className="text-white/80">Efectos de brillo</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-blue" />
                        <span className="text-white/80">Animaciones</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-neon-blue" />
                        <span className="text-white/80">Scanlines retro</span>
                      </label>
                    </div>
                  </motion.div>

                  {/* Reset Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-neon btn-pink py-4"
                  >
                    🔄 RESETEAR TODAS LAS ESTADÍSTICAS
                  </motion.button>
      </div>
      </div>
            </motion.div>
    </>
        )}
      </AnimatePresence>
        </div>
      </Router>
    </StatsProvider>
  );
}

export default App;
