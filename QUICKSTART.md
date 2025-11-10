# BlockLucky - Démarrage rapide

## Installation

```bash
npm install
npm run compile
npm test
```

## Utilisation locale

### Terminal 1
```bash
npm run node
```

### Terminal 2
```bash
npm run deploy:local
npm run status
npm run interact
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run compile` | Compiler |
| `npm test` | Tests |
| `npm run node` | Nœud local |
| `npm run deploy:local` | Déployer |
| `npm run status` | Voir le statut |
| `npm run interact` | Interaction auto |

## Configuration

Modifiez `scripts/deploy.js` pour changer les paramètres.

## Console interactive

```bash
npx hardhat console --network localhost
```

```javascript
const BlockLucky = await ethers.getContractFactory("BlockLucky");
const data = require("./deployed-contract.json");
const lottery = BlockLucky.attach(data.address);

const [owner, player] = await ethers.getSigners();
const price = await lottery.ticketPrice();
await lottery.connect(player).buyTicket(1, { value: price });

console.log("Joueurs:", (await lottery.getPlayersCount()).toString());
console.log("Cagnotte:", ethers.formatEther(await lottery.getPrizePool()));
```
