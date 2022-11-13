const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

async function edad() {
    for (let i = 0; i < 100; i++) {
        const birthYearOlder = 1950 + i
        const birthYearYounger = 1995

        let ageYounger = 0
        let ageDiff = birthYearYounger - birthYearOlder
        let year = birthYearYounger
        let ageOlder = ageDiff

        for (let i = 0; i < 100; i++) {
            var digitsBeforeNum = ageYounger.toString().split("")
            var digits = digitsBeforeNum.map(Number)
            var digitsBeforeNum2 = ageOlder.toString().split("")
            var digits2 = digitsBeforeNum2.map(Number)

            if (digits[0] == digits2[1] && digits[1] == digits2[0] && ageOlder < 100) {
                //console.log(
                //  `En el año ${year} Raul tenía ${ageOlder} y Lucas y Arturo tenian ${ageYounger}`
                //)
                console.log(`${birthYearOlder}, at age ${ageOlder}`)
            }
            ageYounger++
            ageOlder++
            year++
        }
    }
}

edad().catch((error) => {
    console.log(error)
    process.exitCode = 1
})
