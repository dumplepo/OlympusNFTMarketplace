import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';
import './styles/globals.css';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleEnterMarketplace = () => {
    setCurrentView('main');
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    // Mock wallet connection
    setTimeout(() => {
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      setIsConnecting(false);
    }, 1500);
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
