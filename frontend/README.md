# BlockLucky Frontend

Interface React pour la loterie BlockLucky.

## Installation

```bash
cd frontend
npm install
```

## Configuration

1. Démarrer le nœud Hardhat local (dans le dossier racine):
```bash
npm run node
```

2. Déployer le contrat (dans le dossier racine):
```bash
npm run deploy:local
```

3. Copier l'adresse du contrat depuis `deployed-contract.json` et la mettre dans `src/App.jsx` à la ligne :
```javascript
const CONTRACT_ADDRESS = "VOTRE_ADRESSE_ICI"
```

## Lancement

```bash
npm run dev
```

Ouvrir http://localhost:3000

## Fonctionnalités

- ✅ Connexion MetaMask
- ✅ Affichage des stats en temps réel
- ✅ Achat de tickets
- ✅ Liste des participants
- ✅ Historique des gagnants
- ✅ Compteur de temps
- ✅ Indicateur de tirage possible

## À faire (CSS par ton pote)

Le CSS de base est dans `src/index.css`. Ton pote peut :

- Améliorer les couleurs et gradients
- Ajouter des animations
- Améliorer le responsive
- Ajouter des effets hover
- Personnaliser les cartes
- Ajouter des icônes
- Améliorer la typographie

## Structure

```
frontend/
├── src/
│   ├── App.jsx           # Composant principal avec toute la logique
│   ├── main.jsx          # Point d'entrée React
│   ├── index.css         # Styles de base
│   └── contractABI.json  # ABI du smart contract
├── index.html
├── package.json
└── vite.config.js
```

## Réseau

Par défaut, l'app se connecte au réseau Hardhat local (chainId: 31337).

Pour se connecter, MetaMask doit être configuré avec :
- Réseau : Localhost 8545
- Chain ID : 31337
- RPC : http://127.0.0.1:8545
