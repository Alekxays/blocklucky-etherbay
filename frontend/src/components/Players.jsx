import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

function addressColor(addr) {
  // simple hash to color
  let h = 0
  for (let i = 0; i < addr.length; i++) h = addr.charCodeAt(i) + ((h << 5) - h)
  const c = (h & 0x00FFFFFF).toString(16).toUpperCase()
  return '#' + '00000'.slice(0, 6 - c.length) + c
}

function shortAddr(addr) {
  return `${addr.slice(0,6)}...${addr.slice(-4)}`
}

export default function Players({ players, account, formatAddress }) {
  const el = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.player-item', { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.45 })
    }, el)
    return () => ctx.revert()
  }, [players])

  if (!players || players.length === 0) return null

  return (
    <div className="players-section">
      <h2>Participants ({players.length})</h2>
      <div className="players-list" ref={el}>
        {players.map((player, idx) => (
          <div key={idx} className={`player-item ${player.address.toLowerCase() === account?.toLowerCase() ? 'is-me' : ''}`}>
            <div className="player-left">
              <div className="avatar" style={{ background: addressColor(player.address) }} aria-hidden>
                {player.address.slice(2,4).toUpperCase()}
              </div>
              <div className="player-meta">
                <div className="player-address">{shortAddr(player.address)}</div>
                <div className="player-sub">{player.address}</div>
              </div>
            </div>

            <div className="player-right">
              <span className="badge">{player.tickets} 🎫</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
