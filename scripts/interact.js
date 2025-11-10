const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🎲 Interaction avec BlockLucky\n");

    // Charger l'adresse du contrat déployé
    if (!fs.existsSync("deployed-contract.json")) {
        console.error("❌ Fichier deployed-contract.json non trouvé!");
        console.error("   Déployez d'abord le contrat avec: npm run deploy:local");
        process.exit(1);
    }

    const contractData = JSON.parse(fs.readFileSync("deployed-contract.json", "utf8"));
    const contractAddress = contractData.address;

    console.log("📍 Adresse du contrat:", contractAddress);

    // Récupérer le contrat
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = BlockLucky.attach(contractAddress);

    // Récupérer les comptes
    const [owner, player1, player2, player3, player4] = await ethers.getSigners();

    console.log("\n👥 Comptes disponibles:");
    console.log("   Owner:", owner.address);
    console.log("   Player 1:", player1.address);
    console.log("   Player 2:", player2.address);
    console.log("   Player 3:", player3.address);
    console.log("   Player 4:", player4.address);

    // Afficher l'état actuel
    console.log("\n" + "=".repeat(60));
    console.log("📊 État actuel de la loterie");
    console.log("=".repeat(60));

    const isActive = await blockLucky.isActive();
    const roundNumber = await blockLucky.roundNumber();
    const ticketPrice = await blockLucky.ticketPrice();
    const playersCount = await blockLucky.getPlayersCount();
    const prizePool = await blockLucky.getPrizePool();
    const minPlayers = await blockLucky.minPlayers();
    const canDraw = await blockLucky.canDrawWinner();
    const timeRemaining = await blockLucky.getTimeRemaining();

    console.log("Statut:", isActive ? "✅ Actif" : "❌ Inactif");
    console.log("Round:", roundNumber.toString());
    console.log("Prix du ticket:", ethers.formatEther(ticketPrice), "ETH");
    console.log("Joueurs actuels:", playersCount.toString(), "/", minPlayers.toString());
    console.log("Cagnotte:", ethers.formatEther(prizePool), "ETH");
    console.log("Tirage possible:", canDraw ? "✅ Oui" : "❌ Non");

    if (timeRemaining > 0) {
        const hours = Math.floor(Number(timeRemaining) / 3600);
        const minutes = Math.floor((Number(timeRemaining) % 3600) / 60);
        const seconds = Number(timeRemaining) % 60;
        console.log("Temps restant:", `${hours}h ${minutes}m ${seconds}s`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎫 Simulation d'achat de tickets");
    console.log("=".repeat(60));

    // Player 1 achète 2 tickets
    console.log("\n🎯 Player 1 achète 2 tickets...");
    const tx1 = await blockLucky.connect(player1).buyTicket(2, {
        value: ticketPrice * 2n
    });
    await tx1.wait();
    console.log("   ✅ Tickets achetés!");
    console.log("   Nombre de tickets de Player 1:", (await blockLucky.getTicketCount(player1.address)).toString());

    // Player 2 achète 1 ticket
    console.log("\n🎯 Player 2 achète 1 ticket...");
    const tx2 = await blockLucky.connect(player2).buyTicket(1, {
        value: ticketPrice
    });
    await tx2.wait();
    console.log("   ✅ Ticket acheté!");

    // Afficher l'état mis à jour
    const newPlayersCount = await blockLucky.getPlayersCount();
    const newPrizePool = await blockLucky.getPrizePool();
    const newCanDraw = await blockLucky.canDrawWinner();

    console.log("\n📊 État après les achats:");
    console.log("   Joueurs:", newPlayersCount.toString(), "/", minPlayers.toString());
    console.log("   Cagnotte:", ethers.formatEther(newPrizePool), "ETH");
    console.log("   Tirage possible:", newCanDraw ? "✅ Oui" : "❌ Non");

    // Player 3 achète 1 ticket (devrait déclencher le tirage si minPlayers = 3)
    if (newPlayersCount < minPlayers) {
        console.log("\n🎯 Player 3 achète 1 ticket (devrait déclencher le tirage)...");
        const tx3 = await blockLucky.connect(player3).buyTicket(1, {
            value: ticketPrice
        });
        const receipt = await tx3.wait();

        // Chercher l'événement WinnerDrawn
        const winnerEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === "WinnerDrawn"
        );

        if (winnerEvent) {
            console.log("   🎉 Un gagnant a été tiré!");
            console.log("   🏆 Gagnant:", winnerEvent.args[0]);
            console.log("   💰 Gain:", ethers.formatEther(winnerEvent.args[1]), "ETH");
            console.log("   🎲 Round:", winnerEvent.args[2].toString());
        }
    }

    // Afficher l'état final
    console.log("\n" + "=".repeat(60));
    console.log("📊 État final");
    console.log("=".repeat(60));

    const finalRound = await blockLucky.roundNumber();
    const finalPlayersCount = await blockLucky.getPlayersCount();
    const finalPrizePool = await blockLucky.getPrizePool();

    console.log("Round actuel:", finalRound.toString());
    console.log("Joueurs:", finalPlayersCount.toString());
    console.log("Cagnotte:", ethers.formatEther(finalPrizePool), "ETH");

    // Afficher l'historique des gagnants
    console.log("\n🏆 Historique des gagnants:");
    for (let i = 1; i < finalRound; i++) {
        const winner = await blockLucky.getWinner(i);
        const prize = await blockLucky.getPrizePoolHistory(i);
        if (winner !== ethers.ZeroAddress) {
            console.log(`   Round ${i}: ${winner} - ${ethers.formatEther(prize)} ETH`);
        }
    }

    console.log("\n✅ Interaction terminée!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Erreur:", error);
        process.exit(1);
    });
