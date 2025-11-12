// Exemples de composants que ton pote peut utiliser ou modifier

// Composant Loading
export function Loading() {
    return (
        <div className="loading">
            <div className="spinner"></div>
            <p>Chargement...</p>
        </div>
    )
}

// Composant Card réutilisable
export function Card({ title, value, icon }) {
    return (
        <div className="stat-card">
            <h3>
                {icon && <span className="icon">{icon}</span>}
                {title}
            </h3>
            <div className="value">{value}</div>
        </div>
    )
}

// Composant Button personnalisé
export function Button({ children, onClick, variant = 'primary', disabled, loading }) {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? 'Chargement...' : children}
        </button>
    )
}

// Composant Alert
export function Alert({ type = 'error', children }) {
    const styles = {
        error: {
            background: 'rgba(245, 101, 101, 0.2)',
            border: '1px solid #f56565'
        },
        success: {
            background: 'rgba(72, 187, 120, 0.2)',
            border: '1px solid #48bb78'
        },
        info: {
            background: 'rgba(66, 153, 225, 0.2)',
            border: '1px solid #4299e1'
        }
    }

    return (
        <div style={{
            ...styles[type],
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
        }}>
            {children}
        </div>
    )
}

// Composant PlayerCard
export function PlayerCard({ address, tickets, isCurrentUser }) {
    return (
        <li className="player-item">
            <span className="player-address">
                {isCurrentUser && '🟢 '}
                {address}
            </span>
            <span className="player-tickets">
                {tickets} ticket{tickets > 1 ? 's' : ''}
            </span>
        </li>
    )
}

// Hook personnalisé pour le countdown
export function useCountdown(seconds) {
    const [timeLeft, setTimeLeft] = React.useState(seconds)

    React.useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft(t => Math.max(0, t - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    return timeLeft
}

// Utilitaire pour formater les nombres
export function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num)
}

// Utilitaire pour formater l'ETH
export function formatEth(value, decimals = 4) {
    return parseFloat(value).toFixed(decimals)
}

// Animation CSS pour le spinner (à ajouter dans index.css)
/*
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
*/

// Gradient backgrounds à essayer
/*
.gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
*/
