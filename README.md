# NFT Turn-based Fighting Game


### Check out a live deployment <ins>[here](https://nft-game-alpha-beige.vercel.app/)</ins>.

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
 
2. Rename `.env-example` to `.env` in `/backend` and fill it up the required values.
   
3. Deploy to any network by 
4. 
   ```bash
   npx hardhat run scripts/deploy.js --network {networkName}
   ``` 
   This will create the deployed address inside `addresses/NFTGame.json` along with the network ID like `"80001":"0xA154541E74523fE9b82E47501B36908E3237c52a"` 
   This can be later used by React.



## **Frontend** (React)

1. React will automatically pull the address and contract ABI from `backend/addresses/NFTGame.json` and `backend/artifacts/contracts/NFTGame.sol/NFTGame.json` respectively.
 
2. If you make any changes to the smart contract, just make sure to re-deploy and update the chainID in `src/utils.js`





