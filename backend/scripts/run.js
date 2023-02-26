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

    let txn = await gameContract.mintCharacterNFT(0);
    await txn.wait();
    console.log("Minted NFT #1");

    gameContract.mintCharacterNFT(1).then(
        () => txn.wait().then(() => console.log("Minted NFT #2")),
        (error) => console.log(getReasonFromError(error.toString()))
    );

    txn = await gameContract.attackBoss();
    await txn.wait();

    txn = await gameContract.attackBoss();
    await txn.wait();

    console.log("Done!");
};

const getReasonFromError = (errorMsg) => {
    const startIndex = errorMsg.indexOf("'");
    const endIndex = errorMsg.indexOf("'", startIndex + 1);
    return errorMsg.slice(startIndex + 1, endIndex);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
