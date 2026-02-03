export const CONTRACT_ADDRESS = "0xb2095eE61a45a255cbb1839D804829AcF6efa8Ed";

export const CONTRACT_ABI = [
  "function mintNFT(string _tokenURI, uint256 _price, uint8 _royalty) external returns (uint256)",
  "function listNFTForSale(uint256 tokenId, uint256 price) external",
  "function cancelSale(uint256 tokenId) external",
  "function buyNFT(uint256 tokenId) external payable",
  "function transferNFT(uint256 tokenId, address to) external",
  "function startAuction(uint256 tokenId, uint256 startingPrice, uint64 duration) external",
  "function placeBid(uint256 tokenId) external payable",
  "function endAuction(uint256 tokenId) external",
  "function cancelAuction(uint256 tokenId) external", // Added this
  "function tokenCounter() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function nftItems(uint256) external view returns (address creator, address owner, uint256 price, uint256 highestBid, address highestBidder, uint64 auctionStartTime, uint64 auctionEndTime, uint8 royaltyPercentage, bool isForSale, bool isInAuction)",
  "event NFTMinted(uint256 indexed tokenId, address owner, string tokenURI)"
];