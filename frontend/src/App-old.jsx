import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import contractABI from './contractABI.json'

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

function App() {
    const [account, setAccount] = useState(null)
    const [provider, setProvider] = useState(null)
    const [contract, setContract] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showWalletModal, setShowWalletModal] = useState(false)

    // Stats de la loterie
    const [ticketPrice, setTicketPrice] = useState('0')
    const [playersCount, setPlayersCount] = useState(0)
    const [prizePool, setPrizePool] = useState('0')
    const [minPlayers, setMinPlayers] = useState(0)
    const [roundNumber, setRoundNumber] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [canDraw, setCanDraw] = useState(false)

    // Joueurs et historique
    const [players, setPlayers] = useState([])
    const [history, setHistory] = useState([])
    const [myTickets, setMyTickets] = useState(0)

    // Formulaire
    const [ticketAmount, setTicketAmount] = useState(1)

    useEffect(() => {
        checkWallet()
    }, [])

    useEffect(() => {
        if (contract && account) {
            loadLotteryData()
            const interval = setInterval(loadLotteryData, 5000)
            return () => clearInterval(interval)
        }
    }, [contract, account])

    async function checkWallet() {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            if (accounts.length > 0) {
                connectWallet()
            }
        }
    }

    async function connectWallet(walletType = 'metamask') {
        try {
            setLoading(true)
            setError(null)
            setShowWalletModal(false)

            let ethereum = null

            // Détection du wallet
            if (walletType === 'metamask') {
                if (typeof window.ethereum !== 'undefined') {
                    // Si plusieurs wallets, chercher MetaMask spécifiquement
                    if (window.ethereum.providers) {
                        ethereum = window.ethereum.providers.find(p => p.isMetaMask)
                    } else if (window.ethereum.isMetaMask) {
                        ethereum = window.ethereum
                    }
                }
                
                if (!ethereum) {
                    setError('MetaMask non détecté. Installez MetaMask ou essayez un autre wallet.')
                    setLoading(false)
                    return
                }
            } else if (walletType === 'coinbase') {
                if (window.ethereum?.isCoinbaseWallet) {
                    ethereum = window.ethereum
                } else {
                    setError('Coinbase Wallet non détecté. Installez Coinbase Wallet.')
                    setLoading(false)
                    return
                }
            } else if (walletType === 'injected') {
                // N'importe quel wallet injecté
                if (typeof window.ethereum !== 'undefined') {
                    ethereum = window.ethereum
                } else {
                    setError('Aucun wallet détecté. Installez MetaMask ou un autre wallet.')
                    setLoading(false)
                    return
                }
            }

            // Demander la connexion
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })

            // Vérifier le réseau
            const chainId = await ethereum.request({ method: 'eth_chainId' })
            if (chainId !== '0x7a69') { // 31337 en hexa
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x7a69' }],
                    })
                } catch (switchError) {
                    // Si le réseau n'existe pas, le créer
                    if (switchError.code === 4902) {
                        try {
                            await ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0x7a69',
                                    chainName: 'Hardhat Local',
                                    nativeCurrency: {
                                        name: 'Ethereum',
                                        symbol: 'ETH',
                                        decimals: 18
                                    },
                                    rpcUrls: ['http://127.0.0.1:8545'],
                                }],
                            })
                        } catch (addError) {
                            setError('Erreur lors de l\'ajout du réseau Hardhat')
                            setLoading(false)
                            return
                        }
                    } else {
                        setError('Veuillez passer au réseau Hardhat Local (Chain ID: 31337)')
                        setLoading(false)
                        return
                    }
                }
            }

            const provider = new ethers.BrowserProvider(ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)

            setAccount(accounts[0])
            setProvider(provider)
            setContract(contract)

            // Écouter les changements
            ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    window.location.reload() // Recharger pour réinitialiser l'état
                } else {
                    setAccount(null)
                    setContract(null)
                }
            })

            ethereum.on('chainChanged', () => {
                window.location.reload()
            })

            setLoading(false)
        } catch (err) {
            console.error(err)
            if (err.code === 4001) {
                setError('Connexion refusée par l\'utilisateur')
            } else {
                setError('Erreur de connexion au wallet: ' + err.message)
            }
            setLoading(false)
        }
    }
            })

            setLoading(false)
        } catch (err) {
            console.error(err)
            setError('Erreur de connexion au wallet')
            setLoading(false)
        }
    }

    async function loadLotteryData() {
        try {
            const [
                price,
                count,
                pool,
                min,
                round,
                active,
                time,
                draw,
                playersList
            ] = await Promise.all([
                contract.ticketPrice(),
                contract.getPlayersCount(),
                contract.getPrizePool(),
                contract.minPlayers(),
                contract.roundNumber(),
                contract.isActive(),
                contract.getTimeRemaining(),
                contract.canDrawWinner(),
                contract.getPlayers()
            ])

            setTicketPrice(ethers.formatEther(price))
            setPlayersCount(Number(count))
            setPrizePool(ethers.formatEther(pool))
            setMinPlayers(Number(min))
            setRoundNumber(Number(round))
            setIsActive(active)
            setTimeRemaining(Number(time))
            setCanDraw(draw)

            // Traiter la liste des joueurs
            const playerMap = {}
            playersList.forEach(addr => {
                playerMap[addr] = (playerMap[addr] || 0) + 1
            })

            const playersArray = Object.entries(playerMap).map(([address, tickets]) => ({
                address,
                tickets
            }))
            setPlayers(playersArray)

            // Mes tickets
            if (account) {
                const myCount = await contract.getTicketCount(account)
                setMyTickets(Number(myCount))
            }

            // Historique
            const historyData = []
            for (let i = 1; i < round; i++) {
                const winner = await contract.getWinner(i)
                if (winner !== ethers.ZeroAddress) {
                    const prize = await contract.getPrizePoolHistory(i)
                    historyData.push({
                        round: i,
                        winner,
                        prize: ethers.formatEther(prize)
                    })
                }
            }
            setHistory(historyData.reverse())

        } catch (err) {
            console.error('Erreur chargement données:', err)
        }
    }

    async function buyTickets() {
        if (!contract || ticketAmount < 1) return

        try {
            setLoading(true)
            setError(null)

            const price = await contract.ticketPrice()
            const totalCost = price * BigInt(ticketAmount)

            const tx = await contract.buyTicket(ticketAmount, {
                value: totalCost
            })

            await tx.wait()
            await loadLotteryData()
            setTicketAmount(1)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError(err.reason || 'Erreur lors de l\'achat')
            setLoading(false)
        }
    }

    function formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    function formatTime(seconds) {
        if (seconds === 0) return 'Pas de limite'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}h ${m}m ${s}s`
    }

    if (!account) {
        return (
            <div className="app">
                <div className="header">
                    <h1>🎰 BlockLucky</h1>
                    <p>Loterie décentralisée sur Ethereum</p>
                </div>
                <div className="wallet-section">
                    <button
                        className="btn btn-primary"
                        onClick={connectWallet}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Connecter MetaMask'}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <div className="header">
                <h1>🎰 BlockLucky</h1>
                <p>Loterie décentralisée sur Ethereum</p>
                <div className="wallet-address">
                    {formatAddress(account)}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Round Actuel</h3>
                    <div className="value">#{roundNumber}</div>
                </div>
                <div className="stat-card">
                    <h3>Prix du Ticket</h3>
                    <div className="value">{ticketPrice} ETH</div>
                </div>
                <div className="stat-card">
                    <h3>Participants</h3>
                    <div className="value">{playersCount} / {minPlayers}</div>
                </div>
                <div className="stat-card">
                    <h3>Cagnotte</h3>
                    <div className="value">{parseFloat(prizePool).toFixed(4)} ETH</div>
                </div>
                <div className="stat-card">
                    <h3>Mes Tickets</h3>
                    <div className="value">{myTickets}</div>
                </div>
                <div className="stat-card">
                    <h3>Temps Restant</h3>
                    <div className="value" style={{ fontSize: '1.2em' }}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>
            </div>

            {!isActive && (
                <div className="error-message">
                    ⚠️ La loterie est actuellement inactive
                </div>
            )}

            {canDraw && (
                <div style={{
                    background: 'rgba(72, 187, 120, 0.2)',
                    border: '1px solid #48bb78',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    🎉 Le tirage peut avoir lieu ! En attente...
                </div>
            )}

            <div className="ticket-section">
                <h2>Acheter des Tickets</h2>
                <div className="input-group">
                    <input
                        type="number"
                        min="1"
                        value={ticketAmount}
                        onChange={(e) => setTicketAmount(parseInt(e.target.value) || 1)}
                        placeholder="Nombre de tickets"
                        disabled={loading || !isActive}
                    />
                    <button
                        className="btn btn-success"
                        onClick={buyTickets}
                        disabled={loading || !isActive || ticketAmount < 1}
                    >
                        {loading ? 'Achat...' : `Acheter (${(ticketPrice * ticketAmount).toFixed(4)} ETH)`}
                    </button>
                </div>
                <p style={{ opacity: 0.7, fontSize: '0.9em' }}>
                    💡 Plus vous achetez de tickets, plus vos chances augmentent
                </p>
            </div>

            {players.length > 0 && (
                <div className="players-section">
                    <h2>Participants ({players.length})</h2>
                    <ul className="players-list">
                        {players.map((player, idx) => (
                            <li key={idx} className="player-item">
                                <span className="player-address">
                                    {player.address === account ? '🟢 Vous' : formatAddress(player.address)}
                                </span>
                                <span className="player-tickets">
                                    {player.tickets} ticket{player.tickets > 1 ? 's' : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {history.length > 0 && (
                <div className="history-section">
                    <h2>Historique des Gagnants</h2>
                    {history.map((item) => (
                        <div key={item.round} className="history-item">
                            <div className="round">Round #{item.round}</div>
                            <div className="winner">
                                🏆 {item.winner === account ? 'Vous avez gagné !' : formatAddress(item.winner)}
                            </div>
                            <div className="prize">{parseFloat(item.prize).toFixed(4)} ETH</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default App
