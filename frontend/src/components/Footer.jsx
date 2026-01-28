import { motion } from 'motion/react';
import { TrendingUp, Clock, Gavel } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function Footer({ nfts, auctions }) {
  const [chartData, setChartData] = useState([]);

  // Generate mock chart data for average NFT value
  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = Date.now();
      for (let i = 10; i >= 0; i--) {
        const time = new Date(now - i * 60000); // Last 10 minutes
        const avgPrice = nfts.length > 0
          ? nfts.reduce((sum, nft) => sum + nft.price, 0) / nfts.length
          : 0;
        const variance = (Math.random() - 0.5) * 2;
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.max(0, avgPrice + variance),
        });
      }
      return data;
    };

    setChartData(generateData());

    // Update every minute
    const interval = setInterval(() => {
      setChartData(generateData());
    }, 60000);

    return () => clearInterval(interval);
  }, [nfts]);

  // Get featured NFTs
  const recentNFT = [...nfts].sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0))[0];
  const highestPricedNFT = [...nfts].sort((a, b) => b.price - a.price)[0];
  const auctionNFT = auctions[0]?.nft;

  const SmallNFTCard = ({ nft, icon: Icon, label }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex-shrink-0 w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-amber-900/30 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-amber-600/90 backdrop-blur-sm text-xs text-black flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {label}
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm text-amber-400 truncate mb-1">{nft.name}</h4>
        <p className="text-xs text-gray-400 mb-2">Token #{nft.tokenId}</p>
        {nft.price > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Price</span>
            <span className="text-sm text-amber-400">{nft.price} ETH</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <footer className="relative mt-16 pt-12 pb-8 border-t border-amber-900/30 bg-gradient-to-b from-transparent to-black/50">
      {/* Scrolling NFT Sections */}
      <div className="mb-12">
        <h3 className="text-2xl text-amber-400 mb-6 px-6">Featured NFTs</h3>
        
        <div className="relative overflow-hidden">
          <div className="flex gap-4 px-6 overflow-x-auto scrollbar-hide pb-4">
            {recentNFT && <SmallNFTCard nft={recentNFT} icon={Clock} label="Recently Minted" />}
            {highestPricedNFT && <SmallNFTCard nft={highestPricedNFT} icon={TrendingUp} label="Highest Priced" />}
            {auctionNFT && <SmallNFTCard nft={auctionNFT} icon={Gavel} label="In Auction" />}
            
            {/* Duplicate cards for scrolling effect */}
            {recentNFT && <SmallNFTCard nft={recentNFT} icon={Clock} label="Recently Minted" />}
            {highestPricedNFT && <SmallNFTCard nft={highestPricedNFT} icon={TrendingUp} label="Highest Priced" />}
          </div>

          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Average NFT Value Graph */}
      <div className="px-6 mb-12">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-amber-900/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-amber-400 mb-1">Average NFT Value</h3>
              <p className="text-sm text-gray-400">Updated every minute</p>
            </div>
            <div className="text-right">
              <p className="text-3xl text-amber-400">
                {(nfts.reduce((sum, nft) => sum + nft.price, 0) / nfts.length || 0).toFixed(2)} ETH
              </p>
              <p className="text-xs text-gray-400">Current Average</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  color: '#fbbf24',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#fbbf24', r: 4 }}
                activeDot={{ r: 6, fill: '#fbbf24' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <p className="text-amber-400">Olympus NFT Marketplace</p>
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>
        <p className="text-gray-500 text-sm mb-2">
          A sacred marketplace where gods and mortals trade divine artifacts
        </p>
        <p className="text-gray-600 text-xs">
          © 2026 Olympus NFT. Built for Web3 integration.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
}
