// Represents an NFT object
const NFT = {
  id: '',               // string
  tokenId: 0,           // number
  name: '',             // string
  description: '',      // string
  image: '',            // string
  price: 0,             // number
  creator: '',          // string
  owner: '',            // string
  category: '',         // 'Gods' | 'Titans' | 'Heroes' | 'Creatures' | 'Artifacts'
  collection: '',       // string
  isListed: false,      // boolean
  inAuction: false,     // boolean (optional)
  royalty: 0,           // number (optional)
  mintedAt: 0           // number (optional)
};

// Represents a Bid on an NFT
const Bid = {
  bidder: '',           // string
  amount: 0,            // number
  timestamp: 0          // number
};

// Represents an Auction object
const Auction = {
  id: '',               // string
  nft: NFT,             // NFT object
  startingPrice: 0,     // number
  currentBid: 0,        // number
  highestBidder: null,  // string or null
  endTime: 0,           // number
  timeRemaining: 0,     // number
  bids: [Bid]           // Array of Bid objects
};

// Represents a Purchase Request for an NFT
const PurchaseRequest = {
  id: '',               // string
  nftId: '',            // string
  requester: '',        // string
  offeredPrice: 0,      // number
  timestamp: 0,         // number
  status: 'pending'     // 'pending' | 'accepted' | 'rejected'
};
