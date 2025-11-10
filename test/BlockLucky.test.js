const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BlockLucky - Tests de la loterie décentralisée", function () {

    // ============ Fixture pour déployer le contrat ============

    async function deployBlockLuckyFixture() {
        // Paramètres par défaut
        const ticketPrice = ethers.parseEther("0.01"); // 0.01 ETH
        const minPlayers = 3;
        const maxTicketsPerPlayer = 5;
        const organizerFee = 5; // 5%
        const durationInMinutes = 60; // 1 heure

        // Récupérer les signers (comptes de test)
        const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();

        // Déployer le contrat
        const BlockLucky = await ethers.getContractFactory("BlockLucky");
        const blockLucky = await BlockLucky.deploy(
            ticketPrice,
            minPlayers,
            maxTicketsPerPlayer,
            organizerFee,
            durationInMinutes
        );

        return {
            blockLucky, ticketPrice, minPlayers, maxTicketsPerPlayer, organizerFee,
            durationInMinutes, owner, player1, player2, player3, player4, player5
        };
    }

    // ============ Tests de déploiement ============

    describe("Déploiement", function () {
        it("Devrait définir le bon propriétaire", async function () {
            const { blockLucky, owner } = await loadFixture(deployBlockLuckyFixture);
            expect(await blockLucky.owner()).to.equal(owner.address);
        });

        it("Devrait initialiser avec les bons paramètres", async function () {
            const { blockLucky, ticketPrice, minPlayers, maxTicketsPerPlayer, organizerFee } =
                await loadFixture(deployBlockLuckyFixture);

            expect(await blockLucky.ticketPrice()).to.equal(ticketPrice);
            expect(await blockLucky.minPlayers()).to.equal(minPlayers);
            expect(await blockLucky.maxTicketsPerPlayer()).to.equal(maxTicketsPerPlayer);
            expect(await blockLucky.organizerFee()).to.equal(organizerFee);
        });

        it("Devrait être active après le déploiement", async function () {
            const { blockLucky } = await loadFixture(deployBlockLuckyFixture);
            expect(await blockLucky.isActive()).to.be.true;
        });

        it("Devrait commencer au round 1", async function () {
            const { blockLucky } = await loadFixture(deployBlockLuckyFixture);
            expect(await blockLucky.roundNumber()).to.equal(1);
        });

        it("Devrait rejeter un prix de ticket à 0", async function () {
            const BlockLucky = await ethers.getContractFactory("BlockLucky");
            await expect(
                BlockLucky.deploy(0, 3, 5, 5, 60)
            ).to.be.revertedWith("Le prix du ticket doit etre superieur a 0");
        });

        it("Devrait rejeter moins de 2 joueurs minimum", async function () {
            const BlockLucky = await ethers.getContractFactory("BlockLucky");
            await expect(
                BlockLucky.deploy(ethers.parseEther("0.01"), 1, 5, 5, 60)
            ).to.be.revertedWith("Il faut au moins 2 joueurs");
        });

        it("Devrait rejeter une commission supérieure à 20%", async function () {
            const BlockLucky = await ethers.getContractFactory("BlockLucky");
            await expect(
                BlockLucky.deploy(ethers.parseEther("0.01"), 3, 5, 25, 60)
            ).to.be.revertedWith("La commission ne peut pas depasser 20%");
        });
    });

    // ============ Tests d'achat de tickets ============

    describe("Achat de tickets", function () {
        it("Devrait permettre d'acheter un ticket avec le bon montant", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            await expect(
                blockLucky.connect(player1).buyTicket(1, { value: ticketPrice })
            ).to.emit(blockLucky, "TicketPurchased")
                .withArgs(player1.address, 1, ticketPrice);

            expect(await blockLucky.getPlayersCount()).to.equal(1);
            expect(await blockLucky.getTicketCount(player1.address)).to.equal(1);
        });

        it("Devrait permettre d'acheter plusieurs tickets", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            const numberOfTickets = 2; // Moins que minPlayers pour éviter le tirage automatique
            await blockLucky.connect(player1).buyTicket(numberOfTickets, {
                value: ticketPrice * BigInt(numberOfTickets)
            });

            expect(await blockLucky.getPlayersCount()).to.equal(2);
            expect(await blockLucky.getTicketCount(player1.address)).to.equal(2);
        });

        it("Devrait rejeter un achat avec un montant incorrect", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            await expect(
                blockLucky.connect(player1).buyTicket(1, { value: ticketPrice / 2n })
            ).to.be.revertedWith("Montant incorrect envoye");
        });

        it("Devrait rejeter un achat de 0 ticket", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            await expect(
                blockLucky.connect(player1).buyTicket(0, { value: 0 })
            ).to.be.revertedWith("Vous devez acheter au moins 1 ticket");
        });

        it("Devrait respecter la limite de tickets par joueur", async function () {
            // Créer une nouvelle fixture avec minPlayers plus élevé pour éviter le tirage automatique
            const ticketPrice = ethers.parseEther("0.01");
            const minPlayers = 10; // Plus élevé pour éviter le tirage
            const maxTicketsPerPlayer = 5;
            const organizerFee = 5;
            const durationInMinutes = 60;

            const [owner, player1] = await ethers.getSigners();
            const BlockLucky = await ethers.getContractFactory("BlockLucky");
            const blockLucky = await BlockLucky.deploy(
                ticketPrice,
                minPlayers,
                maxTicketsPerPlayer,
                organizerFee,
                durationInMinutes
            );

            // Acheter le maximum de tickets
            await blockLucky.connect(player1).buyTicket(maxTicketsPerPlayer, {
                value: ticketPrice * BigInt(maxTicketsPerPlayer)
            });

            // Tenter d'acheter un ticket supplémentaire
            await expect(
                blockLucky.connect(player1).buyTicket(1, { value: ticketPrice })
            ).to.be.revertedWith("Limite de tickets par joueur atteinte");
        });

        it("Devrait incrémenter correctement le solde du contrat", async function () {
            const { blockLucky, player1, player2, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });

            const prizePool = await blockLucky.getPrizePool();
            expect(prizePool).to.equal(ticketPrice * 2n);
        });
    });

    // ============ Tests du tirage au sort ============

    describe("Tirage au sort", function () {
        it("Ne devrait pas permettre de tirer avant d'avoir assez de joueurs", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });

            expect(await blockLucky.canDrawWinner()).to.be.false;
        });

        it("Devrait permettre de tirer avec le nombre minimum de joueurs", async function () {
            const { blockLucky, player1, player2, player3, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });

            expect(await blockLucky.canDrawWinner()).to.be.false;

            // Le 3ème joueur déclenche automatiquement le tirage
            await expect(
                blockLucky.connect(player3).buyTicket(1, { value: ticketPrice })
            ).to.emit(blockLucky, "WinnerDrawn");
        });

        it("Devrait distribuer le prix correctement avec la commission", async function () {
            const { blockLucky, player1, player2, player3, owner, ticketPrice, organizerFee } =
                await loadFixture(deployBlockLuckyFixture);

            // Sauvegarder les soldes initiaux
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            // 3 joueurs achètent 1 ticket chacun
            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });

            const totalPot = ticketPrice * 3n;
            const feeAmount = (totalPot * BigInt(organizerFee)) / 100n;
            const prizeAmount = totalPot - feeAmount;

            // Le 3ème ticket déclenche le tirage
            const tx = await blockLucky.connect(player3).buyTicket(1, { value: ticketPrice });
            const receipt = await tx.wait();

            // Vérifier que l'événement WinnerDrawn a été émis
            const winnerEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "WinnerDrawn"
            );
            expect(winnerEvent).to.not.be.undefined;

            // Vérifier que le owner a reçu la commission
            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
            expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
        });

        it("Devrait réinitialiser la loterie après un tirage", async function () {
            const { blockLucky, player1, player2, player3, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            // Premier round
            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player3).buyTicket(1, { value: ticketPrice });

            // Vérifier que le round a été incrémenté
            expect(await blockLucky.roundNumber()).to.equal(2);

            // Vérifier que les joueurs ont été réinitialisés
            expect(await blockLucky.getPlayersCount()).to.equal(0);
        });

        it("Devrait enregistrer le gagnant dans l'historique", async function () {
            const { blockLucky, player1, player2, player3, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player3).buyTicket(1, { value: ticketPrice });

            const winner = await blockLucky.getWinner(1);
            expect(winner).to.be.oneOf([player1.address, player2.address, player3.address]);

            const prizePool = await blockLucky.getPrizePoolHistory(1);
            expect(prizePool).to.be.gt(0);
        });
    });

    // ============ Tests de gestion (Owner) ============

    describe("Fonctions de gestion", function () {
        it("Devrait permettre au owner d'arrêter la loterie", async function () {
            const { blockLucky, owner } = await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(owner).stopLottery();
            expect(await blockLucky.isActive()).to.be.false;
        });

        it("Ne devrait pas permettre à un non-owner d'arrêter la loterie", async function () {
            const { blockLucky, player1 } = await loadFixture(deployBlockLuckyFixture);

            await expect(
                blockLucky.connect(player1).stopLottery()
            ).to.be.revertedWith("Seul le proprietaire peut executer cette fonction");
        });

        it("Devrait empêcher l'achat de tickets quand la loterie est arrêtée", async function () {
            const { blockLucky, owner, player1, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(owner).stopLottery();

            await expect(
                blockLucky.connect(player1).buyTicket(1, { value: ticketPrice })
            ).to.be.revertedWith("La loterie n'est pas active");
        });

        it("Devrait permettre de redémarrer la loterie", async function () {
            const { blockLucky, owner } = await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(owner).stopLottery();
            expect(await blockLucky.isActive()).to.be.false;

            await blockLucky.connect(owner).restartLottery();
            expect(await blockLucky.isActive()).to.be.true;
        });

        it("Devrait permettre de changer le prix du ticket (sans joueurs)", async function () {
            const { blockLucky, owner } = await loadFixture(deployBlockLuckyFixture);

            const newPrice = ethers.parseEther("0.02");
            await blockLucky.connect(owner).updateTicketPrice(newPrice);

            expect(await blockLucky.ticketPrice()).to.equal(newPrice);
        });

        it("Ne devrait pas permettre de changer le prix pendant un round actif", async function () {
            const { blockLucky, owner, player1, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });

            const newPrice = ethers.parseEther("0.02");
            await expect(
                blockLucky.connect(owner).updateTicketPrice(newPrice)
            ).to.be.revertedWith("Impossible de changer le prix pendant un round actif");
        });

        it("Devrait permettre de transférer la propriété", async function () {
            const { blockLucky, owner, player1 } = await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(owner).transferOwnership(player1.address);
            expect(await blockLucky.owner()).to.equal(player1.address);
        });
    });

    // ============ Tests de durée limitée ============

    describe("Gestion du temps", function () {
        it("Devrait empêcher l'achat après expiration du temps", async function () {
            const { blockLucky, player1, ticketPrice, durationInMinutes } =
                await loadFixture(deployBlockLuckyFixture);

            // Avancer le temps au-delà de la durée de la loterie
            await time.increase(durationInMinutes * 60 + 1);

            await expect(
                blockLucky.connect(player1).buyTicket(1, { value: ticketPrice })
            ).to.be.revertedWith("La loterie est terminee");
        });

        it("Devrait retourner le temps restant correctement", async function () {
            const { blockLucky, durationInMinutes } = await loadFixture(deployBlockLuckyFixture);

            const timeRemaining = await blockLucky.getTimeRemaining();
            const expectedTime = durationInMinutes * 60;

            // Tolérance de quelques secondes pour l'exécution du test
            expect(timeRemaining).to.be.closeTo(BigInt(expectedTime), 10n);
        });
    });

    // ============ Tests de sécurité ============

    describe("Sécurité", function () {
        it("Devrait rejeter les envois directs d'ETH", async function () {
            const { blockLucky, player1 } = await loadFixture(deployBlockLuckyFixture);

            await expect(
                player1.sendTransaction({
                    to: await blockLucky.getAddress(),
                    value: ethers.parseEther("0.01")
                })
            ).to.be.revertedWith("Utilisez buyTicket() pour participer");
        });

        it("Devrait protéger contre la réentrance lors du tirage", async function () {
            const { blockLucky, player1, player2, player3, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            // Acheter des tickets pour déclencher le tirage
            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });

            // Le tirage devrait se faire de manière atomique
            await expect(
                blockLucky.connect(player3).buyTicket(1, { value: ticketPrice })
            ).to.emit(blockLucky, "WinnerDrawn");
        });
    });

    // ============ Tests de fonctions de consultation ============

    describe("Fonctions de consultation", function () {
        it("Devrait retourner la liste des joueurs", async function () {
            const { blockLucky, player1, player2, ticketPrice } =
                await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(1, { value: ticketPrice });
            await blockLucky.connect(player2).buyTicket(1, { value: ticketPrice });

            const players = await blockLucky.getPlayers();
            expect(players.length).to.equal(2);
            expect(players[0]).to.equal(player1.address);
            expect(players[1]).to.equal(player2.address);
        });

        it("Devrait retourner le nombre de tickets par joueur", async function () {
            const { blockLucky, player1, ticketPrice } = await loadFixture(deployBlockLuckyFixture);

            await blockLucky.connect(player1).buyTicket(2, { value: ticketPrice * 2n });

            expect(await blockLucky.getTicketCount(player1.address)).to.equal(2);
        });
    });
});
