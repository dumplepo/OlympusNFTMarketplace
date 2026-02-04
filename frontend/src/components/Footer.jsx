import { motion } from 'motion/react';
import { TrendingUp, Clock, Gavel } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function Footer({ nfts, auctions }) {
  const [chartData, setChartData] = useState([]);

  // Generate mock chart data for average NFT value
  useEffect(() => {
    // Generate mock data for the subtle trend graph
    const generateData = () => {
      const data = [];
      const avgPrice = nfts.length > 0 ? nfts.reduce((sum, n) => sum + parseFloat(n.price), 0) / nfts.length : 0.5;
      for (let i = 12; i >= 0; i--) {
        data.push({ time: i, value: avgPrice + (Math.random() - 0.5) * 0.05 });
      }
      return data;
    };
    setChartData(generateData());
  }, [nfts]);

  // Get featured NFTs
  const recentNFT = [...nfts].sort((a, b) => b.tokenId - a.tokenId)[0];
  const highestPricedNFT = [...nfts].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))[0];
  const recentAuctionNFT = [...auctions].sort((a, b) => (b.startTime || 0) - (a.startTime || 0))[0]?.nft;

  const FeatureCard = ({ nft, icon: Icon, label, colorClass }) => {

    const cardStyle = {
      width: '180px',
      height: `${180 * 1.618}px` 
    };

    if (!nft) return (
      <div className="flex-1 aspect-[1/1.618] bg-slate-900/10 border border-dashed border-amber-900/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <Icon className="w-8 h-8 text-slate-800 mb-2" />
        <span className="text-[10px] uppercase tracking-widest text-slate-600">Awaiting {label}</span>
      </div>
    );

    return (
      <motion.div
        whileHover={{ y: -5 }}
        style={cardStyle}
        className="bg-gradient-to-b from-slate-900 to-black rounded-xl border border-amber-900/20 overflow-hidden shadow-xl relative group"
      >
        {/* Image Section: 61.8% */}
        <div style={{ height: '61.8%' }} className="w-full overflow-hidden relative">
          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 border border-amber-500/10">
            <Icon className={`w-3 h-3 ${colorClass}`} />
          </div>
        </div>

        {/* Info Section: 38.2% */}
        <div style={{ height: '38.2%' }} className="p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-amber-400 text-[9px] tracking-widest uppercase truncate font-bold">{nft.name}</h4>
            <p className="text-[7px] text-gray-500 uppercase">{label}</p>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[8px] font-mono text-gray-700">#{nft.tokenId}</span>
            <span className="text-xs text-amber-200 font-light">{nft.price} <span className="text-[8px] opacity-40">ETH</span></span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <footer className="relative mt-16 pt-12 pb-8 border-t border-amber-900/30 bg-gradient-to-b from-transparent to-black/50">

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
