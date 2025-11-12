import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import contractABI from './contractABI.json'

const CONTRACT_ADDRESS = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E"

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
    const [owner, setOwner] = useState(null)
    const [isOwner, setIsOwner] = useState(false)

    // Joueurs et historique
    const [players, setPlayers] = useState([])
    const [history, setHistory] = useState([])
    const [myTickets, setMyTickets] = useState(0)

    // Formulaire
    const [ticketAmount, setTicketAmount] = useState(1)
    const [externalSeed, setExternalSeed] = useState('')

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
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                if (accounts.length > 0) {
                    connectWallet('injected')
                }
            } catch (err) {
                console.error('Erreur check wallet:', err)
            }
        }
    }

    async function connectWallet(walletType = 'injected') {
        try {
            setLoading(true)
            setError(null)
            setShowWalletModal(false)

            if (typeof window.ethereum === 'undefined') {
                setError('Aucun wallet crypto détecté. Installez MetaMask, Coinbase Wallet, ou un autre wallet compatible.')
                setLoading(false)
                return
            }

            let ethereum = window.ethereum

            // Si plusieurs wallets sont installés
            if (window.ethereum.providers && walletType !== 'injected') {
                if (walletType === 'metamask') {
                    ethereum = window.ethereum.providers.find(p => p.isMetaMask)
                } else if (walletType === 'coinbase') {
                    ethereum = window.ethereum.providers.find(p => p.isCoinbaseWallet)
                }

                if (!ethereum) {
                    setError(`${walletType === 'metamask' ? 'MetaMask' : 'Coinbase Wallet'} non trouvé. Essayez "Autre Wallet".`)
                    setLoading(false)
                    return
                }
            }

            // Demander la connexion
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })

            // Vérifier/changer le réseau
            const chainId = await ethereum.request({ method: 'eth_chainId' })
            if (chainId !== '0x7a69') { // 31337 en hexa
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x7a69' }],
                    })
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        // Le réseau n'existe pas, le créer
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
                            setError('Impossible d\'ajouter le réseau Hardhat Local')
                            setLoading(false)
                            return
                        }
                    } else {
                        setError('Veuillez passer au réseau "Hardhat Local" (Chain ID: 31337) dans votre wallet')
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
                    window.location.reload()
                } else {
                    setAccount(null)
                    setContract(null)
                    setProvider(null)
                }
            })

            ethereum.on('chainChanged', () => {
                window.location.reload()
            })

            setLoading(false)
        } catch (err) {
            console.error('Erreur connexion:', err)
            if (err.code === 4001) {
                setError('Connexion refusée')
            } else if (err.code === -32002) {
                setError('Une demande de connexion est déjà en attente. Vérifiez votre wallet.')
            } else {
                setError(`Erreur: ${err.message}`)
            }
            setLoading(false)
        }
    }

    async function loadLotteryData() {
        if (!contract) return

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
                playersList,
                contractOwner
            ] = await Promise.all([
                contract.ticketPrice(),
                contract.getPlayersCount(),
                contract.getPrizePool(),
                contract.minPlayers(),
                contract.roundNumber(),
                contract.isActive(),
                contract.getTimeRemaining(),
                contract.canDrawWinner(),
                contract.getPlayers(),
                contract.owner()
            ])

            setTicketPrice(ethers.formatEther(price))
            setPlayersCount(Number(count))
            setPrizePool(ethers.formatEther(pool))
            setMinPlayers(Number(min))
            setRoundNumber(Number(round))
            setIsActive(active)
            setTimeRemaining(Number(time))
            setCanDraw(draw)
            setOwner(contractOwner)

            // Vérifier si l'utilisateur connecté est le owner
            if (account) {
                setIsOwner(account.toLowerCase() === contractOwner.toLowerCase())
            }

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
            setHistory(historyData)

        } catch (err) {
            console.error('Erreur chargement données:', err)
            setError('Impossible de charger les données du contrat. Vérifiez votre connexion.')
        }
    }

    async function buyTickets() {
        if (!contract || ticketAmount < 1) return

        try {
            setLoading(true)
            setError(null)

            const value = ethers.parseEther((parseFloat(ticketPrice) * ticketAmount).toString())
            const tx = await contract.buyTicket(ticketAmount, { value })

            await tx.wait()

            await loadLotteryData()
            setTicketAmount(1)
            setLoading(false)
        } catch (err) {
            console.error('Erreur achat:', err)
            if (err.code === 'ACTION_REJECTED') {
                setError('Transaction annulée')
            } else {
                setError('Erreur lors de l\'achat: ' + (err.reason || err.message))
            }
            setLoading(false)
        }
    }

    async function drawWinner() {
        if (!contract || !isOwner) return

        try {
            setLoading(true)
            setError(null)

            // Tirage sans seed (passe 0)
            const tx = await contract.drawWinner(0)
            await tx.wait()

            await loadLotteryData()
            setLoading(false)
            alert('🎉 Gagnant tiré au sort ! Vérifiez l\'historique.')
        } catch (err) {
            console.error('Erreur tirage:', err)
            setError('Erreur lors du tirage: ' + (err.reason || err.message))
            setLoading(false)
        }
    }

    async function drawWinnerWithSeed() {
        if (!contract || !isOwner) return

        try {
            setLoading(true)
            setError(null)

            const seed = externalSeed ? parseInt(externalSeed) : Math.floor(Math.random() * 1000000000)
            console.log('🎲 Seed utilisé:', seed)

            const tx = await contract.drawWinner(seed)
            await tx.wait()

            await loadLotteryData()
            setExternalSeed('')
            setLoading(false)
            alert(`🎉 Gagnant tiré avec le seed ${seed} ! Vérifiez l'historique.`)
        } catch (err) {
            console.error('Erreur tirage avec seed:', err)
            setError('Erreur lors du tirage: ' + (err.reason || err.message))
            setLoading(false)
        }
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}h ${m}m ${s}s`
    }

    function formatAddress(addr) {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <div className="app">
            <header className="header">
                <h1>🎰 BlockLucky</h1>
                <p>Loterie décentralisée sur Ethereum</p>

                {!account ? (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowWalletModal(true)}
                        disabled={loading}
                    >
                        {loading ? '⏳ Connexion...' : '🔗 Connecter un Wallet'}
                    </button>
                ) : (
                    <div className="wallet-info">
                        <span>✅ {formatAddress(account)}</span>
                        {isOwner && <span className="badge badge-owner">👑 Propriétaire</span>}
                        {myTickets > 0 && <span className="badge">🎫 {myTickets} ticket(s)</span>}
                    </div>
                )}
            </header>

            {owner && (
                <div className="owner-info">
                    <span>👑 Propriétaire du contrat: {formatAddress(owner)}</span>
                </div>
            )}

            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}

            {!account && !showWalletModal && (
                <div className="welcome-section">
                    <h2>Bienvenue sur BlockLucky</h2>
                    <p>Connectez votre wallet pour participer à la loterie</p>
                    <button className="btn btn-large" onClick={() => setShowWalletModal(true)}>
                        Choisir un Wallet
                    </button>
                </div>
            )}

            {showWalletModal && (
                <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Choisissez votre Wallet</h2>
                        <div className="wallet-options">
                            <button
                                className="wallet-option"
                                onClick={() => connectWallet('metamask')}
                            >
                                <span className="wallet-icon">🦊</span>
                                <div>
                                    <h3>MetaMask</h3>
                                    <p>Le wallet le plus populaire</p>
                                </div>
                            </button>

                            <button
                                className="wallet-option"
                                onClick={() => connectWallet('coinbase')}
                            >
                                <span className="wallet-icon">💙</span>
                                <div>
                                    <h3>Coinbase Wallet</h3>
                                    <p>Par Coinbase Exchange</p>
                                </div>
                            </button>

                            <button
                                className="wallet-option"
                                onClick={() => connectWallet('injected')}
                            >
                                <span className="wallet-icon">🔌</span>
                                <div>
                                    <h3>Autre Wallet</h3>
                                    <p>N'importe quel wallet compatible</p>
                                </div>
                            </button>
                        </div>
                        <button className="btn-close" onClick={() => setShowWalletModal(false)}>
                            ✕ Fermer
                        </button>
                    </div>
                </div>
            )}

            {contract && (
                <>
                    {!isActive && (
                        <div className="warning-banner">
                            ⚠️ La loterie est actuellement inactive
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">Round</span>
                            <span className="stat-value">#{roundNumber}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Prix du ticket</span>
                            <span className="stat-value">{ticketPrice} ETH</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Participants</span>
                            <span className="stat-value">{playersCount} / {minPlayers}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Cagnotte</span>
                            <span className="stat-value">{prizePool} ETH</span>
                        </div>
                        {timeRemaining > 0 && (
                            <div className="stat-card">
                                <span className="stat-label">Temps restant</span>
                                <span className="stat-value">{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        {canDraw && (
                            <div className="stat-card highlight">
                                <span className="stat-label">🎉 Tirage</span>
                                <span className="stat-value">Possible !</span>
                            </div>
                        )}
                    </div>

                    {isActive && (
                        <div className="buy-section">
                            <h2>Acheter des tickets</h2>
                            <div className="buy-form">
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={ticketAmount}
                                    onChange={(e) => setTicketAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={loading}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={buyTickets}
                                    disabled={loading || !isActive}
                                >
                                    {loading ? '⏳ Traitement...' : `Acheter ${ticketAmount} ticket(s)`}
                                </button>
                            </div>
                            <p className="buy-info">
                                Total: {(parseFloat(ticketPrice) * ticketAmount).toFixed(4)} ETH
                            </p>
                        </div>
                    )}

                    {isOwner && canDraw && (
                        <div className="owner-section">
                            <h2>🎲 Panel Propriétaire</h2>
                            <p>Vous êtes le propriétaire. Vous pouvez lancer le tirage au sort !</p>

                            <div className="draw-options">
                                <div className="draw-option">
                                    <h3>Tirage standard</h3>
                                    <p>Utilise uniquement le seed interne (évolue avec chaque achat)</p>
                                    <button
                                        className="btn btn-warning"
                                        onClick={drawWinner}
                                        disabled={loading}
                                    >
                                        {loading ? '⏳ Tirage...' : '🎯 Lancer le tirage'}
                                    </button>
                                </div>

                                <div className="draw-option highlight">
                                    <h3>Tirage avec seed externe</h3>
                                    <p>Recommandé : Ajoute un nombre aléatoire pour plus de sécurité</p>
                                    <div className="seed-input-group">
                                        <input
                                            type="number"
                                            placeholder="Seed (laisse vide pour auto)"
                                            value={externalSeed}
                                            onChange={(e) => setExternalSeed(e.target.value)}
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn btn-success"
                                            onClick={drawWinnerWithSeed}
                                            disabled={loading}
                                        >
                                            {loading ? '⏳ Tirage...' : '🎲 Lancer avec seed'}
                                        </button>
                                    </div>
                                    <small>💡 Si vide, un seed aléatoire sera généré automatiquement</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {players.length > 0 && (
                        <div className="players-section">
                            <h2>Participants ({players.length})</h2>
                            <div className="players-list">
                                {players.map((player, idx) => (
                                    <div
                                        key={idx}
                                        className={`player-item ${player.address.toLowerCase() === account?.toLowerCase() ? 'is-me' : ''}`}
                                    >
                                        <span>{formatAddress(player.address)}</span>
                                        <span className="badge">{player.tickets} 🎫</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="history-section">
                            <h2>Historique des gagnants</h2>
                            <div className="history-list">
                                {history.reverse().map((item) => (
                                    <div key={item.round} className="history-item">
                                        <span className="round-badge">Round #{item.round}</span>
                                        <span>{formatAddress(item.winner)}</span>
                                        <span className="prize">{item.prize} ETH</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default App
