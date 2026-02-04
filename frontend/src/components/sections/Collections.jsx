import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, DollarSign, Send, Gavel, X, ShoppingCart, Info 
} from 'lucide-react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/contractConfig';
import NFTCard from '../NFTCard';
import NFTDetailModal from '../NFTDetailModal';

const categories = ['All', 'Gods', 'Titans', 'Heroes', 'Creatures', 'Artifacts'];

export default function Collections({
  nfts,
  favorites,
  onToggleFavorite,
  walletAddress,
  onButtonClick,
  onSuccess, // To refresh data after actions
}) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Action Modal State (for Sell/Auction/Transfer)
  const [actionNFT, setActionNFT] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [durationValue, setDurationValue] = useState('');

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActionInitiate = (nftId, action) => {
    setActionNFT({ id: nftId, action });
    setInputValue('');
    setDurationValue('');
  };

  const handleConfirmAction = async () => {
    if (!actionNFT || !window.ethereum) return;

    onButtonClick(async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        if (actionNFT.action === 'sell') {
            const tx = await contract.listNFTForSale(actionNFT.id, parseEther(inputValue));
            await tx.wait();
        } else if (actionNFT.action === 'auction') {
            const tx = await contract.startAuction(actionNFT.id, parseEther(inputValue), parseInt(durationValue));
            await tx.wait();
        } else if (actionNFT.action === 'transfer') {
            const tx = await contract.transferNFT(actionNFT.id, inputValue);
            await tx.wait();
        } else if (actionNFT.action === 'cancel') {
            const currentNft = nfts.find(n => n.id === actionNFT.id);
            const tx = currentNft.inAuction ? await contract.endAuction(actionNFT.id) : await contract.cancelSale(actionNFT.id);
            await tx.wait();
        } else if (actionNFT.action === 'buy') {
            const targetNft = nfts.find(n => n.id === actionNFT.id);
            const tx = await contract.buyNFT(actionNFT.id, { value: parseEther(targetNft.price.toString()) });
            await tx.wait();
        }

        setActionNFT(null);
        if (onSuccess) await onSuccess();
      } catch (err) {
        console.error("Action failed:", err);
        alert("The Gods rejected the transaction.");
      }
    });
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-amber-400 mb-2">Divine Archive</h1>
        <p className="text-gray-400">The complete history of artifacts summoned to Olympus</p>
      </motion.div>

      {/* Filters (Simplified) */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map((nft, index) => {
          const isMine = nft.owner.toLowerCase() === walletAddress?.toLowerCase();
          const isListed = nft.isListed;
          const inAuction = nft.inAuction;

          return (
            <NFTCard
              key={nft.id}
              nft={nft}
              isFavorite={favorites.has(nft.id)}
              onToggleFavorite={() => onToggleFavorite(nft.id)}
              onCardClick={() => setSelectedNFT(nft)}
              index={index}
              actions={
                <div className="flex flex-col gap-2">
                  {isMine ? (
                    /* 1. MY NFT */
                    isListed || inAuction ? (
                      /* 1.1 Listed mine: State + Cancel */
                      <>
                        <div className="py-1 px-2 bg-amber-900/40 border border-amber-500/50 rounded-md text-center">
                            <span className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                              {inAuction ? '⚔️ In Auction' : '💰 For Sale'}
                            </span>
                        </div>
                        <button onClick={() => handleActionInitiate(nft.id, 'cancel')} className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    ) : (
                      /* 1.2 Not listed mine: Sell, Auction, Transfer */
                      <>
                        <div className="flex gap-1">
                            <button onClick={() => handleActionInitiate(nft.id, 'sell')} className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white rounded-lg text-xs font-medium"><DollarSign className="w-4 h-4"/> Sell</button>
                            <button onClick={() => handleActionInitiate(nft.id, 'auction')} className="flex-1 flex items-center justify-center gap-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium"><Gavel className="w-4 h-4"/> Auction</button>
                        </div>
                        <button onClick={() => handleActionInitiate(nft.id, 'transfer')} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"><Send className="w-4 h-4"/> Transfer</button>
                      </>
                    )
                  ) : (
                    /* 2. OTHER USER'S NFT */
                    isListed ? (
                      /* 2.1 Listed for Sale: Buy */
                      <button onClick={() => handleActionInitiate(nft.id, 'buy')} className="flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-all">
                        <ShoppingCart className="w-4 h-4" /> Buy Now
                      </button>
                    ) : inAuction ? (
                      /* 2.2 Listed for Auction: State Only */
                      <div className="py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-center">
                         <span className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">⚔️ Active Auction</span>
                      </div>
                    ) : (
                      /* 2.3 Not listed: No Buttons */
                      <div className="py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-center">
                         <span className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">Not listed</span>
                      </div>
                    )
                  )}
                </div>
              }
            />
          );
        })}
      </div>

      {/* Action Modals (Integrated) */}
      <AnimatePresence>
        {actionNFT && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-amber-900/50 p-6 rounded-2xl max-w-sm w-full">
                    <h2 className="text-xl text-amber-400 mb-4 capitalize">{actionNFT.action} Artifact</h2>
                    
                    {['sell', 'auction'].includes(actionNFT.action) && (
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Starting/Fixed Price (ETH)</label>
                            <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-2 bg-black border border-amber-900/30 rounded text-white" placeholder="0.05" />
                        </div>
                    )}
                    {actionNFT.action === 'auction' && (
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Duration (Seconds)</label>
                            <input type="number" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} className="w-full p-2 bg-black border border-amber-900/30 rounded text-white" placeholder="3600" />
                        </div>
                    )}
                    {actionNFT.action === 'transfer' && (
                         <div className="mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Recipient Address</label>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full p-2 bg-black border border-amber-900/30 rounded text-white" placeholder="0x..." />
                        </div>
                    )}
                    {actionNFT.action === 'buy' && <p className="text-gray-400 mb-6 text-sm">Are you sure you want to purchase this artifact for the listed price?</p>}
                    {actionNFT.action === 'cancel' && <p className="text-gray-400 mb-6 text-sm">Removal will return the artifact to your private vaults.</p>}

                    <div className="flex gap-2">
                        <button onClick={() => setActionNFT(null)} className="flex-1 py-2 bg-slate-800 text-white rounded-lg">Cancel</button>
                        <button onClick={handleConfirmAction} className="flex-1 py-2 bg-amber-600 text-black font-bold rounded-lg">Confirm</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {selectedNFT && <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
    </div>
  );
}