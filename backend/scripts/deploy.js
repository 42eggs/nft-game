// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const charValues = require("../charValues.json");

const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory("NFTGame");
    const gameContract = await gameContractFactory.deploy(
        charValues.characterNames,
        charValues.characterImageURIs,
        charValues.characterHps,
        charValues.characterAttackDmgs,
        charValues.bossName,
        charValues.bossImageURI,
        charValues.bossHp,
        charValues.bossAttackDamage
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);
    writeAddressToFile(gameContract.address);
};

const writeAddressToFile = (address) => {
    const filePath = path.join(__dirname, "..", "addresses", "NFTGame.json");
    const fileContents = fs.readFileSync(filePath, "utf8");

    const data = JSON.parse(fileContents);
    data.address = address;

    fs.writeFileSync(filePath, JSON.stringify(data));
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
