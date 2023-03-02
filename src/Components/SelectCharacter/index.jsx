import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { transformCharacterData, chainId } from "../../utils";
import NFTGameAddresses from "../../../backend/addresses/NFTGame.json";
import NFTGame from "../../../backend/artifacts/contracts/NFTGame.sol/NFTGame.json";
import Swal from "sweetalert2";
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-right",
        iconColor: "white",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = async (characterId) => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log("Minting character in progress...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("mintTxn:", mintTxn);
                await Toast.fire({
                    icon: "success",
                    title: "<strong style='color:white'>Mint Successful</strong>",
                    background: "green",
                });
                setMintingCharacter(false);
            }
        } catch (error) {
            console.warn("MintCharacterAction Error:", error);
            setMintingCharacter(false);
        }
    };

    useEffect(() => {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(NFTGameAddresses[chainId], NFTGame.abi, signer);
            setGameContract(gameContract);
        } else {
            console.log("Ethereum object not found");
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log("Getting contract characters to mint");

                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("charactersTxn:", charactersTxn);

                const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));

                setCharacters(characters);
            } catch (error) {
                console.error("Something went wrong fetching characters:", error);
            }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );

            // Once character is minted, update the UI
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("CharacterNFT: ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
            }
        };

        if (gameContract) {
            getCharacters();
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }

        return () => {
            // Remove listener when the component is unmounted
            if (gameContract) {
                gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
        };
    }, [gameContract]);

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.index}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={`https://nftstorage.link/ipfs/${character.imageURI}`} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={() => mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
        ));

    return (
        <div className="select-character-container">
            <h2>Mint Your Fighter. Choose wisely.</h2>
            {characters.length > 0 && <div className="character-grid">{renderCharacters()}</div>}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Minting In Progress...</p>
                    </div>
                    <img
                        src="https://media4.giphy.com/media/3BgL0ZCot6FGdoB5aI/giphy.gif?cid=ecf05e470wlo59881emgfazsltbjp57ctk0fs5csmut63sak&rid=giphy.gif&ct=g"
                        alt="Minting loading indicator"
                    />
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;
