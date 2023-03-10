import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Arena.css";
import NFTGameAddresses from "../../../backend/addresses/NFTGame.json";
import NFTGame from "../../../backend/artifacts/contracts/NFTGame.sol/NFTGame.json";
import { ethers } from "ethers";
import { transformCharacterData, chainId } from "../../utils";
import LoadingIndicator from "../../Components/LoadingIndicator";

const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log("Boss:", bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };

        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            const sender = from.toString();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            if (currentAccount === sender.toLowerCase()) {
                setBoss((prevState) => {
                    return { ...prevState, hp: bossHp };
                });
                setCharacterNFT((prevState) => {
                    return { ...prevState, hp: playerHp };
                });
            } else {
                setBoss((prevState) => {
                    return { ...prevState, hp: bossHp };
                });
            }
        };

        if (gameContract) {
            fetchBoss();
            gameContract.on("AttackComplete", onAttackComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off("AttackComplete", onAttackComplete);
            }
        };
    }, [gameContract]);

    useEffect(() => {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(NFTGameAddresses[chainId], NFTGame.abi, signer);

            setGameContract(gameContract);
        } else {
            console.log("Ethereum object not found");
        }
    }, []);

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState("attacking");
                console.log("Attacking boss...");
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log("attackTxn:", attackTxn);
                setAttackState("hit");
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.error("Error attacking boss:", error);
            setAttackState("");
        }
    };

    return (
        <div className="arena-container">
            {boss && characterNFT && (
                <div id="toast" className={showToast ? "show" : ""}>
                    <div id="desc">{`???? ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
                </div>
            )}
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content  ${attackState}`}>
                        <h2>???? {boss.name} ????</h2>
                        <div className="image-content">
                            <img src={`https://nftstorage.link/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="attack-container">
                        <button className="cta-button" onClick={runAttackAction}>
                            {`???? Attack ${boss.name}`}
                        </button>
                    </div>
                    {/* Add this right under your attack button */}
                    {attackState === "attacking" && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Attacking ??????</p>
                        </div>
                    )}
                </div>
            )}

            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Your Character</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNFT.name}</h2>
                                <img
                                    src={`https://nftstorage.link/ipfs/${characterNFT.imageURI}`}
                                    alt={`Character ${characterNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`?????? Attack Damage: ${characterNFT.attackDamage}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arena;
