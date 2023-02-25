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

    // Minting some NFTs
    let txn = await gameContract.mintCharacterNFT(2);
    await txn.wait();

    // Get the value of the NFT's URI.
    let returnedTokenUri = await gameContract.tokenURI(1);
    console.log("Token URI:", returnedTokenUri);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
