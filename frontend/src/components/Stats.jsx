import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Stats({ roundNumber, ticketPrice, playersCount, minPlayers, prizePool, timeRemaining, canDraw }) {
  const el = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-card', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div className="stats-grid" ref={el}>
      <div className="stat-card">
        <span className="stat-label">Round :</span>
        <span className="stat-value">#{roundNumber}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Prix du ticket :</span>
        <span className="stat-value">{ticketPrice} ETH</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Participants :</span>
        <span className="stat-value">{playersCount} / {minPlayers}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Cagnotte :</span>
        <span className="stat-value">{prizePool} ETH</span>
      </div>
      {timeRemaining > 0 && (
        <div className="stat-card">
          <span className="stat-label">Temps restant :</span>
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
  )
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}h ${m}m ${s}s`
}
