// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ========================================
    Greek Mythology NFT Marketplace Contract
    ========================================
    This contract enables minting, listing, buying, transferring, auctioning, and purchase requests
    for NFTs based on Greek Mythology, supporting Web3 interaction.
    
    Environment:
    - Node.js v22x
    - Hardhat v2x
    - @nomicfoundation/hardhat-toolbox "^6.1.0"
*/

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MythicNFTMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {

    struct NFTItem {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool isForSale;
        bool isInAuction;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        uint256 highestBid;
        address highestBidder;
        bool isMinted;
    }

    // Mapping of tokenId to NFT details
    mapping(uint256 => NFTItem) public nftItems;

    // Events for contract interaction
    event NFTMinted(uint256 tokenId, address owner, string tokenURI);
    event NFTListed(uint256 tokenId, uint256 price);
    event NFTSold(uint256 tokenId, address buyer, uint256 price);
    event NFTTransferred(uint256 tokenId, address from, address to);
    event AuctionStarted(uint256 tokenId, uint256 startPrice, uint256 duration);
    event NewBid(uint256 tokenId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 finalPrice);

    uint256 public tokenCounter;
    
    constructor() ERC721("MythicNFT", "MNT") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    // Minting a new NFT
    function mintNFT(string memory _tokenURI, uint256 _price, uint256 _royalty) public nonReentrant returns (uint256) {
        uint256 tokenId = tokenCounter++;
        
        // Mint the NFT
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Create the NFTItem
        nftItems[tokenId] = NFTItem({
            tokenId: tokenId,
            owner: msg.sender,
            price: _price,
            isForSale: false,
            isInAuction: false,
            auctionStartTime: 0,
            auctionEndTime: 0,
            highestBid: 0,
            highestBidder: address(0),
            isMinted: true
        });
        
        emit NFTMinted(tokenId, msg.sender, _tokenURI);
        return tokenId;
    }

    // List NFT for sale
    function listNFTForSale(uint256 tokenId, uint256 price) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(!nftItems[tokenId].isForSale, "NFT is already listed for sale");
        
        nftItems[tokenId].price = price;
        nftItems[tokenId].isForSale = true;
        
        emit NFTListed(tokenId, price);
    }

    // Cancel sale
    function cancelSale(uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nftItems[tokenId].isForSale, "NFT is not listed for sale");
        
        nftItems[tokenId].isForSale = false;
    }

    // Buy NFT from marketplace
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        require(nftItems[tokenId].isForSale, "NFT is not for sale");
        require(msg.value >= nftItems[tokenId].price, "Insufficient funds");

        address seller = nftItems[tokenId].owner;
        uint256 price = nftItems[tokenId].price;
        
        // Transfer funds to the seller
        (bool sent, ) = seller.call{value: price}("");
        require(sent, "Failed to send Ether to seller");
        
        // Transfer ownership of the NFT
        _transfer(seller, msg.sender, tokenId);
        
        nftItems[tokenId].owner = msg.sender;
        nftItems[tokenId].isForSale = false;
        
        emit NFTSold(tokenId, msg.sender, price);
    }

    // Transfer NFT between users
    function transferNFT(uint256 tokenId, address recipient) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        
        _transfer(msg.sender, recipient, tokenId);
        
        nftItems[tokenId].owner = recipient;
        nftItems[tokenId].isForSale = false;
        
        emit NFTTransferred(tokenId, msg.sender, recipient);
    }

    // Start auction for NFT
    function startAuction(uint256 tokenId, uint256 startPrice, uint256 duration) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(!nftItems[tokenId].isInAuction, "NFT is already in an auction");
        
        nftItems[tokenId].isInAuction = true;
        nftItems[tokenId].auctionStartTime = block.timestamp;
        nftItems[tokenId].auctionEndTime = block.timestamp + duration;
        nftItems[tokenId].highestBid = startPrice;
        
        emit AuctionStarted(tokenId, startPrice, duration);
    }

    // Place a bid on an auctioned NFT
    function placeBid(uint256 tokenId) public payable nonReentrant {
        require(nftItems[tokenId].isInAuction, "NFT is not in auction");
        require(block.timestamp < nftItems[tokenId].auctionEndTime, "Auction has ended");
        require(msg.value > nftItems[tokenId].highestBid, "Bid is too low");
        
        address previousHighestBidder = nftItems[tokenId].highestBidder;
        uint256 previousHighestBid = nftItems[tokenId].highestBid;
        
        // Refund previous highest bidder if any
        if (previousHighestBidder != address(0)) {
            (bool refunded, ) = previousHighestBidder.call{value: previousHighestBid}("");
            require(refunded, "Refund to previous bidder failed");
        }
        
        nftItems[tokenId].highestBidder = msg.sender;
        nftItems[tokenId].highestBid = msg.value;
        
        emit NewBid(tokenId, msg.sender, msg.value);
    }

    // End auction and transfer NFT to winner
    function endAuction(uint256 tokenId) public nonReentrant {
        require(nftItems[tokenId].isInAuction, "NFT is not in auction");
        require(block.timestamp >= nftItems[tokenId].auctionEndTime, "Auction is still running");
        
        address winner = nftItems[tokenId].highestBidder;
        uint256 finalPrice = nftItems[tokenId].highestBid;
        address seller = nftItems[tokenId].owner;
        
        // Transfer NFT to winner
        _transfer(seller, winner, tokenId);
        
        // Transfer funds to the seller
        (bool sent, ) = seller.call{value: finalPrice}("");
        require(sent, "Payment to seller failed");
        
        nftItems[tokenId].owner = winner;
        nftItems[tokenId].isInAuction = false;
        
        emit AuctionEnded(tokenId, winner, finalPrice);
    }
    
    // Request to purchase an NFT from another user (off-chain agreement)
    function requestPurchase(uint256 tokenId, uint256 offeredPrice) public nonReentrant {
        require(ownerOf(tokenId) != msg.sender, "You cannot request to buy your own NFT");
        
        // Implement off-chain negotiation flow as necessary
    }

    // Get current NFT details
    function getNFTDetails(uint256 tokenId) public view returns (NFTItem memory) {
        return nftItems[tokenId];
    }
}
