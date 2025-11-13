const hre = require("hardhat");
const fs = require('fs');

async function main() {
    // Charger l'adresse du contrat déployé
    const deployedData = JSON.parse(fs.readFileSync('deployed-contract.json', 'utf8'));
    const contractAddress = deployedData.address;

    console.log("🎲 Tirage au sort avec seed externe\n");

    // Se connecter au contrat
    const BlockLucky = await hre.ethers.getContractFactory("BlockLucky");
    const blockLucky = BlockLucky.attach(contractAddress);

    const [owner] = await hre.ethers.getSigners();

    console.log("📍 Adresse du contrat:", contractAddress);
    console.log("👤 Appelant:", owner.address);
    console.log();

    // Vérifier l'état actuel
    const playersCount = await blockLucky.getPlayersCount();
    const canDraw = await blockLucky.canDrawWinner();

    console.log("📊 État actuel:");
    console.log(`   - Participants: ${playersCount}`);
    console.log(`   - Tirage possible: ${canDraw ? '✅ Oui' : '❌ Non'}`);
    console.log();

    if (!canDraw) {
        console.log("⚠️  Le tirage n'est pas encore possible.");
        console.log("   Il faut au moins 3 participants.");
        return;
    }

    // Générer un seed aléatoire
    // En production, ce seed pourrait venir de :
    // - Une API externe (random.org, NIST Beacon)
    // - Un vote des participants
    // - Un événement du monde réel (résultat sportif, météo, etc.)
    const externalSeed = Math.floor(Math.random() * 1000000000);

    console.log("🎲 Seed externe généré:", externalSeed);
    console.log("   (En production, ce seed viendrait d'une source externe)");
    console.log();

    console.log("🚀 Lancement du tirage avec seed...");

    try {
        const tx = await blockLucky.drawWinnerWithSeed(externalSeed);
        console.log("⏳ Transaction envoyée:", tx.hash);

        const receipt = await tx.wait();
        console.log("✅ Transaction confirmée!");
        console.log();

        // Récupérer l'événement WinnerDrawn
        const winnerEvent = receipt.logs.find(
            log => log.fragment && log.fragment.name === 'WinnerDrawn'
        );

        if (winnerEvent) {
            const winner = winnerEvent.args[0];
            const amount = hre.ethers.formatEther(winnerEvent.args[1]);
            const round = winnerEvent.args[2];

            console.log("🎉 GAGNANT TIRÉ AU SORT !");
            console.log("================================================");
            console.log(`   🏆 Gagnant: ${winner}`);
            console.log(`   💰 Prix: ${amount} ETH`);
            console.log(`   🔢 Round: ${round}`);
            console.log("================================================");
        }

        console.log();
        console.log("🔄 Une nouvelle loterie a démarré automatiquement!");

    } catch (error) {
        console.error("❌ Erreur lors du tirage:");
        console.error(error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
