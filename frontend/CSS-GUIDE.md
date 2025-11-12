# Notes pour le CSS Designer 🎨

## Structure actuelle

Le projet utilise **un seul fichier CSS** pour simplifier : `src/index.css`

Toute la logique est dans `src/App.jsx` - tu n'as pas besoin de toucher au JavaScript, juste le CSS.

## Classes principales à personnaliser

### Layout
- `.app` - Container principal
- `.header` - En-tête avec titre
- `.wallet-section` - Section connexion wallet

### Stats
- `.stats-grid` - Grille des statistiques (grid 6 colonnes responsive)
- `.stat-card` - Carte individuelle pour chaque stat
- `.stat-card .value` - Valeur affichée (gros chiffre)

### Interactions
- `.ticket-section` - Section achat de tickets
- `.input-group` - Groupe input + bouton
- `.btn` - Bouton générique
- `.btn-primary` - Bouton principal (bleu)
- `.btn-success` - Bouton succès (vert)

### Listes
- `.players-section` - Section liste des joueurs
- `.players-list` - Liste ul
- `.player-item` - Item joueur (flex)
- `.player-address` - Adresse du joueur
- `.player-tickets` - Badge nombre de tickets

### Historique
- `.history-section` - Section historique
- `.history-item` - Item historique
- `.history-item .round` - Numéro du round
- `.history-item .winner` - Adresse gagnant
- `.history-item .prize` - Montant gagné

### Messages
- `.error-message` - Message d'erreur (rouge)
- `.loading` - État de chargement

## Palette de couleurs actuelle

```css
Background: #0a0e27 (dark blue)
Texte: #fff (white)
Primary: #667eea (purple/blue)
Success: #48bb78 (green)
Error: #f56565 (red)
```

## Suggestions d'amélioration

### 1. Animations
Ajoute des transitions smooth :
```css
.stat-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}
```

### 2. Glass morphism
Effet de verre moderne :
```css
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 3. Gradients
Plusieurs gradients sont déjà préparés dans `components-examples.js`

### 4. Animations d'apparition
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeIn 0.5s ease-out;
}
```

### 5. Effet Neon sur les boutons
```css
.btn-primary:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
}
```

### 6. Particules de fond
Tu peux utiliser particles.js ou CSS pur pour un effet de fond animé

### 7. Mode sombre/clair
Variables CSS pour faciliter le switch :
```css
:root {
  --bg-primary: #0a0e27;
  --bg-secondary: rgba(255, 255, 255, 0.05);
  --text-primary: #fff;
  --accent: #667eea;
}
```

## Breakpoints responsives

```css
/* Mobile */
@media (max-width: 768px) {
  /* Stats en colonne unique */
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Librairies CSS recommandées (optionnel)

- **Tailwind CSS** - Si tu veux refaire tout en utility-first
- **Framer Motion** - Pour des animations React avancées
- **styled-components** - CSS-in-JS
- **SASS/SCSS** - Pour des variables et mixins

## Icônes

Les emojis sont utilisés actuellement (🎰, 🏆, 🟢, etc.)

Tu peux les remplacer par :
- **React Icons** (`react-icons`)
- **Font Awesome**
- **Heroicons**
- **Lucide Icons**

## Fonts

Police actuelle : System font stack

Tu peux ajouter Google Fonts dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

Puis dans le CSS :
```css
body {
  font-family: 'Inter', sans-serif;
}
```

## Tips

1. Tous les composants ont des classes, pas besoin de modifier le JSX
2. Le CSS est déjà responsive, tu peux juste améliorer
3. Les couleurs et espacements sont cohérents, garde la même logique
4. Teste sur mobile, tablet et desktop
5. Les animations doivent être subtiles, pas trop agressives
6. Pense à l'accessibilité (contraste, taille des textes)

## Tester tes changements

```bash
cd frontend
npm run dev
```

Le HMR (Hot Module Replacement) recharge automatiquement à chaque changement CSS.

## Structure de fichiers suggérée (si tu veux split)

```
src/
├── styles/
│   ├── global.css        # Reset et variables
│   ├── components.css    # Composants
│   ├── layout.css        # Layout et grilles
│   ├── animations.css    # Keyframes et transitions
│   └── responsive.css    # Media queries
└── index.css            # Import tout
```

Bon design ! 🎨
