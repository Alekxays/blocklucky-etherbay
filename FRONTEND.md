# 🚀 Démarrage rapide - Frontend BlockLucky

## Vue d'ensemble

Tu as maintenant un **frontend React complet** qui se connecte au smart contract.

## Architecture

```
frontend/
├── src/
│   ├── App.jsx              # 🧠 Toute la logique (ne touche pas)
│   ├── main.jsx             # Entry point React
│   ├── index.css            # 🎨 TON TERRAIN DE JEU
│   ├── contractABI.json     # Interface du contrat
│   ├── components-examples.js  # Composants bonus
│   └── CSS-GUIDE.md         # Guide pour ton pote
```

## Démarrage en 3 étapes

### 1️⃣ Terminal 1 - Blockchain locale
```bash
npm run node
```
Laisse tourner, ne ferme pas ce terminal.

### 2️⃣ Terminal 2 - Déployer le contrat
```bash
npm run deploy:local
```

### 3️⃣ Terminal 3 - Lancer le frontend
```bash
npm run start:frontend
```

Ou manuellement :
```bash
cd frontend
npm install
npm run setup    # Configure l'adresse automatiquement
npm run dev
```

Ouvre **http://localhost:3000** 🎉

## Ce qui est déjà fait ✅

### Fonctionnalités
- ✅ Connexion MetaMask
- ✅ Affichage stats temps réel (refresh auto toutes les 5s)
- ✅ Achat de tickets
- ✅ Liste des participants avec leur nombre de tickets
- ✅ Historique des gagnants
- ✅ Compteur de temps restant
- ✅ Indicateur "Mes tickets"
- ✅ Messages d'erreur
- ✅ États de loading
- ✅ Responsive mobile/tablet/desktop

### Design
- ✅ CSS de base avec theme dark
- ✅ Grille responsive pour les stats
- ✅ Cartes avec effet glass morphism
- ✅ Boutons avec hover effects
- ✅ Layout propre et organisé

## Ce que ton pote doit faire 🎨

**IL N'A QU'À MODIFIER `src/index.css`** - Tout le reste fonctionne !

### Idées d'amélioration

1. **Animations**
   - Transitions smooth sur les cartes
   - Fade-in au chargement
   - Bounce sur les boutons

2. **Couleurs**
   - Changer la palette (actuellement purple/blue)
   - Améliorer les contrastes
   - Ajouter des gradients

3. **Effets visuels**
   - Glow effects sur les hover
   - Particules en arrière-plan
   - Animations de chiffres qui montent

4. **Polish**
   - Meilleures fonts (Google Fonts)
   - Icônes au lieu d'emojis (react-icons)
   - Loading spinners custom
   - Micro-interactions

Voir **`CSS-GUIDE.md`** pour tous les détails !

## Configuration MetaMask

Pour tester localement :

1. Ouvrir MetaMask
2. Ajouter un réseau :
   - Nom : Hardhat Local
   - RPC URL : http://127.0.0.1:8545
   - Chain ID : 31337
   - Symbole : ETH

3. Importer un compte de test :
   - Copier une private key depuis le terminal Hardhat
   - MetaMask > Importer un compte

## Structure du code

### App.jsx

```javascript
// États principaux
- account : Adresse wallet connectée
- contract : Instance du contrat
- ticketPrice, playersCount, prizePool, etc. : Stats

// Fonctions principales
- connectWallet() : Connexion MetaMask
- loadLotteryData() : Charge toutes les données
- buyTickets() : Acheter des tickets

// Refresh automatique toutes les 5 secondes
useEffect(() => {
  const interval = setInterval(loadLotteryData, 5000)
  return () => clearInterval(interval)
}, [contract])
```

### Événements du contrat

Le frontend écoute les événements :
- `TicketPurchased` - Ticket acheté
- `WinnerDrawn` - Gagnant tiré
- `NewRoundStarted` - Nouveau round

## Tips de développement

### Hot Reload
Les changements CSS sont appliqués instantanément (HMR).

### Console du navigateur
Ouvre la console (F12) pour voir les logs et les erreurs.

### React DevTools
Installe l'extension Chrome/Firefox pour debugger React.

### Tester l'achat de tickets
1. Connecte MetaMask
2. Entre un nombre de tickets
3. Clique sur "Acheter"
4. Confirme dans MetaMask
5. Attends la transaction
6. Les stats se mettent à jour automatiquement

### Tester le tirage
Achète 3 tickets avec 3 comptes différents → Le tirage se déclenche automatiquement.

## Problèmes courants

### "Contract not deployed"
```bash
# Dans la racine du projet
npm run deploy:local
```

### "Cannot connect to MetaMask"
- Vérifie que MetaMask est installé
- Vérifie le réseau (localhost 8545, chain 31337)
- Recharge la page

### "Insufficient funds"
- Importe un compte de test depuis Hardhat
- Chaque compte a 10000 ETH de test

### "Nonce too high"
- Réinitialise MetaMask (Settings > Advanced > Reset Account)
- Ou redémarre le nœud Hardhat

### Les données ne se mettent pas à jour
- Vérifie la console pour les erreurs
- Vérifie que le nœud Hardhat tourne
- Recharge la page

## Variables d'environnement (optionnel)

Tu peux créer un `.env` dans `frontend/` :
```
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=31337
```

Et l'utiliser dans `App.jsx` :
```javascript
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
```

## Build pour production

```bash
cd frontend
npm run build
```

Crée un dossier `dist/` prêt à déployer.

## Déploiement

Options :
- **Vercel** (recommandé pour React)
- **Netlify**
- **GitHub Pages**
- **IPFS** (vraiment décentralisé !)

Pour un vrai déploiement :
1. Déployer le contrat sur Sepolia ou Mainnet
2. Mettre à jour CONTRACT_ADDRESS
3. Build le frontend
4. Deploy sur Vercel/Netlify

## Ressources

- React : https://react.dev
- ethers.js : https://docs.ethers.org
- Vite : https://vitejs.dev
- MetaMask : https://docs.metamask.io

Amuse-toi bien ! 🚀
