import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Gavel, Trophy, X, AlertCircle } from 'lucide-react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/contractConfig';
import NFTDetailModal from '../NFTDetailModal';

export default function Auctions({ auctions, walletAddress, onButtonClick }) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [activeBidAuction, setActiveBidAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (endTime) => {
    const ms = endTime - currentTime;
    if (ms <= 0) return "Ended";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handlePlaceBid = async () => {
    if (!activeBidAuction || !bidAmount) return;

    onButtonClick(async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Extract tokenId from the unique ID "auction-0"
        const tokenId = activeBidAuction.nft.tokenId;
        
        const tx = await contract.placeBid(activeBidAuction.nft.tokenId, {
          value: parseEther(bidAmount)
        });
        
        await tx.wait();
        alert("Sacrifice accepted! You are the high bidder.");
        // setActiveBidAuction(null);
        // setBidAmount('');
        window.location.reload(); // Refresh data
      } catch (err) {
        console.error("Bid failed:", err);
        alert("The Gods rejected your bid. Ensure it is higher than the current one.");
      }
    });
  };

  const handleEndAuction = async (tokenId) => {
    onButtonClick(async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.endAuction(tokenId);
        await tx.wait();
        alert("The Auction has concluded. Artficat has been transferred.");
        window.location.reload();
      } catch (err) {
        console.error("End auction failed:", err);
        alert("Could not end auction yet.");
      }
    });
  };

  if (auctions.length === 0) {
    return (
      <div className="text-center py-32 border-2 border-dashed border-amber-900/20 rounded-3xl">
        <AlertCircle className="w-12 h-12 text-amber-900/40 mx-auto mb-4" />
        <p className="text-gray-500 text-xl font-serif">No active auctions at this time.</p>
      </div>
    );
  }


  return (
    <div className="pb-20">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
        <h1 className="text-4xl text-amber-400 font-serif mb-2">Divine Auctions</h1>
        <p className="text-gray-400 font-light tracking-wide">Sacrifice your ETH to claim legendary artifacts.</p>
      </motion.div>

      {auctions.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-amber-900/20 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-amber-900/40 mx-auto mb-4" />
          <p className="text-gray-500 text-xl font-serif">No active auctions at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {auctions.map((auction, index) => {
            const isEnded = auction.endTime <= currentTime;
            const isOwner = auction.nft.owner === walletAddress?.toLowerCase();
            const isHighestBidder = auction.highestBidder?.toLowerCase() === walletAddress?.toLowerCase();

            return (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/60 border border-amber-500/20 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              >
                {/* Visual Side */}
                <div className="w-full md:w-1/2 relative h-64 md:h-auto overflow-hidden group">
                  <img 
                    src={auction.nft.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={auction.nft.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <span className="text-xs text-amber-500/80 uppercase tracking-widest mb-1 block">{auction.nft.category}</span>
                    <h2 className="text-2xl text-white font-serif">{auction.nft.name}</h2>
                  </div>
                </div>

                {/* Info Side */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                       <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${isEnded ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                         <Clock className={`w-3.5 h-3.5 ${!isEnded && 'animate-pulse'}`} />
                         {isEnded ? 'CLOSED' : 'LIVE'}
                       </div>
                       <div className="text-amber-500 font-mono text-lg">{formatTime(auction.endTime)}</div>
                    </div>

                    <div className="bg-black/40 p-5 rounded-2xl mb-6 border border-amber-900/10">
                      <p className="text-gray-500 text-xs uppercase tracking-tighter mb-1">Current Highest Bid</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-amber-400 font-serif">{auction.currentBid}</span>
                        <span className="text-amber-600 text-sm">ETH</span>
                      </div>
                      {isHighestBidder && <p className="text-green-500 text-[10px] mt-2 font-bold tracking-widest">YOU ARE WINNING</p>}
                    </div>
                  </div>

                  {!isEnded ? (
                    !isOwner && (
                      <button
                        onClick={() => setActiveBidAuction(auction)}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <Gavel className="w-5 h-5" /> PLACE BID
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleEndAuction(auction.nft.tokenId)}
                      className="w-full py-4 bg-slate-800 text-amber-400 border border-amber-400/30 font-bold rounded-xl hover:bg-amber-400 hover:text-black transition-all"
                    >
                      <Trophy className="w-5 h-5 inline mr-2" /> 
                      {isOwner ? "SETTLE AUCTION" : "CLAIM ARTIFACT"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BID MODAL */}
      <AnimatePresence>
        {activeBidAuction && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-amber-500/30 p-10 rounded-[40px] max-w-sm w-full shadow-[0_0_60px_rgba(251,191,36,0.2)]"
            >
              <div className="text-center mb-8">
                <Gavel className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-3xl text-white font-serif mb-2">Place Bid</h3>
                <p className="text-gray-500 text-sm">Min Bid: {activeBidAuction.currentBid} ETH</p>
              </div>

              <input
                type="number"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-6 py-5 bg-black border border-amber-900/30 rounded-2xl text-white text-center text-2xl focus:border-amber-500 outline-none mb-8"
                placeholder="0.00"
              />

              <div className="flex gap-4">
                <button onClick={() => setActiveBidAuction(null)} className="flex-1 py-4 text-gray-400 font-bold">CANCEL</button>
                <button onClick={handlePlaceBid} className="flex-1 py-4 bg-amber-500 text-black font-bold rounded-2xl">CONFIRM</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedNFT && <NFTDetailModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
    </div>
  );
}