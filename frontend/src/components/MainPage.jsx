import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef here
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Wallet, ChevronUp } from 'lucide-react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

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
  const [nfts, setNfts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [auctions, setAuctions] = useState(mockAuctions);
  const [favorites, setFavorites] = useState(new Set());
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const contentRef = useRef(null);

  // Load NFTs from the Smart Contract
  const loadNFTs = useCallback(async () => {
    if (!window.ethereum || !walletAddress) return;
    
    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const counter = await contract.tokenCounter();
      const items = [];

      for (let i = 0; i < counter; i++) {
        const item = await contract.nftItems(i);
        
        if (item.isMinted) {
          const tokenURI = await contract.tokenURI(i);
          const gatewayURL = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
          
          try {
            const response = await fetch(gatewayURL);
            const metadata = await response.json();

            items.push({
              id: i.toString(),
              tokenId: i.toString(),
              name: metadata.name,
              description: metadata.description,
              image: metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
              price: formatEther(item.price),
              owner: item.owner.toLowerCase(),
              creator: item.owner.toLowerCase(),
              category: metadata.attributes?.find(a => a.trait_type === "Category")?.value || "Artifacts",
              collection: metadata.attributes?.find(a => a.trait_type === "Collection")?.value || "Olympus",
              isListed: item.isForSale,
              mintedAt: Date.now(),
            });
          } catch (e) {
            console.error("Metadata fetch error for token", i, e);
          }
        }
      }
      setNfts(items);
    } catch (error) {
      console.error("Error loading divine artifacts:", error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs, walletAddress]);

  // Handle Scroll logic for the Back to Top button
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
      if(callback) callback();
      setShowLightning(false);
    }, 300);
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

      await loadNFTs(); // Refresh the list
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
                <motion.div key="my-nfts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <MyNFTs nfts={myNFTs} favorites={favorites} onButtonClick={handleButtonClick} />
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
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => handleButtonClick(scrollToTop)}
              className="fixed bottom-8 right-8 z-50 p-4 bg-amber-500 text-black rounded-full"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}