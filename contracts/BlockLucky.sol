// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BlockLucky
 * @dev Contrat de loterie décentralisée
 */
contract BlockLucky {
    address public owner;
    uint256 public ticketPrice;
    uint256 public maxTicketsPerPlayer;
    uint256 public minPlayers;
    uint256 public organizerFee;
    uint256 public lotteryEndTime;
    bool public isActive;
    uint256 public roundNumber;
    bool private locked;

    address[] public players;
    mapping(address => uint256) public ticketsPerPlayer;
    mapping(uint256 => address) public winners;
    mapping(uint256 => uint256) public prizePools;

    event TicketPurchased(
        address indexed player,
        uint256 ticketCount,
        uint256 amount
    );
    event WinnerDrawn(address indexed winner, uint256 amount, uint256 round);
    event FeeWithdrawn(address indexed owner, uint256 amount);
    event NewRoundStarted(uint256 round, uint256 ticketPrice, uint256 endTime);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Seul le proprietaire peut executer cette fonction"
        );
        _;
    }

    modifier lotteryIsActive() {
        require(isActive, "La loterie n'est pas active");
        _;
    }

    modifier noReentrant() {
        require(!locked, "Operation en cours");
        locked = true;
        _;
        locked = false;
    }

    constructor(
        uint256 _ticketPrice,
        uint256 _minPlayers,
        uint256 _maxTicketsPerPlayer,
        uint256 _organizerFee,
        uint256 _durationInMinutes
    ) {
        require(_ticketPrice > 0, "Le prix du ticket doit etre superieur a 0");
        require(_minPlayers >= 2, "Il faut au moins 2 joueurs");
        require(_organizerFee <= 20, "La commission ne peut pas depasser 20%");

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
        locked = false;

        emit NewRoundStarted(roundNumber, ticketPrice, lotteryEndTime);
    }

    function buyTicket(
        uint256 _numberOfTickets
    ) external payable lotteryIsActive {
        require(_numberOfTickets > 0, "Vous devez acheter au moins 1 ticket");
        require(
            msg.value == ticketPrice * _numberOfTickets,
            "Montant incorrect envoye"
        );

        if (lotteryEndTime > 0) {
            require(
                block.timestamp < lotteryEndTime,
                "La loterie est terminee"
            );
        }

        if (maxTicketsPerPlayer > 0) {
            require(
                ticketsPerPlayer[msg.sender] + _numberOfTickets <=
                    maxTicketsPerPlayer,
                "Limite de tickets par joueur atteinte"
            );
        }

        for (uint256 i = 0; i < _numberOfTickets; i++) {
            players.push(msg.sender);
        }

        ticketsPerPlayer[msg.sender] += _numberOfTickets;
        emit TicketPurchased(msg.sender, _numberOfTickets, msg.value);

        if (canDrawWinner()) {
            _drawWinner();
        }
    }

    function canDrawWinner() public view returns (bool) {
        if (!isActive) return false;
        if (players.length < minPlayers) return false;

        if (lotteryEndTime > 0 && block.timestamp >= lotteryEndTime) {
            return true;
        }

        return players.length >= minPlayers;
    }

    function drawWinner() external onlyOwner lotteryIsActive {
        require(
            canDrawWinner(),
            "Les conditions de tirage ne sont pas remplies"
        );
        _drawWinner();
    }

    function _drawWinner() private noReentrant {
        require(players.length > 0, "Aucun participant");

        uint256 totalPot = address(this).balance;
        uint256 feeAmount = (totalPot * organizerFee) / 100;
        uint256 prizeAmount = totalPot - feeAmount;

        uint256 randomIndex = _generateRandomNumber() % players.length;
        address winner = players[randomIndex];

        winners[roundNumber] = winner;
        prizePools[roundNumber] = prizeAmount;

        (bool successWinner, ) = payable(winner).call{value: prizeAmount}("");
        require(successWinner, "Echec du transfert au gagnant");

        if (feeAmount > 0) {
            (bool successOwner, ) = payable(owner).call{value: feeAmount}("");
            require(successOwner, "Echec du transfert de la commission");
        }

        emit WinnerDrawn(winner, prizeAmount, roundNumber);
        _resetLottery();
    }

    function _generateRandomNumber() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        players.length,
                        msg.sender
                    )
                )
            );
    }

    function _resetLottery() private {
        for (uint256 i = 0; i < players.length; i++) {
            ticketsPerPlayer[players[i]] = 0;
        }

        delete players;
        roundNumber++;

        if (lotteryEndTime > 0) {
            uint256 duration = lotteryEndTime - (block.timestamp - 1);
            lotteryEndTime = block.timestamp + duration;
        }

        emit NewRoundStarted(roundNumber, ticketPrice, lotteryEndTime);
    }

    function stopLottery() external onlyOwner {
        isActive = false;
    }

    function restartLottery() external onlyOwner {
        require(!isActive, "La loterie est deja active");
        isActive = true;

        if (lotteryEndTime > 0) {
            lotteryEndTime = block.timestamp + 1 hours;
        }

        emit NewRoundStarted(roundNumber, ticketPrice, lotteryEndTime);
    }

    function updateTicketPrice(uint256 _newPrice) external onlyOwner {
        require(
            players.length == 0,
            "Impossible de changer le prix pendant un round actif"
        );
        require(_newPrice > 0, "Le prix doit etre superieur a 0");
        ticketPrice = _newPrice;
    }

    /**
     * @notice Transfère la propriété du contrat
     * @param _newOwner Nouvelle adresse du propriétaire
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Adresse invalide");
        owner = _newOwner;
    }

    function getPlayersCount() external view returns (uint256) {
        return players.length;
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }

    function getTicketCount(address _player) external view returns (uint256) {
        return ticketsPerPlayer[_player];
    }

    function getWinner(uint256 _round) external view returns (address) {
        return winners[_round];
    }

    function getPrizePoolHistory(
        uint256 _round
    ) external view returns (uint256) {
        return prizePools[_round];
    }

    function getTimeRemaining() external view returns (uint256) {
        if (lotteryEndTime == 0) return 0;
        if (block.timestamp >= lotteryEndTime) return 0;
        return lotteryEndTime - block.timestamp;
    }

    receive() external payable {
        revert("Utilisez buyTicket() pour participer");
    }

    fallback() external payable {
        revert("Fonction inexistante");
    }
}
