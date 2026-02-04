// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NotOwner();
error AlreadyListed();
error NotForSale();
error InsufficientFunds();
error RoyaltyTooHigh();
error AuctionActive();
error AuctionAlreadyEnded(); // Renamed to fix collision
error BidTooLow();
error TransferFailed();
error NoAuctionActive();
error AuctionStillRunning();

contract MythicNFTMarketplace is ERC721URIStorage, ReentrancyGuard, Ownable {

    struct NFTItem {
        address creator;         // 20 bytes
        address owner;           // 20 bytes
        uint256 price;           // 32 bytes
        uint256 highestBid;      // 32 bytes
        address highestBidder;   // 20 bytes
        uint64 auctionStartTime; // 8 bytes
        uint64 auctionEndTime;   // 8 bytes
        uint8 royaltyPercentage; // 1 byte
        bool isForSale;          // 1 byte
        bool isInAuction;        // 1 byte
    }

    mapping(uint256 => NFTItem) public nftItems;
    uint256 public tokenCounter;

    event NFTMinted(uint256 indexed tokenId, address owner, string tokenURI);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTSold(uint256 indexed tokenId, address buyer, uint256 price);
    event NFTTransferred(uint256 indexed tokenId, address from, address to);
    event AuctionStarted(uint256 indexed tokenId, uint256 startPrice, uint256 duration);
    event NewBid(uint256 indexed tokenId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 indexed tokenId, address winner, uint256 finalPrice);

    constructor() ERC721("MythicNFT", "MNT") Ownable(msg.sender) {}

    function mintNFT(string calldata _tokenURI, uint256 _price, uint8 _royalty) external nonReentrant returns (uint256) {
        if (_royalty > 50) revert RoyaltyTooHigh();
        
        uint256 tokenId = tokenCounter;
        unchecked { tokenCounter++; }
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        nftItems[tokenId] = NFTItem({
            creator: msg.sender,
            owner: msg.sender,
            price: _price,
            highestBid: 0,
            highestBidder: address(0),
            auctionStartTime: 0,
            auctionEndTime: 0,
            royaltyPercentage: _royalty,
            isForSale: false,
            isInAuction: false
        });
        
        emit NFTMinted(tokenId, msg.sender, _tokenURI);
        return tokenId;
    }

    function listNFTForSale(uint256 tokenId, uint256 price) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        NFTItem storage item = nftItems[tokenId];
        if (item.isForSale) revert AlreadyListed();
        
        item.price = price;
        item.isForSale = true;
        
        emit NFTListed(tokenId, price);
    }

    function cancelSale(uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        NFTItem storage item = nftItems[tokenId];
        if (!item.isForSale) revert NotForSale();
        
        item.isForSale = false;
    }

    function buyNFT(uint256 tokenId) external payable nonReentrant {
        NFTItem storage item = nftItems[tokenId];
        if (!item.isForSale) revert NotForSale();
        if (msg.value < item.price) revert InsufficientFunds();

        address seller = item.owner;
        address creator = item.creator;
        uint256 price = msg.value;
        
        uint256 royaltyAmount = (price * item.royaltyPercentage) / 100;
        
        item.owner = msg.sender;
        item.isForSale = false;

        _transfer(seller, msg.sender, tokenId);

        if (royaltyAmount > 0) {
            (bool rSent, ) = creator.call{value: royaltyAmount}("");
            if (!rSent) revert TransferFailed();
        }

        (bool sSent, ) = seller.call{value: price - royaltyAmount}("");
        if (!sSent) revert TransferFailed();
        
        emit NFTSold(tokenId, msg.sender, price);
    }

    function transferNFT(uint256 tokenId, address recipient) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        
        NFTItem storage item = nftItems[tokenId];
        item.owner = recipient;
        item.isForSale = false;
        
        _transfer(msg.sender, recipient, tokenId);
        emit NFTTransferred(tokenId, msg.sender, recipient);
    }

    function startAuction(uint256 tokenId, uint256 startPrice, uint64 duration) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        NFTItem storage item = nftItems[tokenId];
        if (item.isInAuction) revert AuctionActive();
        
        item.isInAuction = true;
        item.auctionStartTime = uint64(block.timestamp);
        item.auctionEndTime = uint64(block.timestamp + duration);
        item.highestBid = startPrice;
        item.highestBidder = address(0);
        
        emit AuctionStarted(tokenId, startPrice, duration);
    }

    function placeBid(uint256 tokenId) external payable nonReentrant {
        NFTItem storage item = nftItems[tokenId];
        if (!item.isInAuction) revert NoAuctionActive();
        if (block.timestamp >= item.auctionEndTime) revert AuctionAlreadyEnded();
        if (msg.value <= item.highestBid) revert BidTooLow();
        
        address prevBidder = item.highestBidder;
        uint256 prevBid = item.highestBid;
        
        item.highestBidder = msg.sender;
        item.highestBid = msg.value;
        
        if (prevBidder != address(0)) {
            (bool refunded, ) = prevBidder.call{value: prevBid}("");
            if (!refunded) revert TransferFailed();
        }
        
        emit NewBid(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) external nonReentrant {
        NFTItem storage item = nftItems[tokenId];
        if (!item.isInAuction) revert NoAuctionActive();
        if (block.timestamp < item.auctionEndTime) revert AuctionStillRunning();
        
        address winner = item.highestBidder;
        uint256 finalPrice = item.highestBid;
        address seller = item.owner;

        item.isInAuction = false;
        item.isForSale = false;

        if (winner != address(0)) {
            uint256 royaltyAmount = (finalPrice * item.royaltyPercentage) / 100;
            item.owner = winner;
            _transfer(seller, winner, tokenId);

            if (royaltyAmount > 0) {
                (bool rSent, ) = item.creator.call{value: royaltyAmount}("");
                if (!rSent) revert TransferFailed();
            }
            (bool sSent, ) = seller.call{value: finalPrice - royaltyAmount}("");
            if (!sSent) revert TransferFailed();
        }
        
        emit AuctionEnded(tokenId, winner, finalPrice);
    }

    function getNFTDetails(uint256 tokenId) external view returns (NFTItem memory) {
        return nftItems[tokenId];
    }
}