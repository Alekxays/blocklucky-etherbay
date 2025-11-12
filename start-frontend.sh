#!/bin/bash

echo "🎰 BlockLucky - Démarrage complet"
echo ""

# Vérifier si le contrat est déployé
if [ ! -f "deployed-contract.json" ]; then
    echo "❌ Contrat non déployé"
    echo ""
    echo "Pour démarrer le projet complet:"
    echo "1. Terminal 1: npm run node"
    echo "2. Terminal 2: npm run deploy:local"
    echo "3. Terminal 3: npm run start:frontend"
    exit 1
fi

echo "✅ Contrat déployé détecté"
echo ""

# Aller dans frontend et lancer
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

echo "🔧 Configuration du contrat..."
npm run setup

echo ""
echo "🚀 Démarrage du frontend..."
echo "   Ouvrir http://localhost:3000"
echo ""

npm run dev
