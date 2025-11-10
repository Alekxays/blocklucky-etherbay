const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🎰 Déploiement du contrat BlockLucky...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Déploiement avec le compte:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Solde du compte:", ethers.formatEther(balance), "ETH\n");

    const ticketPrice = ethers.parseEther("0.01");
    const minPlayers = 3;
    const maxTicketsPerPlayer = 5;
    const organizerFee = 5;
    const durationInMinutes = 60;

    console.log("⚙️  Paramètres de la loterie:");
    console.log("   - Prix du ticket:", ethers.formatEther(ticketPrice), "ETH");
    console.log("   - Nombre minimum de joueurs:", minPlayers);
    console.log("   - Tickets max par joueur:", maxTicketsPerPlayer === 0 ? "Illimité" : maxTicketsPerPlayer);
    console.log("   - Commission organisateur:", organizerFee + "%");
    console.log("   - Durée:", durationInMinutes === 0 ? "Pas de limite" : durationInMinutes + " minutes\n");

    console.log("🚀 Déploiement en cours...");

    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = await BlockLucky.deploy(
        ticketPrice,
        minPlayers,
        maxTicketsPerPlayer,
        organizerFee,
        durationInMinutes
    );

    await blockLucky.waitForDeployment();

    const contractAddress = await blockLucky.getAddress();

    console.log("✅ BlockLucky déployé à l'adresse:", contractAddress);
    console.log("\n" + "=".repeat(60));

    console.log("\n🔍 Vérification du contrat déployé:");

    const owner = await blockLucky.owner();
    const isActive = await blockLucky.isActive();
    const roundNumber = await blockLucky.roundNumber();
    const currentTicketPrice = await blockLucky.ticketPrice();

    console.log("   - Propriétaire:", owner);
    console.log("   - Statut:", isActive ? "✅ Actif" : "❌ Inactif");
    console.log("   - Round actuel:", roundNumber.toString());
    console.log("   - Prix du ticket:", ethers.formatEther(currentTicketPrice), "ETH");

    console.log("\n" + "=".repeat(60));

    // ============ Instructions pour interagir ============

    console.log("\n📋 Pour interagir avec le contrat:");
    console.log("   1. Acheter un ticket: await blockLucky.buyTicket(1, { value: ethers.parseEther('0.01') })");
    console.log("   2. Nombre de joueurs: await blockLucky.getPlayersCount()");
    console.log("   3. Voir la cagnotte: await blockLucky.getPrizePool()");
    console.log("   4. Tirage possible: await blockLucky.canDrawWinner()");

    console.log("\n" + "=".repeat(60));

    const fs = require("fs");
    const contractData = {
        address: contractAddress,
        network: hre.network.name,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        parameters: {
            ticketPrice: ticketPrice.toString(),
            minPlayers: minPlayers,
            maxTicketsPerPlayer: maxTicketsPerPlayer,
            organizerFee: organizerFee,
            durationInMinutes: durationInMinutes
        }
    };

    fs.writeFileSync(
        "deployed-contract.json",
        JSON.stringify(contractData, null, 2)
    );

    console.log("\n💾 Adresse sauvegardée dans deployed-contract.json");
    console.log("🎉 Déploiement terminé!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Erreur:", error);
        process.exit(1);
    });
