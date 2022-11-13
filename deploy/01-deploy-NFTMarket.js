const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const NFTMarket = await deploy("NFTMarket", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(`deployed contract on ${networkName}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying NFTMarket contract on etherscan...")
        await verify(NFTMarket.address, [])
    }
}

module.exports.tags = ["all", "market"]
