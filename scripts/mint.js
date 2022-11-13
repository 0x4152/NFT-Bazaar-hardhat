const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function mint() {
    let NFTMarket, basicNft, deployer, player

    deployer = (await getNamedAccounts()).testDeployer
    //player = (await getNamedAccounts()).player  we can grab the player account from get named accounts
    const accounts = await ethers.getSigners() //its better for ethers if we use get signers, since the account object will be aligned with the ether call functions
    player = accounts[1]
    console.log(player.address)
    console.log(deployer)
    basicNft = await ethers.getContract("BasicNft")
    basicNft = await basicNft.connect(player)
    console.log("minting nft..")
    const mintTx = await basicNft.mintNft() //deployer minted the NFT therefore it is the deployer who has to approve it
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`token ID from new NFT minted is : ${tokenId}`)
    console.log(`NFT address is :  ${basicNft.address}`)
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mint().catch((error) => {
    console.log(error)
    process.exitCode = 1
})
