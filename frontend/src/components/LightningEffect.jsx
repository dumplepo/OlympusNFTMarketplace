import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export default function LightningEffect({ show, onComplete }) {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, times: [0, 0.1, 0.2, 1] }}
            className="fixed inset-0 bg-blue-100/30 pointer-events-none z-[100]"
          />

          {/* Lightning Bolt */}
          <motion.svg
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: [0, 1, 1, 0], pathLength: [0, 1, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 w-4 h-full pointer-events-none z-[101]"
            viewBox="0 0 10 100"
            style={{ filter: 'drop-shadow(0 0 8px rgba(147, 197, 253, 0.8))' }}
          >
            <motion.path
              d="M 5 0 L 3 30 L 6 30 L 4 60 L 7 60 L 5 100"
              stroke="url(#lightning-gradient)"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
            <defs>
              <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
                <stop offset="20%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="80%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
          </motion.svg>
        </>
      )}
    </AnimatePresence>
  );
}
