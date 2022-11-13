const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function transfer() {
    let NFTMarket, basicNft, deployer, player

    //player = (await getNamedAccounts()).player  we can grab the player account from get named accounts
    const accounts = await ethers.getSigners() //its better for ethers if we use get signers, since the account object will be aligned with the ether call functions
    sender = accounts[0]
    console.log(sender.address)
    const tx = await sender.sendTransaction({
        to: "0xFF5bE4c96A0f54d86a6b1D709e4C05601C8ea0AB",
        value: ethers.utils.parseEther("0.005"),
    })
    const response = await tx.wait(1)
    console.log(tx)
    console.log(response)
}

transfer().catch((error) => {
    console.log(error)
    process.exitCode = 1
})
