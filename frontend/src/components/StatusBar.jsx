import { motion } from 'motion/react';
import { Wallet, Loader2 } from 'lucide-react';

export default function StatusBar({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting,
}) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-900/30 backdrop-blur-sm"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-amber-400">Olympus NFT</h3>
            <p className="text-xs text-gray-400">Sacred Marketplace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {walletAddress && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 bg-slate-800/50 rounded-lg border border-amber-900/30"
            >
              <p className="text-sm text-gray-300">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </motion.div>
          )}

          <button
            onClick={walletAddress ? onDisconnect : onConnect}
            disabled={isConnecting}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : walletAddress ? (
              'Disconnect Wallet'
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
