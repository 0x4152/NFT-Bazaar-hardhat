const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function mintAndList() {
    let NFTMarket, basicNft, deployer, player
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0
    deployer = (await getNamedAccounts()).deployer
    //player = (await getNamedAccounts()).player  we can grab the player account from get named accounts
    const accounts = await ethers.getSigners() //its better for ethers if we use get signers, since the account object will be aligned with the ether call functions
    player = accounts[1]
    NFTMarket = await ethers.getContract("NFTMarket") //ethers defaults to connect our contract with whatever account is in account 0, in this case its our deployer
    //NFTMarket = await NFTMarket.connect(player)
    console.log(`basic NFT market address : ${NFTMarket.address}`)
    basicNft = await ethers.getContract("BasicNft")
    console.log(`basic nft address : ${basicNft.address}`)
    console.log("minting nft..")
    const mintTx = await basicNft.mintNft() //deployer minted the NFT therefore it is the deployer who has to approve it
    const mintTxReceipt = await mintTx.wait(1)

    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("approving NFTmarket")
    const approveTx = await basicNft.approve(NFTMarket.address, tokenId)
    await approveTx.wait(1)
    console.log("listing item")
    const listTx = await NFTMarket.listItem(basicNft.address, tokenId, PRICE)
    await listTx.wait(1)
    console.log("listed!")
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList().catch((error) => {
    console.log(error)
    process.exitCode = 1
})
