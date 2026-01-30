import { motion } from 'motion/react';
import { Heart, Eye } from 'lucide-react';
import { useState } from 'react';

// Golden ratio: width / height = 1.618
export default function NFTCard({
  nft,
  isFavorite,
  onToggleFavorite,
  onCardClick,
  actions,
  index = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer"
      style={{ aspectRatio: ' 1 / 1.618' }}
    >
      {/* Card Container */}
      <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-amber-900/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all duration-500">
        
        {/* Image Section (61.8%) */}
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{ height: '65%' }}
          onClick={onCardClick}
        >
          <motion.img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button>

          {/* Category badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600/90 backdrop-blur-sm text-xs text-black">
            {nft.category}
          </div>

          {/* View details overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-white">
              <Eye className="w-6 h-6" />
              <span>View Details</span>
            </div>
          </motion.div>
        </div>

        {/* Info Section (38.2%) */}
        <div
          className="relative p-4 flex flex-col justify-between"
          style={{ height: '35%' }}
        >
          <div onClick={onCardClick} className="cursor-pointer">
            <h1 className="text-amber-400 mb-1 truncate">{nft.name}</h1>
            <div className="flex items-center justify-between mb-2">
              <span className="text-s text-gray-400">Token #{nft.tokenId}</span>
              <span className="text-lg text-amber-400">
                {nft.price} ETH
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none"
          animate={{ x: isHovered ? ['0%', '100%'] : '0%' }}
          transition={{ duration: 0.8 }}
        />

        {/* Border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.1)'
              : '0 0 0px rgba(251, 191, 36, 0)',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
