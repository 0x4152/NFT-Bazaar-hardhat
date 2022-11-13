// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; //yarn add --dev @openzeppelin/contracts
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTMarket__NoProceeds();
error NFTMarket__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 priceNotMet,
    uint256 messageValue
);
error NFTMarket__NotOwner();
error NFTMarket__NotApprovedForMarketPlace();
error NFTMarket__PriceMustBeAboveZero();
error NFTMarket__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarket__NotListed(address nftAddress, uint256 tokenId);
error NFTMarket__WithdrawCallError();

contract NFTMarket is ReentrancyGuard {
    struct Listing {
        uint256 Price;
        address Seller;
    }
    // NFT Contract address -> NFT tokenId -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;
    //This mapping keeps track of the money the protocol is holding for the user,
    //since it is the contract that is sent the ETH in exchange for the NFT.

    //events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event UpdatedListing(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    //modifiers
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address tokenOwner = nft.ownerOf(tokenId); //we use openzeppelins ERC721 function to check who's the real token owner
        if (spender != tokenOwner) {
            revert NFTMarket__NotOwner();
        }
        _;
    }
    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId]; //c
        if (listing.Price > 0) {
            revert NFTMarket__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId]; //c
        if (listing.Price <= 0) {
            revert NFTMarket__NotListed(nftAddress, tokenId);
        }
        _;
    }

    //main functions

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        //listItem checks that the nftHasn't been listed, checking the mapping of listings regarding the nftAddress and the token ID
        //then it ckecks if the person calling the function is the owner of the NFT, since all NFTs follow the standard, we should be able
        //to call .ownerOf(tokenId) on the NFT contract, to get the actual owner.
        if (price <= 0) {
            revert NFTMarket__PriceMustBeAboveZero();
        }
        // Owners hold the NFT but this contract has approval to sell the NFT
        //to do this we need the IERC721 interface, to call for approval with getApproved()
        IERC721 nft = IERC721(nftAddress);
        //on the ERC721 contract standard, each token can have one address approved.
        //getApproved(uint256 tokenId) = approvedAddress
        //it reverts an address if it has been approved, zero if there isn't any address approved, and reverts if the tokenId doesn't exist
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarket__NotApprovedForMarketPlace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    //we call any external function as the last step in our function to prevent reentrancy attacks
    //we can also use a mutex: bool that sets itself to locked once the function starts
    //at the beggining of fucntion we check if it is locked to prevent reentrancy
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.Price) {
            revert NFTMarket__PriceNotMet(nftAddress, tokenId, listedItem.Price, msg.value);
        }
        s_proceeds[listedItem.Seller] = s_proceeds[listedItem.Seller] + msg.value;
        delete (s_listings[nftAddress][tokenId]);
        //safeTransferFrom instead of transferFrom
        //safe transfer from throws an error unless msg.sender is the current owner, an authorized operator, or the approved
        //address for this NFT
        //with transferFrom the caller is responsible to confirm that _to is capable of recieving NFTs or else they may be permanently lost.
        IERC721(nftAddress).safeTransferFrom(listedItem.Seller, msg.sender, tokenId);

        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.Price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        if (newPrice <= 0) {
            revert NFTMarket__PriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].Price = newPrice;
        emit UpdatedListing(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NFTMarket__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NFTMarket__WithdrawCallError();
        }
    }

    //getter functions
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
