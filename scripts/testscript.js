const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

async function main() {
    let NFTMarket, basicNft, deployer, player
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0
    deployer = (await getNamedAccounts()).deployer
    //player = (await getNamedAccounts()).player  we can grab the player account from get named accounts
    const accounts = await ethers.getSigners() //its better for ethers if we use get signers, since the account object will be aligned with the ether call functions
    player = accounts[1]
    await deployments.fixture(["all"])
    NFTMarket = await ethers.getContract("NFTMarket") //ethers defaults to connect our contract with whatever account is in account 0, in this case its our deployer
    //NFTMarket = await NFTMarket.connect(player)
    basicNft = await ethers.getContract("BasicNft")
    console.log("minting nft..")
    await basicNft.mintNft() //deployer minted the NFT therefore it is the deployer who has to approve it
    const tokenCounter = await basicNft.getExists(0)
    console.log(`tokencounter is ${tokenCounter}`)
    console.log("approving NFTmarket")
    await basicNft.approve(NFTMarket.address, TOKEN_ID)
    console.log("listing item")
    await NFTMarket.listItem(basicNft.address, TOKEN_ID, PRICE)
    const playerConnectedNFTMarket = await NFTMarket.connect(player)
    console.log("buying item")
    await playerConnectedNFTMarket.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
    const newOwner = await basicNft.ownerOf(TOKEN_ID)
    const deployerProceeds = await NFTMarket.getProceeds(deployer)
    console.log(`${newOwner.toString()} == ${player.address}`) //if we used the getSigners() method to get player, to check the address we need to use player.address
    console.log(`${deployerProceeds.toString()} == ${PRICE.toString()}`)
}

main().catch((error) => {
    console.log(error)
    process.exitCode = 1
})
