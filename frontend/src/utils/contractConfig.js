export const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const CONTRACT_ABI = [
  "function mintNFT(string _tokenURI, uint256 _price, uint256 _royalty) public returns (uint256)",
  "function tokenCounter() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function nftItems(uint256) public view returns (uint256 tokenId, address owner, uint256 price, bool isForSale, bool isInAuction, uint256 auctionStartTime, uint256 auctionEndTime, uint256 highestBid, address highestBidder, bool isMinted)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event NFTMinted(uint256 tokenId, address owner, string tokenURI)"
];