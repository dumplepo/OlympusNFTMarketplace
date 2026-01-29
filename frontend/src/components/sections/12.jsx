// ... (keep imports)

export default function MyNFTs({
  nfts,
  favorites,
  onToggleFavorite,
  onSuccess,         
  onAuctionSuccess,  
  onTransferSuccess, 
  onButtonClick,     
}) {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [actionNFT, setActionNFT] = useState(null);

  // ... (keep state and handleAction functions)

  return (
    <div>
      <h1 className="text-4xl text-amber-400 mb-8 font-serif">My NFT Collection</h1>

      {nfts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Your vault is empty.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map((nft, index) => {
            // Check if the NFT has an active status
            const isActive = nft.isListed || nft.inAuction;

            return (
              <NFTCard
                key={nft.id}
                nft={nft}
                isFavorite={favorites.has(nft.id)}
                onToggleFavorite={() => onToggleFavorite(nft.id)}
                onCardClick={() => setSelectedNFT(nft)}
                index={index}
                actions={
                  <div className="flex flex-col gap-2">
                    {isActive ? (
                      <div className="w-full py-2 bg-amber-900/20 border border-amber-500/30 rounded-lg text-center">
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
                          {nft.inAuction ? '⚔️ In Auction' : '💰 Listed for Sale'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(nft.id, 'sell')} className="flex-1 px-2 py-2 bg-green-600/20 hover:bg-green-600 border border-green-600/50 text-white rounded-lg transition-all text-xs font-bold">
                          SELL
                        </button>
                        <button onClick={() => handleAction(nft.id, 'auction')} className="flex-1 px-2 py-2 bg-purple-600/20 hover:bg-purple-600 border border-purple-600/50 text-white rounded-lg transition-all text-xs font-bold">
                          AUCTION
                        </button>
                      </div>
                    )}
                    
                    {/* Transfer remains available unless in auction */}
                    {!nft.inAuction && (
                      <button 
                        onClick={() => handleAction(nft.id, 'transfer')} 
                        disabled={nft.inAuction}
                        className={`w-full py-2 ${nft.inAuction ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600/20 hover:bg-blue-600 border border-blue-600/50 text-white'} rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1`}
                      >
                        <Send className="w-3 h-3" /> TRANSFER
                      </button>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      {/* ... (Keep Modal code) */}
    </div>
  );
}