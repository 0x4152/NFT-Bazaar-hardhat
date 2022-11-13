const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", function () {
          let NFTMarket, basicNft, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              //player = (await getNamedAccounts()).player  we can grab the player account from get named accounts
              const accounts = await ethers.getSigners() //its better for ethers if we use get signers, since the account object will be aligned with the ether call functions
              player = accounts[1]
              await deployments.fixture(["all"])
              NFTMarket = await ethers.getContract("NFTMarket") //ethers defaults to connect our contract with whatever account is in account 0, in this case its our deployer
              //NFTMarket = await NFTMarket.connect(player)
              basicNft = await ethers.getContract("BasicNft")
              await basicNft.mintNft() //deployer minted the NFT therefore it is the deployer who has to approve it
              await basicNft.approve(NFTMarket.address, TOKEN_ID)
              console.log("---------")
          })
          it("lists and can be bought", async function () {
              console.log("---------------")
              await NFTMarket.listItem(basicNft.address, TOKEN_ID, PRICE)
              const playerConnectedNFTMarket = await NFTMarket.connect(player)
              await playerConnectedNFTMarket.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
              const newOwner = await basicNft.ownerOf(TOKEN_ID)
              const deployerProceeds = await NFTMarket.getProceeds(deployer)
              assert(newOwner.toString() == player.address) //if we used the getSigners() method to get player, to check the address we need to use player.address
              assert(deployerProceeds.toString() == PRICE.toString())
          })
      })
