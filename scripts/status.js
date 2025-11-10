const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Script pour afficher l'état actuel du contrat BlockLucky
 */
async function main() {
    console.log("🔍 Statut de BlockLucky\n");

    // Charger l'adresse du contrat
    if (!fs.existsSync("deployed-contract.json")) {
        console.error("❌ Contrat non déployé. Utilisez: npm run deploy:local");
        process.exit(1);
    }

    const contractData = JSON.parse(fs.readFileSync("deployed-contract.json", "utf8"));
    const contractAddress = contractData.address;

    // Récupérer le contrat
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = BlockLucky.attach(contractAddress);

    console.log("📍 Adresse du contrat:", contractAddress);
    console.log("🌐 Réseau:", contractData.network);
    console.log("📅 Déployé le:", new Date(contractData.deploymentTime).toLocaleString());

    console.log("\n" + "=".repeat(70));
    console.log("⚙️  CONFIGURATION");
    console.log("=".repeat(70));

    const owner = await blockLucky.owner();
    const ticketPrice = await blockLucky.ticketPrice();
    const minPlayers = await blockLucky.minPlayers();
    const maxTicketsPerPlayer = await blockLucky.maxTicketsPerPlayer();
    const organizerFee = await blockLucky.organizerFee();

    console.log("Propriétaire:", owner);
    console.log("Prix du ticket:", ethers.formatEther(ticketPrice), "ETH");
    console.log("Joueurs minimum:", minPlayers.toString());
    console.log("Tickets max/joueur:", maxTicketsPerPlayer.toString() === "0" ? "Illimité" : maxTicketsPerPlayer.toString());
    console.log("Commission:", organizerFee.toString() + "%");

    console.log("\n" + "=".repeat(70));
    console.log("📊 ÉTAT ACTUEL");
    console.log("=".repeat(70));

    const isActive = await blockLucky.isActive();
    const roundNumber = await blockLucky.roundNumber();
    const playersCount = await blockLucky.getPlayersCount();
    const prizePool = await blockLucky.getPrizePool();
    const canDraw = await blockLucky.canDrawWinner();
    const timeRemaining = await blockLucky.getTimeRemaining();

    console.log("Statut:", isActive ? "🟢 Actif" : "🔴 Inactif");
    console.log("Round actuel:", roundNumber.toString());
    console.log("Participants:", playersCount.toString(), "/", minPlayers.toString());
    console.log("Cagnotte actuelle:", ethers.formatEther(prizePool), "ETH");
    console.log("Tirage possible:", canDraw ? "✅ Oui" : "❌ Non");

    if (timeRemaining > 0) {
        const hours = Math.floor(Number(timeRemaining) / 3600);
        const minutes = Math.floor((Number(timeRemaining) % 3600) / 60);
        const seconds = Number(timeRemaining) % 60;
        console.log("Temps restant:", `${hours}h ${minutes}m ${seconds}s`);
    } else {
        console.log("Temps restant:", "Pas de limite");
    }

    // Afficher la liste des joueurs si présents
    if (playersCount > 0) {
        console.log("\n" + "=".repeat(70));
        console.log("👥 PARTICIPANTS ACTUELS");
        console.log("=".repeat(70));

        const players = await blockLucky.getPlayers();
        const uniquePlayers = [...new Set(players)];

        for (const player of uniquePlayers) {
            const ticketCount = await blockLucky.getTicketCount(player);
            const percentage = (Number(ticketCount) / Number(playersCount) * 100).toFixed(2);
            console.log(`${player}: ${ticketCount} ticket(s) - ${percentage}% de chances`);
        }
    }

    // Afficher l'historique
    console.log("\n" + "=".repeat(70));
    console.log("🏆 HISTORIQUE DES GAGNANTS");
    console.log("=".repeat(70));

    let hasHistory = false;
    for (let i = 1; i < roundNumber; i++) {
        const winner = await blockLucky.getWinner(i);
        if (winner !== ethers.ZeroAddress) {
            const prize = await blockLucky.getPrizePoolHistory(i);
            console.log(`Round ${i}: ${winner}`);
            console.log(`          Gain: ${ethers.formatEther(prize)} ETH`);
            hasHistory = true;
        }
    }

    if (!hasHistory) {
        console.log("Aucun gagnant pour le moment.");
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n💡 Commandes utiles:");
    console.log("   - Acheter un ticket: node scripts/buyTicket.js");
    console.log("   - Interagir avec le contrat: node scripts/interact.js");
    console.log("   - Tirer un gagnant (owner): await blockLucky.drawWinner()");
    console.log("\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Erreur:", error);
        process.exit(1);
    });
