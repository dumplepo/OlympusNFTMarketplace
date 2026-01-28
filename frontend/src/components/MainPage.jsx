import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

import StatusBar from './StatusBar';
import Toolbar from './Toolbar';
import MyNFTs from './sections/MyNFTs';
import Marketplace from './sections/Marketplace';
import Auctions from './sections/Auctions';
import MintNFT from './sections/MintNFT';
import Footer from './Footer';
import LightningEffect from './LightningEffect';

export default function MainPage({ walletAddress, onConnect, onDisconnect, isConnecting }) {
  const [activeSection, setActiveSection] = useState('marketplace');
  const [showLightning, setShowLightning] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const contentRef = useRef(null);

  const loadData = useCallback(async () => {
    if (!window.ethereum || !walletAddress) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const counter = await contract.tokenCounter();
      const items = [];
      const auctionItems = [];

      for (let i = 0; i < counter; i++) {
        const item = await contract.nftItems(i);
        if (item.isMinted) {
          const tokenURI = await contract.tokenURI(i);
          const gatewayURL = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
          const response = await fetch(gatewayURL);
          const metadata = await response.json();

          const nftObj = {
            id: i.toString(),
            tokenId: i.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
            price: parseFloat(formatEther(item.price)),
            owner: item.owner.toLowerCase(),
            isListed: item.isForSale,
            inAuction: item.isInAuction,
            category: metadata.attributes?.find(a => a.trait_type === "Category")?.value || "Artifacts",
          };

          items.push(nftObj);
          if (item.isInAuction) {
            auctionItems.push({
              id: `auction-${i}`,
              nft: nftObj,
              currentBid: parseFloat(formatEther(item.highestBid)),
              highestBidder: item.highestBidder,
              endTime: Number(item.auctionEndTime) * 1000,
              timeRemaining: (Number(item.auctionEndTime) * 1000) - Date.now(),
              bids: []
            });
          }
        }
      }
      setNfts(items);
      setAuctions(auctionItems);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [walletAddress]);

  useEffect(() => { loadData(); }, [loadData, walletAddress]);

  const handleButtonClick = (callback) => {
    setShowLightning(true);
    setTimeout(() => { if(callback) callback(); setShowLightning(false); }, 300);
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMintNFT = async (metadata, tokenURI) => {
    if (!window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Assuming your contract mintNFT takes (uri, price, royalty)
      const tx = await contract.mintNFT(tokenURI, 0, 10);
      await tx.wait();

      await loadData(); // Refresh the list
      setActiveSection('my-nfts'); // Go to collection
    } catch (err) {
      console.error("Minting process failed:", err);
      throw err;
    }
  };

  // Filter for 'My NFTs' section
  const myNFTs = nfts.filter(nft => nft.owner === walletAddress?.toLowerCase());
  const listedNFTs = nfts.filter(nft => nft.isListed);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-black/40" />
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
                >
                  <MyNFTs 
                    nfts={nfts.filter(nft => nft.owner === walletAddress?.toLowerCase())} 
                    favorites={favorites} 
                    // This is what was missing:
                    onSuccess={() => {
                      loadData(); // Refresh the blockchain data
                      setActiveSection('marketplace'); // Redirect to Marketplace
                    }}
                    onAuctionSuccess={() => {
                      loadData();
                      setActiveSection('auctions'); // Redirect to Auctions
                    }}
                    onTransferSuccess={() => {
                      loadData(); // Just refresh the list
                      alert("Sacred Transfer Complete!");
                    }}
                    onButtonClick={handleButtonClick}
                    onToggleFavorite={(id) => {
                      const newFavs = new Set(favorites);
                      if (newFavs.has(id)) newFavs.delete(id);
                      else newFavs.add(id);
                      setFavorites(newFavs);
                    }}
                  />
                </motion.div>
              )}

              {activeSection === 'marketplace' && (
                <motion.div key="marketplace" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Marketplace nfts={listedNFTs} favorites={favorites} walletAddress={walletAddress} onButtonClick={handleButtonClick} />
                </motion.div>
              )}

              {activeSection === 'mint' && (
                <motion.div key="mint" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <MintNFT onMint={handleMintNFT} onButtonClick={handleButtonClick} />
                </motion.div>
              )}
              
              {/* Add other sections as needed following this pattern */}
            </AnimatePresence>
          </div>
          <Footer nfts={nfts} auctions={auctions} />
        </div>

        <AnimatePresence>
          {scrollToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => handleButtonClick(scrollToTop)}
              className="fixed bottom-8 right-8 z-50 p-4 bg-amber-500 text-black rounded-full"
            >
              {/* <ChevronUp className="w-6 h-6" /> */}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}