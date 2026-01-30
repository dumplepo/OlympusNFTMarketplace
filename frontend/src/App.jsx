import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserProvider } from 'ethers';
import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';
import './styles/globals.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
    } else {
    setWalletAddress(null);
    setCurrentView('landing');
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
        }
      } catch (error) {
        console.error("Failed to check connection", error);
      }
    }
  }, []);

  useEffect(() => {
    const checkInitialConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if MetaMask is already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            handleAccountsChanged(accounts);
          }
        } catch (err) {
          console.error("Error checking initial connection:", err);
        }
      }
    };

    checkInitialConnection();
    
    // Listen for account changes while the app is open
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, [handleAccountsChanged]); 

  const handleEnterMarketplace = () => {
    setCurrentView('main');
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to interact with Olympus NFT Marketplace!');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Wallet connection denied or failed", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setCurrentView('landing');
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            <LandingPage onEnter={handleEnterMarketplace} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <MainPage
              walletAddress={walletAddress}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              isConnecting={isConnecting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}