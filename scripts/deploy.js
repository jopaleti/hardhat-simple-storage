// Imports
const { ethers, run, network } = require("hardhat")

// Async main
async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying SimpleStorage Contract...")
    const simpleStorage = await SimpleStorageFactory.deploy()
    console.log("Contract deployed, waiting for confirmation...")
    await simpleStorage.deploymentTransaction().wait(1)
    // Getting the contract address using  "simpleStorage.target"
    console.log("SimpleStorage deployed to:", simpleStorage.target)
    // What happens when we deploy to our hardhat network?
    console.log(network.config)
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmation...")
        await simpleStorage.deploymentTransaction().wait(6)
        await verify(simpleStorage.target, [])
    }

    // Start interacting with the contract
    const currentValue = await simpleStorage.retrieve()
    console.log(`Current value of the contract: ${currentValue.toString()}`)

    // Update the current value
    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)
    const updatedValue = await simpleStorage.retrieve()
    console.log(`Updated value of the contract: ${updatedValue.toString()}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(error)
        }
    }
}

// Main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
