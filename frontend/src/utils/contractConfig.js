export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const CONTRACT_ABI = [
  "function mintNFT(string _tokenURI, uint256 _price, uint256 _royalty) public returns (uint256)",
  "function listNFTForSale(uint256 tokenId, uint256 price) public",
  "function cancelSale(uint256 tokenId) public",
  "function buyNFT(uint256 tokenId) public payable",
  "function transferNFT(uint256 tokenId, address to) public",
  "function startAuction(uint256 tokenId, uint256 startingPrice, uint256 duration) public",
  "function placeBid(uint256 tokenId) public payable",
  "function endAuction(uint256 tokenId) public",
  "function tokenCounter() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function nftItems(uint256) public view returns (uint256 tokenId, address owner, uint256 price, bool isForSale, bool isInAuction, uint256 auctionStartTime, uint256 auctionEndTime, uint256 highestBid, address highestBidder, bool isMinted)",
  "event NFTMinted(uint256 tokenId, address owner, string tokenURI)"
];