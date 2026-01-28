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
        <h1 className="text-4xl text-amber-400 mb-2">Divine Collections</h1>
        <p className="text-gray-400">Explore all NFTs ever minted in the realm of Olympus</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        {/* Category Filter */}
        <div className="mb-4 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NFTs by name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No NFTs found</p>
          <p className="text-gray-500 mt-2">Try a different category or search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredNFTs.slice(0, 4).map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                isFavorite={favorites.has(nft.id)}
                onToggleFavorite={() => onToggleFavorite(nft.id)}
                onCardClick={() => setSelectedNFT(nft)}
                index={index}
                actions={
                  nft.owner === walletAddress ? (
                    <button
                      onClick={() => setActionNFT({ id: nft.id, action: 'sell' })}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Sell
                    </button>
                  ) : nft.isListed ? (
                    <button
                      onClick={() => onButtonClick(() => {})}
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy on Marketplace
                    </button>
                  ) : (
                    <button
                      onClick={() => setActionNFT({ id: nft.id, action: 'request' })}
                      disabled={!walletAddress}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Purchase Request
                    </button>
                  )
                }
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.slice(4).map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                isFavorite={favorites.has(nft.id)}
                onToggleFavorite={() => onToggleFavorite(nft.id)}
                onCardClick={() => setSelectedNFT(nft)}
                index={index + 4}
                actions={
                  nft.owner === walletAddress ? (
                    <button
                      onClick={() => setActionNFT({ id: nft.id, action: 'sell' })}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Sell
                    </button>
                  ) : nft.isListed ? (
                    <button
                      onClick={() => onButtonClick(() => {})}
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy on Marketplace
                    </button>
                  ) : (
                    <button
                      onClick={() => setActionNFT({ id: nft.id, action: 'request' })}
                      disabled={!walletAddress}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Purchase Request
                    </button>
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Action Modal */}
      {actionNFT && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border-2 border-amber-900/40 max-w-md w-full"
          >
            <h3 className="text-2xl text-amber-400 mb-6">
              {actionNFT.action === 'sell' ? 'List for Sale' : 'Purchase Request'}
            </h3>

            <div className="mb-6">
              <label className="block text-gray-400 mb-2">
                {actionNFT.action === 'sell' ? 'Sale Price (ETH)' : 'Offer Price (ETH)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                placeholder="0.00"
              />
              {actionNFT.action === 'request' && (
                <p className="text-sm text-gray-500 mt-2">
                  Your offer will be sent to the NFT owner for approval
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActionNFT(null);
                  setPriceInput('');
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={!priceInput}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
    </div>
  );
}
