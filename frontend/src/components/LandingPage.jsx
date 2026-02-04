import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useState } from 'react';
import LightningEffect from './LightningEffect';

export default function LandingPage({ onEnter }) {
  const [showLightning, setShowLightning] = useState(false);

  const handleEnterClick = () => {
    setShowLightning(true);
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')] bg-cover bg-center animate-[zoom_20s_ease-in-out_infinite]" />
      </div>

      {/* Lightning Effect */}
      <LightningEffect show={showLightning} />

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-8">
        {/* Main Content - Parallax Layer 1 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-center max-w-4xl"
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] tracking-wide">
              OLYMPUS NFT
            </h1>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
          </motion.div>

          {/* Greeting Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mb-8"
          >
            <p className="text-2xl md:text-3xl text-amber-100 mb-4 font-light tracking-wider">
              Welcome to the Divine Realm
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Enter the sacred marketplace of gods and heroes. Discover legendary NFTs forged in the fires of Mount Olympus, where ancient power meets the blockchain. Each artifact carries the blessing of the immortals.
            </p>
          </motion.div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <button
              onClick={handleEnterClick}
              className="group relative px-12 py-5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black rounded-lg overflow-hidden shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:shadow-[0_0_60px_rgba(251,191,36,0.8)] transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-3 text-xl tracking-wider">
                <Zap className="w-6 h-6" />
                Enter the Marketplace
                <Zap className="w-6 h-6" />
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Phone Number - Parallax Layer 2 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 text-gray-400 text-sm"
        >
          Support: +1 (555) OLYMPUS
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </div>
  );
}
