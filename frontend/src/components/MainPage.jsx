import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Wallet, ChevronUp } from 'lucide-react';
import StatusBar from './StatusBar';
import Toolbar from './Toolbar';
import MyNFTs from './sections/MyNFTs';
import Marketplace from './sections/Marketplace';
import Collections from './sections/Collections';
import Auctions from './sections/Auctions';
import MintNFT from './sections/MintNFT';
import Footer from './Footer';
import LightningEffect from './LightningEffect';
import { mockNFTs, mockAuctions } from '../data/mockData';

export default function MainPage({ walletAddress, onConnect, onDisconnect, isConnecting }) {
  const [activeSection, setActiveSection] = useState('marketplace');
  const [showLightning, setShowLightning] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [nfts, setNfts] = useState(mockNFTs);
  const [auctions, setAuctions] = useState(mockAuctions);
  const [favorites, setFavorites] = useState(new Set());
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const contentRef = useRef(null);

  // Update auctions countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prevAuctions =>
        prevAuctions
          .map(auction => {
            const remaining = Math.max(0, auction.endTime - Date.now());
            return { ...auction, timeRemaining: remaining };
          })
          .filter(auction => auction.timeRemaining > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrolled = contentRef.current.scrollTop;
        setShowBackToTop(scrolled > 1000);
      }
    };

    const container = contentRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleButtonClick = (callback) => {
    setShowLightning(true);
    setTimeout(() => {
      callback();
      setShowLightning(false);
    }, 300);
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (nftId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(nftId)) {
        newFavorites.delete(nftId);
      } else {
        newFavorites.add(nftId);
      }
      return newFavorites;
    });
  };

  const handleListForSale = (nftId, price) => {
    setNfts(prev =>
      prev.map(nft =>
        nft.id === nftId ? { ...nft, price, isListed: true } : nft
      )
    );
  };

  const handleCancelSale = (nftId) => {
    setNfts(prev =>
      prev.map(nft =>
        nft.id === nftId ? { ...nft, isListed: false } : nft
      )
    );
  };

  const handleBuyNFT = (nftId) => {
    if (!walletAddress) return;
    setNfts(prev =>
      prev.map(nft =>
        nft.id === nftId
          ? { ...nft, owner: walletAddress, isListed: false }
          : nft
      )
    );
  };

  const handleTransferNFT = (nftId, recipientAddress) => {
    setNfts(prev =>
      prev.map(nft =>
        nft.id === nftId
          ? { ...nft, owner: recipientAddress, isListed: false }
          : nft
      )
    );
  };

  const handleCreateAuction = (nftId, startingPrice, duration) => {
    const nft = nfts.find(n => n.id === nftId);
    if (!nft) return;

    const newAuction = {
      id: `auction-${Date.now()}`,
      nft,
      startingPrice,
      currentBid: startingPrice,
      highestBidder: null,
      endTime: Date.now() + duration * 1000,
      timeRemaining: duration * 1000,
      bids: [],
    };

    setAuctions(prev => [...prev, newAuction]);
    setNfts(prev =>
      prev.map(n =>
        n.id === nftId ? { ...n, isListed: false, inAuction: true } : n
      )
    );
  };

  const handlePlaceBid = (auctionId, bidAmount) => {
    if (!walletAddress) return;
    setAuctions(prev =>
      prev.map(auction =>
        auction.id === auctionId
          ? {
              ...auction,
              currentBid: bidAmount,
              highestBidder: walletAddress,
              bids: [
                ...auction.bids,
                { bidder: walletAddress, amount: bidAmount, timestamp: Date.now() },
              ],
            }
          : auction
      )
    );
  };

  const handleMintNFT = (nft) => {
    if (!walletAddress) return;
    const newNFT = {
      ...nft,
      id: `nft-${Date.now()}`,
      tokenId: nfts.length + 1,
      owner: walletAddress,
      creator: walletAddress,
      price: 0,
      isListed: false,
    };
    setNfts(prev => [...prev, newNFT]);
    setActiveSection('my-nfts');
  };

  const handlePurchaseRequest = (nftId, offeredPrice) => {
    if (!walletAddress) return;
    const request = {
      id: `request-${Date.now()}`,
      nftId,
      requester: walletAddress,
      offeredPrice,
      timestamp: Date.now(),
      status: 'pending',
    };
    setPurchaseRequests(prev => [...prev, request]);
  };

  const myNFTs = nfts.filter(nft => nft.owner === walletAddress);
  const listedNFTs = nfts.filter(nft => nft.isListed);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-blue-900/10" />
      </div>

      <LightningEffect show={showLightning} />

      <div className="relative z-10">
        <StatusBar
          walletAddress={walletAddress}
          onConnect={() => handleButtonClick(onConnect)}
          onDisconnect={() => handleButtonClick(onDisconnect)}
          isConnecting={isConnecting}
        />

        <Toolbar
          activeSection={activeSection}
          onSectionChange={(section) => handleButtonClick(() => setActiveSection(section))}
          walletConnected={!!walletAddress}
        />

        <div
          ref={contentRef}
          className="relative min-h-[calc(100vh-180px)] max-h-[calc(100vh-180px)] overflow-y-auto scroll-smooth"
        >
          <div className="container mx-auto px-6 py-12">
            <AnimatePresence mode="wait">
              {activeSection === 'my-nfts' && (
                <motion.div
                  key="my-nfts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <MyNFTs
                    nfts={myNFTs}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onListForSale={handleListForSale}
                    onTransfer={handleTransferNFT}
                    onCreateAuction={handleCreateAuction}
                    onButtonClick={handleButtonClick}
                  />
                </motion.div>
              )}

              {activeSection === 'marketplace' && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Marketplace
                    nfts={listedNFTs}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onBuy={handleBuyNFT}
                    onCancelSale={handleCancelSale}
                    walletAddress={walletAddress}
                    onButtonClick={handleButtonClick}
                  />
                </motion.div>
              )}

              {activeSection === 'collections' && (
                <motion.div
                  key="collections"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Collections
                    nfts={nfts}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onListForSale={handleListForSale}
                    onPurchaseRequest={handlePurchaseRequest}
                    walletAddress={walletAddress}
                    onButtonClick={handleButtonClick}
                  />
                </motion.div>
              )}

              {activeSection === 'auctions' && (
                <motion.div
                  key="auctions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Auctions
                    auctions={auctions}
                    walletAddress={walletAddress}
                    onPlaceBid={handlePlaceBid}
                    onButtonClick={handleButtonClick}
                  />
                </motion.div>
              )}

              {activeSection === 'mint' && (
                <motion.div
                  key="mint"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <MintNFT
                    onMint={handleMintNFT}
                    onButtonClick={handleButtonClick}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Footer nfts={nfts} auctions={auctions} />
        </div>

        {/* Back to Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => handleButtonClick(scrollToTop)}
              className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] transition-all duration-300 hover:scale-110"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
