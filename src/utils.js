const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};

const getReasonFromError = (errorMsg) => {
    const startIndex = errorMsg.indexOf("'");
    const endIndex = errorMsg.indexOf("'", startIndex + 1);
    return errorMsg.slice(startIndex + 1, endIndex);
};

const chainId = "80001";

export { chainId, getReasonFromError, transformCharacterData };
