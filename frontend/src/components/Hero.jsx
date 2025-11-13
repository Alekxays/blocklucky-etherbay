import { useEffect, useRef } from 'react'
import ThreeScene from '../ThreeScene'
import { gsap } from 'gsap'

export default function Hero({ account, myTickets, loading, onConnectClick, formatAddress }) {
  const el = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-inner', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
      gsap.from('.three-scene', { scale: 0.95, autoAlpha: 0, duration: 0.9, delay: 0.15 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div className="header">
      <div className="hero" ref={el}>
        <div className="hero-inner">
          <div className="eyebrow">Rareté • Kismet • Blockchain</div>
          <h1>BlockLucky — Entrez dans la chance</h1>
          <p className="lead">Une loterie décentralisée, repensée avec une esthétique néon cosmique, animations fluides et expériences 3D.</p>

          <div className="cta-row">
            {!account ? (
              <>
                <button className="btn btn-primary" onClick={onConnectClick} disabled={loading}>
                  {loading ? '⏳ Connexion...' : '🔗 Connecter un Wallet'}
                </button>
                <button className="btn btn-outline" onClick={() => document.querySelector('.stats-grid')?.scrollIntoView({ behavior: 'smooth' })}>Voir la cagnotte</button>
              </>
            ) : (
              <div className="wallet-info">
                <span className="wallet-addr">{formatAddress(account)}</span>
                {myTickets > 0 && <span className="badge">🎫 {myTickets}</span>}
              </div>
            )}
          </div>
        </div>

        <ThreeScene />
      </div>
    </div>
  )
}
