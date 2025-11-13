# 🎰 BlockLucky - Loterie Décentralisée

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

Loterie décentralisée sur Ethereum avec Solidity et Hardhat.

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Tests](#-tests)
- [Sécurité](#-sécurité)

---

## ✨ Fonctionnalités

- ✅ Achat de tickets avec ethers
- ✅ Tirage automatique au seuil de joueurs
- ✅ Distribution automatique des gains
- ✅ Limite de tickets par joueur
- ✅ Commission organisateur (max 20%)
- ✅ Durée limitée optionnelle
- ✅ Protection réentrance
- ✅ Rounds multiples avec historique
- ✅ **Système d'aléatoire amélioré avec seed externe**
- ✅ Frontend React avec sélecteur de wallets

---

## 🏗️ Architecture

```
blocklucky-public-projet/
├── contracts/
│   └── BlockLucky.sol          # Smart contract principal
├── scripts/
│   ├── deploy.js               # Script de déploiement
│   ├── interact.js             # Script d'interaction
│   └── status.js               # Script de consultation
├── test/
│   └── BlockLucky.test.js      # Tests unitaires complets
├── hardhat.config.js           # Configuration Hardhat
├── package.json                # Dépendances du projet
└── README.md                   # Documentation
```

### 📦 Smart Contract

Le contrat `BlockLucky.sol` contient :

- **Variables d'état** : Prix du ticket, joueurs, configuration
- **Fonctions publiques** : `buyTicket()`, `drawWinner()`, `canDrawWinner()`
- **Fonctions de gestion** : `stopLottery()`, `updateTicketPrice()`, etc.
- **Fonctions de consultation** : `getPlayersCount()`, `getPrizePool()`, etc.
- **Événements** : `TicketPurchased`, `WinnerDrawn`, `NewRoundStarted`

---

## 🚀 Installation

### Prérequis

- Node.js >= 18.x
- npm ou yarn

### Installation

```bash
npm install
npm run compile
```

---

## 💻 Utilisation

### 1. Démarrer un nœud local

npm run node
```

### 2. Déployer (nouveau terminal)

```bash
npm run deploy:local
```

### 3. Interagir

```bash
# Voir le statut
npm run status

# Simulation complète
npm run interact

# Console interactive
npx hardhat console --network localhost
```

Exemple console :

```javascript
const BlockLucky = await ethers.getContractFactory("BlockLucky");
const data = require("./deployed-contract.json");
const lottery = BlockLucky.attach(data.address);

const [owner, player] = await ethers.getSigners();
const price = await lottery.ticketPrice();
await lottery.connect(player).buyTicket(1, { value: price });

console.log("Joueurs:", (await lottery.getPlayersCount()).toString());
```

### 4. Lancer le Frontend (optionnel)

```bash
cd frontend
npm install
npm run setup  # Configure l'adresse du contrat automatiquement
npm run dev    # Ouvre http://localhost:3000
```

Interface React avec :
- Connexion MetaMask
- Stats en temps réel
- Achat de tickets
- Liste des participants
- Historique

---

## 🧪 Tests

```bash
npm test
npx hardhat coverage
```

31 tests couvrant toutes les fonctionnalités.

---

## 🔐 Sécurité

### Mesures de sécurité implémentées

1. **Protection contre la réentrance** : Modifier `locked` avant les transferts
2. **Vérifications strictes** : `require()` sur tous les paramètres critiques
3. **Transferts sécurisés** : Utilisation de `.call{value}()` au lieu de `.transfer()`
4. **Limitations configurables** : Nombre de tickets par joueur
5. **Accès restreint** : Modificateur `onlyOwner` pour les fonctions sensibles
6. **Rejet des envois directs** : Fonctions `receive()` et `fallback()` protégées

### ⚠️ Limitations connues

**Génération de nombre aléatoire** : La fonction `_generateRandomNumber()` utilise `block.timestamp` et `block.prevrandao`, ce qui n'est **PAS sécurisé pour la production**.

**Pour la production**, utilisez :
- [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction) (Verifiable Random Function)
- Un oracle décentralisé
- Un système de commit-reveal

### Audit de sécurité

⚠️ **Ce contrat n'a pas été audité professionnellement.**

Pour une utilisation en production :
1. Faire auditer le code par des experts en sécurité blockchain
2. Implémenter Chainlink VRF pour l'aléatoire
3. Ajouter des tests de stress et de fuzzing
4. Mettre en place un programme de bug bounty

---

## 🎮 Exemples d'utilisation

### Scénario 1 : Loterie simple

```javascript
// Configuration
- Prix du ticket : 0.01 ETH
- Joueurs minimum : 3
- Pas de limite de temps
- Commission : 5%

// Déroulement
1. Player1 achète 1 ticket (0.01 ETH)
2. Player2 achète 2 tickets (0.02 ETH)
3. Player3 achète 1 ticket (0.01 ETH)
4. → Tirage automatique!
5. Un gagnant est tiré parmi les 4 tickets
6. Le gagnant reçoit 0.038 ETH (95% de 0.04 ETH)
7. L'organisateur reçoit 0.002 ETH (5%)
```

### Scénario 2 : Loterie avec limite de temps

```javascript
// Configuration
- Prix du ticket : 0.01 ETH
- Durée : 1 heure
- Joueurs minimum : 2
- Tickets max/joueur : 3

// Déroulement
1. Plusieurs joueurs achètent des tickets pendant 1h
2. Après 1h, plus d'achat possible
3. Le propriétaire appelle drawWinner()
4. Distribution des gains
## � Sécurité

### Mesures implémentées

- Protection contre la réentrance
- Vérifications strictes avec `require()`
- Transferts sécurisés avec `.call{value}()`
- Accès restreint avec `onlyOwner`

### ⚠️ Avertissement

La génération de nombre aléatoire utilise `block.timestamp` et `block.prevrandao`. 

**Pour la production**, utilisez [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction).

---

## 📄 Licence

MIT License - voir le fichier `LICENSE`.

---

**Bon développement ! 🚀**
