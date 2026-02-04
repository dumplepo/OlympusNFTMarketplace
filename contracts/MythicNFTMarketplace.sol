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
        address creator;
        address owner;
        uint256 price;
        uint256 royaltyPercentage;
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
        require(_royalty <= 50, "Royalty cannot exceed 50%"); // Safety check
        uint256 tokenId = tokenCounter++;
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        nftItems[tokenId] = NFTItem({
            tokenId: tokenId,
            creator: msg.sender, // Store original creator
            owner: msg.sender,
            price: _price,
            royaltyPercentage: _royalty, // Store the percentage
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
        NFTItem storage item = nftItems[tokenId];
        require(item.isForSale, "NFT is not for sale");
        require(msg.value >= item.price, "Insufficient funds");

        address seller = item.owner;
        address creator = item.creator;
        uint256 price = item.price;
        
        // Calculate Royalty
        uint256 royaltyAmount = (price * item.royaltyPercentage) / 100;
        uint256 sellerProceeds = price - royaltyAmount;

        // 1. Pay Creator Royalty
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = creator.call{value: royaltyAmount}("");
            require(royaltySent, "Failed to send royalty");
        }

        // 2. Pay Seller
        (bool sellerSent, ) = seller.call{value: sellerProceeds}("");
        require(sellerSent, "Failed to send proceeds to seller");
        
        // 3. Transfer Ownership
        _transfer(seller, msg.sender, tokenId);
        item.owner = msg.sender;
        item.isForSale = false;
        
        emit NFTSold(tokenId, msg.sender, price);
    }

    function _settleAuctionInternal(uint256 tokenId) internal {
        NFTItem storage item = nftItems[tokenId];
        if (!item.isInAuction || block.timestamp < item.auctionEndTime) return;

        address winner = item.highestBidder;
        uint256 finalPrice = item.highestBid;
        address seller = item.owner;
        address creator = item.creator;

        item.isInAuction = false;

        if (winner != address(0)) {
            // Split Auction payment
            uint256 royaltyAmount = (finalPrice * item.royaltyPercentage) / 100;
            uint256 sellerProceeds = finalPrice - royaltyAmount;

            if (royaltyAmount > 0) {
                (bool royaltySent, ) = creator.call{value: royaltyAmount}("");
            }
            (bool sellerSent, ) = seller.call{value: sellerProceeds}("");
            
            _transfer(seller, winner, tokenId);
            item.owner = winner;
        }
        
        item.isForSale = false;
        item.highestBid = 0;
        item.highestBidder = address(0);
        emit AuctionEnded(tokenId, winner, finalPrice);
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
        NFTItem storage item = nftItems[tokenId];
        require(item.isInAuction, "NFT is not in auction");
        require(block.timestamp >= item.auctionEndTime, "Auction is still running");
        
        address winner = item.highestBidder;
        uint256 finalPrice = item.highestBid;
        address seller = item.owner;
        address creator = item.creator;
        
        // 1. Mark auction as ended immediately to prevent re-entry
        item.isInAuction = false;
        
        // 2. ONLY proceed with transfer/payment if there was a bidder
        if (winner != address(0)) {
            // CALCULATE ROYALTY (Same logic as buyNFT)
            uint256 royaltyAmount = (finalPrice * item.royaltyPercentage) / 100;
            uint256 sellerProceeds = finalPrice - royaltyAmount;

            // Pay Creator
            if (royaltyAmount > 0) {
                (bool royaltySent, ) = creator.call{value: royaltyAmount}("");
                require(royaltySent, "Failed to send royalty");
            }

            // Pay Seller
            (bool sellerSent, ) = seller.call{value: sellerProceeds}("");
            require(sellerSent, "Payment to seller failed");
            
            // Transfer ownership
            _transfer(seller, winner, tokenId);
            item.owner = winner;
        }
        // If winner is address(0), nobody bid. Auction ends, owner keeps the NFT.

        // 3. Clear sale/auction status so it's fresh for the new owner
        item.isForSale = false;
        item.highestBid = 0;
        item.highestBidder = address(0);
        
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
