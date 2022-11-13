const { moveBlocks } = require("../utils/move-blocks")

const BLOCKS = 2
const SLEEP = 1000
async function mine() {
    await moveBlocks(BLOCKS, (sleepAmount = SLEEP))
}
mine()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
