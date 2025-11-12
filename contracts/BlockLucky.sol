// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockLucky {
    address public owner;
    uint256 public immutable ticketPrice;
    uint256 public immutable maxTicketsPerPlayer;
    uint256 public immutable minPlayers;
    uint256 public immutable organizerFee;

    uint256 public lotteryEndTime;
    bool public isActive;
    uint256 public roundNumber;
    uint256 private randomSeed;

    address[] private players;
    mapping(address => uint256) public ticketsPerPlayer;
    mapping(uint256 => address) public winners;
    mapping(uint256 => uint256) public prizePools;

    event TicketPurchased(
        address indexed player,
        uint256 count,
        uint256 amount
    );
    event WinnerDrawn(address indexed winner, uint256 amount, uint256 round);
    event NewRoundStarted(uint256 round);

    error OnlyOwner();
    error LotteryInactive();
    error InvalidAmount();
    error DrawConditionsNotMet();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(
        uint256 _ticketPrice,
        uint256 _minPlayers,
        uint256 _maxTicketsPerPlayer,
        uint256 _organizerFee,
        uint256 _durationInMinutes
    ) {
        require(_ticketPrice > 0 && _minPlayers >= 2 && _organizerFee <= 20);

        owner = msg.sender;
        ticketPrice = _ticketPrice;
        minPlayers = _minPlayers;
        maxTicketsPerPlayer = _maxTicketsPerPlayer;
        organizerFee = _organizerFee;

        if (_durationInMinutes > 0) {
            lotteryEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        }

        isActive = true;
        roundNumber = 1;
        randomSeed = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );

        emit NewRoundStarted(1);
    }

    function buyTicket(uint256 count) external payable {
        if (!isActive) revert LotteryInactive();
        if (msg.value != ticketPrice * count) revert InvalidAmount();
        if (lotteryEndTime > 0 && block.timestamp >= lotteryEndTime)
            revert LotteryInactive();

        uint256 newTotal = ticketsPerPlayer[msg.sender] + count;
        if (maxTicketsPerPlayer > 0 && newTotal > maxTicketsPerPlayer)
            revert InvalidAmount();

        ticketsPerPlayer[msg.sender] = newTotal;

        // Optimisé: un seul push avec une boucle
        unchecked {
            for (uint256 i; i < count; ++i) {
                players.push(msg.sender);
            }
        }

        // Met à jour le seed
        randomSeed = uint256(
            keccak256(abi.encodePacked(randomSeed, msg.sender, block.timestamp))
        );

        emit TicketPurchased(msg.sender, count, msg.value);
    }

    function drawWinner(uint256 externalSeed) external onlyOwner {
        if (!canDrawWinner()) revert DrawConditionsNotMet();

        // Mixe le seed externe si fourni
        if (externalSeed > 0) {
            randomSeed = uint256(
                keccak256(abi.encodePacked(randomSeed, externalSeed))
            );
        }

        _executeDrawing();
    }

    function _executeDrawing() private {
        uint256 playerCount = players.length;

        // Génère un hash unique de la liste des joueurs
        randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    randomSeed,
                    block.timestamp,
                    block.prevrandao,
                    block.number,
                    players
                )
            )
        );

        // Sélection du gagnant
        uint256 winnerIndex = randomSeed % playerCount;
        address winner = players[winnerIndex];

        // Calcul des montants
        uint256 totalPot = address(this).balance;
        uint256 feeAmount = (totalPot * organizerFee) / 100;
        uint256 prizeAmount = totalPot - feeAmount;

        // Sauvegarde
        winners[roundNumber] = winner;
        prizePools[roundNumber] = prizeAmount;

        // Transferts
        (bool success, ) = payable(winner).call{value: prizeAmount}("");
        if (!success) revert TransferFailed();

        if (feeAmount > 0) {
            (success, ) = payable(owner).call{value: feeAmount}("");
            if (!success) revert TransferFailed();
        }

        emit WinnerDrawn(winner, prizeAmount, roundNumber);

        // Reset pour le prochain round
        _resetLottery();
    }

    function _resetLottery() private {
        uint256 playerCount = players.length;

        unchecked {
            for (uint256 i; i < playerCount; ++i) {
                delete ticketsPerPlayer[players[i]];
            }
        }

        delete players;
        ++roundNumber;

        if (lotteryEndTime > 0) {
            lotteryEndTime =
                block.timestamp +
                (lotteryEndTime - block.timestamp);
        }

        emit NewRoundStarted(roundNumber);
    }

    function canDrawWinner() public view returns (bool) {
        if (!isActive || players.length < minPlayers) return false;

        // On peut tirer si :
        // 1. Pas de limite de temps (lotteryEndTime == 0), OU
        // 2. Le temps est écoulé (block.timestamp >= lotteryEndTime)
        // Mais on peut aussi tirer avant si on a assez de joueurs !

        return true; // Si on a assez de joueurs et que c'est actif, on peut tirer
    }

    // Getters optimisés
    function getPlayersCount() external view returns (uint256) {
        return players.length;
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }

    function getTimeRemaining() external view returns (uint256) {
        if (lotteryEndTime == 0 || block.timestamp >= lotteryEndTime) return 0;
        unchecked {
            return lotteryEndTime - block.timestamp;
        }
    }

    function getWinner(uint256 round) external view returns (address) {
        return winners[round];
    }

    function getPrizePoolHistory(
        uint256 round
    ) external view returns (uint256) {
        return prizePools[round];
    }

    function getTicketCount(address player) external view returns (uint256) {
        return ticketsPerPlayer[player];
    }

    // Fonctions admin
    function stopLottery() external onlyOwner {
        isActive = false;
    }

    function restartLottery() external onlyOwner {
        require(!isActive);
        isActive = true;
        if (lotteryEndTime > 0) {
            lotteryEndTime = block.timestamp + 1 hours;
        }
        emit NewRoundStarted(roundNumber);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    receive() external payable {
        revert("Utilisez buyTicket()");
    }
}
