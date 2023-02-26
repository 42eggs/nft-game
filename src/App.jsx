import React, { useEffect } from "react";

import "./App.css";

const App = () => {
    const checkIfWalletIsConnected = () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have MetaMask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }
    };


    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
