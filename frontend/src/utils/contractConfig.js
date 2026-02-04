export const CONTRACT_ADDRESS = "0x870601b1fD18A2f1f9997763ed34C94b80b808B4";

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
  "function nftItems(uint256) public view returns (uint256 tokenId, address creator, address owner, uint256 price, uint256 royaltyPercentage, bool isForSale, bool isInAuction, uint256 auctionStartTime, uint256 auctionEndTime, uint256 highestBid, address highestBidder, bool isMinted)",
  "event NFTMinted(uint256 tokenId, address owner, string tokenURI)"
];