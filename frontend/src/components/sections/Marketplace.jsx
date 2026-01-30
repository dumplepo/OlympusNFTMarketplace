import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingCart, X } from 'lucide-react';
import NFTCard from '../NFTCard';
import NFTDetailModal from '../NFTDetailModal';

export default function Marketplace({
  nfts,
  favorites,
  onToggleFavorite,
  onBuy,
  onCancelSale,
  walletAddress,
  onButtonClick,
}) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('recent');

  // Filter and sort NFTs
  let filteredNFTs = nfts.filter((nft) => {
    const isListed = nft.isListed === true;
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = nft.price >= priceRange[0] && nft.price <= priceRange[1];
    return isListed && matchesSearch && matchesPrice;
  });

  if (sortBy === 'price-low') {
    filteredNFTs = [...filteredNFTs].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredNFTs = [...filteredNFTs].sort((a, b) => b.price - a.price);
  } else {
    filteredNFTs = [...filteredNFTs].sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0));
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl text-amber-400 mb-2">Sacred Marketplace</h1>
        <p className="text-gray-400">Discover legendary NFTs from across the divine realm</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 bg-slate-900/50 rounded-xl border border-amber-900/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
          <label className="block text-gray-400 mb-2 text-sm">
              Search Nfts...
            </label>
            {/* <Search className=" left-4 -top-2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter NFT name."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Price Range: {priceRange[0]} - {priceRange[1]} ETH
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])
                }
                className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseFloat(e.target.value) || 100])
                }
                className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
            >
              <option value="recent">Recently Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* NFT Grid */}

      {filteredNFTs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">The marketplace is currently empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft, index) => {
            // Case-insensitive check to see if YOU are the owner
            const isMine = nft.owner.toLowerCase() === walletAddress?.toLowerCase();

            return (
              <NFTCard
                key={nft.id}
                nft={nft}
                isFavorite={favorites.has(nft.id)}
                onToggleFavorite={() => onToggleFavorite(nft.id)}
                onCardClick={() => setSelectedNFT(nft)}
                index={index}
                actions={
                  isMine ? (
                    /* If it's mine: Show ONLY Cancel */
                    <button
                      onClick={() => onButtonClick(() => onCancelSale(nft.id))}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel Sale
                    </button>
                  ) : (
                    /* If it's someone else's: Show ONLY Buy */
                    <button
                      onClick={() => onButtonClick(() => onBuy(nft.id, nft.price))}
                      disabled={!walletAddress}
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                  )
                }
              />
            );
          })}
        </div>
      )}
      {/* NFT Detail Modal */}
      {selectedNFT && (
        <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </div>
  );
}
