import { motion, AnimatePresence } from 'motion/react';
import { X, User, Wallet, Calendar, Layers } from 'lucide-react';

export default function NFTDetailModal({ nft, onClose }) {
  if (!nft) return null;

  // Helper to safely format addresses
  const formatAddress = (addr) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-5xl w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border-2 border-amber-900/40 shadow-[0_0_60px_rgba(251,191,36,0.3)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:rotate-90"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left: Image */}
            <div className="relative">
              <motion.img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover rounded-xl"
                layoutId={`nft-image-${nft.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
            </div>

            {/* Right: Details */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category badge */}
                <div className="inline-block px-4 py-1 rounded-full bg-amber-600/20 border border-amber-600/40 text-amber-400 text-sm mb-4">
                  {nft.category}
                </div>

                {/* Name and Token ID */}
                <h2 className="text-3xl text-amber-400 mb-2">{nft.name}</h2>
                <p className="text-gray-400 mb-6">Token #{nft.tokenId}</p>

                {/* Description */}
                <div className="mb-6 p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
                  <p className="text-gray-300 leading-relaxed">{nft.description}</p>
                </div>

                {/* Price */}
                {nft.price > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-lg border border-amber-600/40">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current Price</span>
                      <span className="text-3xl text-amber-400">{nft.price} ETH</span>
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <User className="w-4 h-4" />
        <span className="text-sm">Creator</span>
      </div>
      <p className="text-white text-sm truncate">
        {formatAddress(nft.creator || nft.owner)}
      </p>
    </div>

    <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Wallet className="w-4 h-4" />
        <span className="text-sm">Owner</span>
      </div>
      <p className="text-white text-sm truncate">
        {formatAddress(nft.owner)}
      </p>
    </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Collection</span>
                    </div>
                    <p className="text-white text-sm truncate">{nft.collection}</p>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Minted</span>
                    </div>
                    <p className="text-white text-sm">{formatDate(nft.mintedAt)}</p>
                  </div>
                </div>

                {/* Royalty */}
                {nft.royalty && (
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creator Royalty</span>
                      <span className="text-amber-400">{nft.royalty}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
