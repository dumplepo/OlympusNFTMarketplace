import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Gavel, Trophy, X, AlertCircle } from 'lucide-react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/contractConfig';
import NFTDetailModal from '../NFTDetailModal';

export default function Auctions({ auctions, walletAddress, onButtonClick, onSuccess }) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [activeBidAuction, setActiveBidAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time timer update
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // AUTO-REFRESH LOGIC:
      // Check if any auction just crossed the finish line in the last second
      const hasJustFinished = auctions.some(auction => 
        auction.endTime <= now && auction.endTime > now - 1100
      );

      if (hasJustFinished && onSuccess) {
        console.log("Auction ended! Categorizing rewards...");
        onSuccess(); // This triggers loadData() in MainPage.jsx
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [auctions, onSuccess]);

  const activeAuctions = auctions.filter(auction => auction.endTime > currentTime);

    if (activeAuctions.length === 0) {
    return (
      <div className="text-center py-32 border-2 border-dashed border-amber-900/20 rounded-3xl">
        <AlertCircle className="w-12 h-12 text-amber-900/40 mx-auto mb-4" />
        <p className="text-gray-500 text-xl font-serif">No active auctions at this time.</p>
      </div>
    );
  }

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
        // REPLACEMENT FOR RELOAD:
        setActiveBidAuction(null); // Close modal
        setBidAmount('');          // Reset input

        if (onSuccess) await onSuccess(); // Trigger data refresh in parent
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
        if (onSuccess) await onSuccess();
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
    <div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-amber-400 mb-2">Divine Auctions</h1>
        <p className="text-gray-400">Bid on sacred artifacts in real-time auctions</p>
      </motion.div>

      {auctions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No active auctions</p>
          <p className="text-gray-500 mt-2">Check back later for new auctions</p>
        </div>
      ) : (
        <div className="space-y-6">
          {auctions.map((auction, index) => {
            const isEnded = auction.endTime <= currentTime;
            const isOwner = auction.nft.owner === walletAddress?.toLowerCase();
            const isHighestBidder = auction.highestBidder?.toLowerCase() === walletAddress?.toLowerCase();

            return (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-amber-900/30 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all duration-500"
              >
                <div className="grid md:grid-cols-[400px_1fr] gap-6 p-6">
                  {/* Left: NFT Image */}
                  <div
                    className="relative cursor-pointer rounded-xl overflow-hidden group"
                    onClick={() => setSelectedNFT(auction.nft)}
                  >
                    <img
                      src={auction.nft.image}
                      alt={auction.nft.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl text-amber-400 mb-1">{auction.nft.name}</h3>
                      <p className="text-sm text-gray-300">Token #{auction.nft.tokenId}</p>
                    </div>
                  </div>

                  {/* Right: Auction Details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      {/* Status */}
                      <div className="flex items-center gap-3 mb-6">
                        {isEnded ? (
                          <div className="px-4 py-2 rounded-full bg-red-900/30 border border-red-600/40 text-red-400 flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Auction Ended
                          </div>
                        ) : (
                          <div className="px-4 py-2 rounded-full bg-green-900/30 border border-green-600/40 text-green-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-pulse" />
                            Live Auction
                          </div>
                        )}
                        <div className="px-4 py-2 rounded-full bg-amber-900/20 border border-amber-600/40 text-amber-400">
                          {auction.nft.category}
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="mb-6 p-4 bg-slate-950/50 rounded-lg border border-amber-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Time Remaining</span>
                          <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-2xl text-amber-400">
                          {isEnded ? 'Ended' : formatTime(auction.endTime)}
                        </div>
                      </div>

                      {/* Current Bid */}
                      <div className="mb-6 p-6 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-lg border border-amber-600/40">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Current Bid</p>
                            <p className="text-4xl text-amber-400">{auction.currentBid} ETH</p>
                          </div>
                          <Gavel className="w-12 h-12 text-amber-400/30" />
                        </div>
                        {auction.highestBidder && (
                          <div className="pt-4 border-t border-amber-900/30">
                            <p className="text-sm text-gray-400 mb-1">Highest Bidder</p>
                            <p className="text-sm text-white">
                              {auction.highestBidder.slice(0, 10)}...{auction.highestBidder.slice(-8)}
                            </p>
                            {isHighestBidder && (
                              <p className="text-sm text-green-400 mt-2">You are the highest bidder!</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bid History */}
                      {/* {auction.bids.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-gray-400 mb-3">Recent Bids</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {auction.bids.slice().reverse().map((bid, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg text-sm">
                                <span className="text-gray-400">
                                  {bid.bidder.slice(0, 8)}...{bid.bidder.slice(-6)}
                                </span>
                                <span className="text-amber-400">{bid.amount} ETH</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}
                    </div>

                    {/* Bid Button */}
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

                    {isEnded && auction.highestBidder && (
                      <div className="p-4 bg-amber-900/20 border border-amber-600/40 rounded-lg">
                        <p className="text-center text-amber-400">
                          <Trophy className="w-5 h-5 inline mr-2" />
                          Winner: {auction.highestBidder.slice(0, 8)}...{auction.highestBidder.slice(-6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bid Modal */}
      {activeBidAuction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border-2 border-amber-900/40 max-w-md w-full"
          >
            <h3 className="text-2xl text-amber-400 mb-6">Place Your Bid</h3>

            <div className="mb-4 p-4 bg-slate-950/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Current Bid</p>
              <p className="text-2xl text-amber-400">
                {activeBidAuction.currentBid} ETH
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 mb-2">Your Bid (ETH)</label>
              <input
                type="number"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-amber-900/30 rounded-lg text-white focus:border-amber-600 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-2">Must be higher than the current bid</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveBidAuction(null);
                  setBidAmount('');
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBid}
                disabled={
                  !bidAmount ||
                  parseFloat(bidAmount) <= parseFloat(activeBidAuction.currentBid)
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 disabled:opacity-50"
              >
                Confirm Bid
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