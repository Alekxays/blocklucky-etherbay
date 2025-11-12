#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const deployedPath = path.join(__dirname, '../deployed-contract.json');
const appPath = path.join(__dirname, 'src/App.jsx');

if (!fs.existsSync(deployedPath)) {
    console.log('❌ deployed-contract.json non trouvé. Déployez d\'abord le contrat.');
    process.exit(1);
}

const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
const contractAddress = deployed.address;

let appContent = fs.readFileSync(appPath, 'utf8');

const regex = /const CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}"/;
const replacement = `const CONTRACT_ADDRESS = "${contractAddress}"`;

if (regex.test(appContent)) {
    appContent = appContent.replace(regex, replacement);
} else {
    console.log('❌ Impossible de trouver CONTRACT_ADDRESS dans App.jsx');
    process.exit(1);
}

fs.writeFileSync(appPath, appContent);

console.log('✅ Adresse du contrat mise à jour:', contractAddress);
