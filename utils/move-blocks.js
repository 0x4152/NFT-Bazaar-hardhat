// no need to execute main funct since this will be a function that is imported onto other scripts

const { network } = require("hardhat")
function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs)) //the way we wait in javascript is creating a promise that returns a function.
    //this function calls setTimeout, that will resolve after the second parameter, timeInMs passes.
}

//AMOUNT: BLOCKS MINED,
//SLEEPAMOUNT: MILLISECONDS BETWEEN BLOCK-MINING

async function moveBlocks(amount, sleepAmount = 0) {
    console.log("moving blocks")
    //this is a raw call to evm mine, normally we let ethers abstaracts this
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAMount) {
            console.log(`sleeping for ${sleepAmount}`)
            await sleep(sleepAmount)
        }
    }
}

module.exports = {
    moveBlocks,
    sleep,
}
