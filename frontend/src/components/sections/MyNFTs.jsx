import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Send, Gavel, X } from 'lucide-react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/contractConfig';
import NFTCard from '../NFTCard';
import NFTDetailModal from '../NFTDetailModal';

export default function MyNFTs({
  nfts,
  favorites,
  onToggleFavorite,
  onSuccess,         // Redirect to Marketplace
  onAuctionSuccess,  // Redirect to Auctions
  onTransferSuccess, // Refresh list
  onButtonClick,     // Lightning effect wrapper
}) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [actionNFT, setActionNFT] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [durationValue, setDurationValue] = useState('');

  const handleAction = (nftId, action) => {
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
          if (!inputValue) return alert("Please enter a price");
          const tx = await contract.listNFTForSale(actionNFT.id, parseEther(inputValue));
          await tx.wait();
          // Add a check like this:
          if (typeof onSuccess === 'function') {
            onSuccess();
          } else {
            console.warn("onSuccess prop not provided to MyNFTs");
          }
        }
        else if (actionNFT.action === 'transfer') {
          if (!inputValue) return alert("Please enter recipient address");
          const tx = await contract.transferNFT(actionNFT.id, inputValue);
          await tx.wait();
          onTransferSuccess();
        } 
        else if (actionNFT.action === 'auction') {
          if (!inputValue || !durationValue) return alert("Please enter price and duration");
          const tx = await contract.startAuction(actionNFT.id, parseEther(inputValue), parseInt(durationValue));
          await tx.wait(); // Wait for blockchain confirmation
          
          // This must be called to refresh the data and switch tabs
          onAuctionSuccess(); 
        }
        setActionNFT(null);
      } catch (err) {
        console.error("The Gods rejected the transaction:", err);
        alert("Transaction failed.");
      }
    });
  };

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl text-amber-400 mb-8"
      >
        My NFT Collection
      </motion.h1>

      {nfts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">You don't own any NFTs yet</p>
          <p className="text-gray-500 mt-2">Start collecting or mint your own!</p>
        </div>
      ) : (
        <>
          {/* Two rows of NFTs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {nfts.map((nft, index) => {
              // Check if the NFT has an active status
              const isActive = nft.isListed || nft.inAuction;

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
                      {isActive ? (
                        <div className="w-full py-2 bg-amber-900/20 border border-amber-500/30 rounded-lg text-center">
                          <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
                            {nft.inAuction ? '⚔️ In Auction' : '💰 Listed for Sale'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(nft.id, 'sell')} className="flex-1 px-2 py-2 bg-green-600/20 hover:bg-green-600 border border-green-600/50 text-white rounded-lg transition-all text-xs font-bold">
                            SELL
                          </button>
                          <button onClick={() => handleAction(nft.id, 'auction')} className="flex-1 px-2 py-2 bg-purple-600/20 hover:bg-purple-600 border border-purple-600/50 text-white rounded-lg transition-all text-xs font-bold">
                            AUCTION
                          </button>
                        </div>
                      )}
                      
                      {/* Transfer remains available unless in auction */}
                    {!nft.inAuction && (
                      <button 
                        onClick={() => handleAction(nft.id, 'transfer')} 
                        disabled={nft.inAuction}
                        className={`w-full py-2 ${nft.inAuction ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600/20 hover:bg-blue-600 border border-blue-600/50 text-white'} rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1`}
                      >
                        <Send className="w-3 h-3" /> TRANSFER
                      </button>
                    )}
                  </div>
                }
              />
            );
          })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.slice(4).map((nft, index) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                isFavorite={favorites.has(nft.id)}
                onToggleFavorite={() => onToggleFavorite(nft.id)}
                onCardClick={() => setSelectedNFT(nft)}
                index={index + 4}
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(nft.id, 'sell')}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      Sell
                    </button>
                    <button
                      onClick={() => handleAction(nft.id, 'transfer')}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Transfer
                    </button>
                    <button
                      onClick={() => handleAction(nft.id, 'auction')}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      <Gavel className="w-4 h-4" />
                      Auction
                    </button>
                  </div>
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
              {actionNFT.action === 'sell' && 'List for Sale'}
              {actionNFT.action === 'transfer' && 'Transfer NFT'}
              {actionNFT.action === 'auction' && 'Create Auction'}
            </h3>

            {actionNFT.action === 'sell' && (
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Price (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            )}

            {actionNFT.action === 'transfer' && (
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                  placeholder="0x..."
                />
              </div>
            )}

            {actionNFT.action === 'auction' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Starting Price (ETH)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Duration (seconds)</label>
                  <input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                    placeholder="3600"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setActionNFT(null)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </div>
  );
}
