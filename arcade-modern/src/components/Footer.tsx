import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-neon-blue' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-neon-green' },
    { icon: Mail, href: '#', label: 'Email', color: 'hover:text-neon-yellow' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative mt-12 sm:mt-16 md:mt-20 glass-dark border-t border-white/10"
    >
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🕹️</span>
              <h3 className="text-xl font-bold neon-text-pink">ARCADE RETRO</h3>
            </div>
            <p className="text-white/60 text-sm">
              Colección de juegos clásicos reimaginados con tecnología moderna.
              Revive la nostalgia de los arcades de los 80s y 90s.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-neon-blue mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {['Juegos', 'Estadísticas', 'Logros', 'Temas', 'Ayuda'].map((item) => (
                <li key={item}>
                  <motion.a
                    href={`#${item.toLowerCase()}`}
                    whileHover={{ x: 5, color: '#ff006e' }}
                    className="text-white/60 hover:text-neon-pink transition-colors text-sm"
                  >
                    → {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold text-neon-green mb-4">Síguenos</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 rounded-full glass flex items-center justify-center ${color} transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-white/60 text-sm flex items-center gap-2">
            Desarrollado con <Heart className="w-4 h-4 text-neon-pink animate-pulse" fill="currentColor" /> 
            por Julian Clavijo © {currentYear}
          </p>
          <div className="flex gap-4 text-sm">
            <motion.a
              href="#privacidad"
              whileHover={{ color: '#ff006e' }}
              className="text-white/60 hover:text-neon-pink transition-colors"
            >
              Privacidad
            </motion.a>
            <span className="text-white/30">|</span>
            <motion.a
              href="#terminos"
              whileHover={{ color: '#ff006e' }}
              className="text-white/60 hover:text-neon-pink transition-colors"
            >
              Términos
            </motion.a>
            <span className="text-white/30">|</span>
            <motion.a
              href="#cookies"
              whileHover={{ color: '#ff006e' }}
              className="text-white/60 hover:text-neon-pink transition-colors"
            >
              Cookies
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl -z-10" />
    </motion.footer>
  );
};

export default Footer;

