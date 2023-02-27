# NFT Turn-based Fighting Game


## Getting Started

```
git clone https://github.com/42eggs/nft-game
cd nft-game
```

### For React setup

```bash
npm install 
npm run dev
```

### For Hardhat setup

```bash
cd backend
npm install
```



## **Backend** (Hardhat)

1. Replace/Add character values as you wish in `backend/charValues.json`. I've used Game of Thrones characters 😅
 
2. Create `.env` file in `backend/` and fill it up with `PRIVATE_KEY`, `GOERLI_API_URL`, `MUMBAI_API_URL` and `POLYGON_MAINNET_API_URL`(for mainnet deployment) string values.
   
3. Deploy to any network by 
   ```bash
   npx hardhat run scripts/deploy --network{networkName}
   ``` 
   This will create the deployed address inside `addresses/NFTGame.json` along with the network ID like `"80001":"0x525e904dB1310ea3dD06199670256192e3520eD2"` 
   This can be later used by React.



## **Frontend** (React)

1. React will automatically pull the address and contract ABI from `backend/addresses/NFTGame.json` and `backend/artifacts/contracts/NFTGame.sol/NFTGame.json` respectively.
 
2. If you make any changes to the smart contract, just make sure to re-deploy and update the chainID in `src/utils.js`




