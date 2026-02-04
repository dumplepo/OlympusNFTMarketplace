import { motion } from 'motion/react';
import { Package, Store, Layers, Gavel, Sparkles } from 'lucide-react';

const sections = [
  { id: 'my-nfts', label: 'My NFTs', icon: Package, requiresWallet: true },
  { id: 'marketplace', label: 'Marketplace', icon: Store, requiresWallet: false },
  { id: 'collections', label: 'Collections', icon: Layers, requiresWallet: false },
  { id: 'auctions', label: 'Auctions', icon: Gavel, requiresWallet: false },
  { id: 'mint', label: 'Mint NFT', icon: Sparkles, requiresWallet: true },
];

export default function Toolbar({
  activeSection,
  onSectionChange,
  walletConnected,
}) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sticky top-[76px] z-30 bg-slate-900/80 backdrop-blur-md border-b border-amber-900/20"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isDisabled = section.requiresWallet && !walletConnected;

            return (
              <button
                key={section.id}
                onClick={() => !isDisabled && onSectionChange(section.id)}
                disabled={isDisabled}
                className={`relative px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                    : isDisabled
                    ? 'bg-slate-800/30 text-gray-600 cursor-not-allowed'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 hover:text-amber-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {section.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg border-2 border-amber-400"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
