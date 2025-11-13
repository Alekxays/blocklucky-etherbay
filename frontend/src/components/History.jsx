import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function History({ history, formatAddress }) {
  const el = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.history-item', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.45 })
    }, el)
    return () => ctx.revert()
  }, [history])

  if (!history || history.length === 0) return null

  return (
    <div className="history-section">
      <h2>Historique des gagnants</h2>
      <div className="history-list" ref={el}>
        {history.slice().reverse().map((item) => (
          <div key={item.round} className="history-item">
            <div className="round">Round #{item.round}</div>
            <div className="winner">{formatAddress(item.winner)}</div>
            <div className="prize">{item.prize} ETH</div>
          </div>
        ))}
      </div>
    </div>
  )
}
