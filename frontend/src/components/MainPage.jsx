import Collections from './sections/Collections'; 
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

import StatusBar from './StatusBar';
import Toolbar from './Toolbar';
import MyNFTs from './sections/MyNFTs';
import Marketplace from './sections/Marketplace';
import Auctions from './sections/Auctions';
import MintNFT from './sections/MintNFT';
import Footer from './Footer';
import LightningEffect from './LightningEffect';

const fetchMetadata = async (url) => {
  try {
    const response = await fetch(url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
    return await response.json();
  } catch (err) {
    return { name: "Unknown Artifact", image: "", attributes: [] };
  }
};

export default function MainPage({ walletAddress, onConnect, onDisconnect, isConnecting }) {
  const [activeSection, setActiveSection] = useState('marketplace');
  const [showLightning, setShowLightning] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const contentRef = useRef(null);

  const loadData = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const counter = await contract.tokenCounter();

      const tempNfts = [];
      const tempAuctions = [];

      for (let i = 0; i < Number(counter); i++) {
        const item = await contract.nftItems(i);
        const exists = item.owner && item.owner !== '0x' + '0'.repeat(40);
        
        if (exists) {
          const tokenUri = await contract.tokenURI(i);
          const metadata = await fetchMetadata(tokenUri);

          const currentTime = Date.now();
          const auctionEndTime = Number(item.auctionEndTime) * 1000;
          const isExpired = item.isInAuction && currentTime > (Number(item.auctionEndTime) * 1000);
  
          const nftObj = {
            id: i,
            tokenId: i,
            name: metadata.name,
            image: metadata.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') || '',
            // VIRTUAL OWNER: If expired, the winner "owns" it in the UI
            owner: isExpired ? item.highestBidder.toLowerCase() : item.owner.toLowerCase(),
            originalOwner: item.owner.toLowerCase(),
            creator: item.creator.toLowerCase(),
            price: formatEther(item.price),
            isListed: item.isForSale,
            inAuction: item.isInAuction,
            isExpiredAuction: isExpired, // New flag for the UI
            highestBidder: item.highestBidder.toLowerCase(),
            category: metadata.attributes?.[0]?.value || "Artifact"
          };

          tempNfts.push(nftObj);

          // This checks if the blockchain says the NFT is in an auction
          if (item.isInAuction && !isExpired) {
            tempAuctions.push({
              id: `auction-${i}`,
              nft: nftObj,
              currentBid: formatEther(item.highestBid),
              highestBidder: item.highestBidder,
              endTime: auctionEndTime,
            });
          }
        }
      }

      setNfts(tempNfts);
      setAuctions(tempAuctions); // This populates the Auction Section
    } catch (error) {
      console.error("The Gods failed to deliver data:", error);
      alert("Connection to the Divine Network lost. Please check your RPC/MetaMask.");
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

  const handleMint = async (metadata, tokenURI) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 1. Execute the mint transaction (price 0, royalty 10% example)
      const tx = await contract.mintNFT(tokenURI, 0.0, 10);
      const receipt = await tx.wait();

      // 2. Extract Token ID from the NFTMinted event logs
      const event = receipt.logs
        .map((log) => {
          try { return contract.interface.parseLog(log); } 
          catch (e) { return null; }
        })
        .find((log) => log && log.name === 'NFTMinted');

      if (event) {
        const tokenId = event.args.tokenId.toString();
        
        // 3. Request MetaMask to track the new NFT
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC721',
              options: {
                address: CONTRACT_ADDRESS,
                tokenId: tokenId,
              },
            },
          });
        } catch (watchError) {
          console.warn("MetaMask did not add the asset automatically:", watchError);
          // Fallback: Notify user to add it manually
          alert(`Artifact Minted! If it doesn't appear, manually import ID: ${tokenId} in MetaMask.`);
        }
      }

      // Refresh UI
      await loadData();
    } catch (error) {
      console.error("The forge failed at the altar:", error);
      throw error; // Rethrow so MintNFT.jsx can handle the state
    }
  };
  // Filter for 'My NFTs' section
  const myNFTs = nfts.filter(nft => nft.owner === walletAddress?.toLowerCase());
  const listedNFTs = nfts.filter(nft => nft.isListed);

  const handleBuy = async (id, price) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.buyNFT(id, { value: parseEther(price) });
      await tx.wait();
      loadData(); // This refreshes the state, moving the NFT to "My NFTs"
    } catch (err) {
      console.error("Purchase rejected:", err);
    }
  };

  const handleCancelSale = async (id) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.cancelSale(id);
      await tx.wait();
      loadData(); // This refreshes the state, "removing" it from Marketplace
    } catch (err) {
      console.error("Cancel rejected:", err);
    }
  };



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
                  <Marketplace 
                    nfts={listedNFTs} 
                    favorites={favorites} 
                    walletAddress={walletAddress} 
                    onButtonClick={handleButtonClick}
                    // Pass these missing functions:
                    onBuy={handleBuy}
                    onCancelSale={handleCancelSale}
                    onToggleFavorite={(id) => {
                      const newFavs = new Set(favorites);
                      if (newFavs.has(id)) newFavs.delete(id);
                      else newFavs.add(id);
                      setFavorites(newFavs);
                    }}
                  />
                </motion.div>
              )}

              {activeSection === 'mint' && (
                <motion.div key="mint" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <MintNFT onMint={handleMint} onButtonClick={handleButtonClick} />
                </motion.div>
              )}

              {activeSection === 'auctions' && (
                <Auctions 
                  auctions={auctions} // Check that this variable is the one we set in loadData
                  walletAddress={walletAddress} 
                  onButtonClick={handleButtonClick} 
                  onSuccess={loadData}
                />
              )}
              
              {activeSection === 'collections' && (
                <Collections
                  nfts={nfts} // Changed 'allNFTs' to 'nfts' to match your state variable
                  walletAddress={walletAddress}
                  favorites={favorites}
                  onToggleFavorite={(id) => {
                    const newFavs = new Set(favorites);
                    if (newFavs.has(id)) newFavs.delete(id);
                    else newFavs.add(id);
                    setFavorites(newFavs);
                  }}
                  onButtonClick={handleButtonClick}
                  // These can be empty functions if not implemented yet
                  onListForSale={() => alert("Coming soon to archives!")}
                  onPurchaseRequest={() => alert("Inquiry sent to the Gods!")}
                />
              )}
              
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