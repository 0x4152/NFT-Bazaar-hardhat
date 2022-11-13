const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractsFile = "../front-market/constants/networkMapping.json"
const frontABILocation = "../front-market/constants/" //we put location instead of specific address because we'll overwrite the ABI completely each time its updated
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating the front end")
        await updateFrontEnd()
        await updateABI()
    }
}
async function updateABI() {
    console.log("Updating abi")
    const NFTMarket = await ethers.getContract("NFTMarket")
    fs.writeFileSync(
        `${frontABILocation}NFTMarket.json`,
        NFTMarket.interface.format(ethers.utils.FormatTypes.json)
    )
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontABILocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}
async function updateFrontEnd() {
    const nftMarket = await ethers.getContract("NFTMarket")
    const chainId = network.config.chainId.toString()
    console.log(`parse : ${frontEndContractsFile}`)
    console.log(`co`)
    console.log(`json parse : ${fs.readFileSync(frontEndContractsFile, "utf8")}`)
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    console.log(contractAddresses)
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NFTMarket"].includes(nftMarket.address)) {
            contractAddresses[chainId]["NFTMarket"].push(nftMarket.address)
        }
    } else {
        contractAddresses[chainId] = { NFTMarket: [nftMarket.address] }
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
