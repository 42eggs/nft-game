import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

import "./App.css";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const isEthereumPresent = () => {
        const { ethereum } = window;
        if (!ethereum) {
            Swal.fire({
                icon: "error",
                title: "No Wallet Detected",
                text: "Please install Metamask or any similar wallet!",
            });
            return false;
        } else return true;
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!isEthereumPresent()) return;

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const connectWalletAction = async () => {
        try {
            if (!isEthereumPresent()) return;
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">⚔️ Token Fighters ⚔️</p>
                    <p className="sub-text">Team up to beat the boss!</p>
                    <div className="connect-wallet-container">
                        <img
                            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
                            alt="Monty Python Gif"
                        />
                        <button className="cta-button connect-wallet-button" onClick={connectWalletAction}>
                            Connect Wallet To Get Started
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
