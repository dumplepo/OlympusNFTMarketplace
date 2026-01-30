import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, DollarSign, MessageSquare, ShoppingCart } from 'lucide-react';
import NFTCard from '../NFTCard';
import NFTDetailModal from '../NFTDetailModal';

const categories = ['All', 'Gods', 'Titans', 'Heroes', 'Creatures', 'Artifacts'];

export default function Collections({
  nfts,
  favorites,
  onToggleFavorite,
  onListForSale,
  onPurchaseRequest,
  walletAddress,
  onButtonClick,
}) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [actionNFT, setActionNFT] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  // Filter NFTs
  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfirmAction = () => {
    if (!actionNFT || !priceInput) return;

    onButtonClick(() => {
      if (actionNFT.action === 'sell') {
        onListForSale(actionNFT.id, parseFloat(priceInput));
      } else if (actionNFT.action === 'request') {
        onPurchaseRequest(actionNFT.id, parseFloat(priceInput));
      }
      setActionNFT(null);
      setPriceInput('');
    });
  };


  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-amber-400 mb-2">Divine Archive</h1>
        <p className="text-gray-400">The complete history of artifacts summoned to Olympus</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-900/50 border-amber-900/30 text-gray-400 hover:border-amber-600/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search the archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-amber-900/30 rounded-xl text-white focus:border-amber-600 focus:outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
          <p className="text-gray-500 text-xl">No artifacts found matching your quest.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredNFTs.map((nft, index) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              isFavorite={favorites.has(nft.id)}
              onToggleFavorite={() => onToggleFavorite(nft.id)}
              onCardClick={() => setSelectedNFT(nft)}
              index={index}
              actions={
                nft.owner === walletAddress?.toLowerCase() ? (
                  <button
                    onClick={() => setActionNFT({ id: nft.id, action: 'sell' })}
                    className="w-full py-2 bg-green-600/20 hover:bg-green-600 border border-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Manage Listing
                  </button>
                ) : nft.isListed ? (
                  <button
                    className="w-full py-2 bg-amber-600 text-black font-bold rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Listed in Market
                  </button>
                ) : (
                  <button
                    onClick={() => setActionNFT({ id: nft.id, action: 'request' })}
                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inquiry
                  </button>
                )
              }
            />
          ))}
        </div>
      )}

      {/* Reuse your existing Modals here */}
      {selectedNFT && <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
    </div>
  );}
