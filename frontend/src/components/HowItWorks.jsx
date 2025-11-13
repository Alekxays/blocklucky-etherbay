import React from 'react'

export default function HowItWorks({ ticketPrice, playersCount, prizePool, roundNumber }) {
  return (
    <section id="how" className="how-section">
      <div className="how-inner">
        <h2>Comment ça marche</h2>
        <p>
          BlockLucky est une loterie simple et transparente basée sur la blockchain. Chaque ticket
          achetés entre dans le tirage du round courant. Quand le round atteint les conditions
          (nombre minimum de joueurs, temps écoulé ou tirage manuel), un gagnant est sélectionné
          et remporte la cagnotte.
        </p>

        <div className="how-steps">
          <div className="step">
            <strong>1.</strong>
            <div>
              <h4>Connectez votre wallet</h4>
              <p>Utilisez MetaMask, Coinbase Wallet ou un wallet injecté pour interagir.</p>
            </div>
          </div>

          <div className="step">
            <strong>2.</strong>
            <div>
              <h4>Achetez des tickets</h4>
              <p>Choisissez le nombre de tickets puis confirmez la transaction dans votre wallet.</p>
            </div>
          </div>

          <div className="step">
            <strong>3.</strong>
            <div>
              <h4>Tirage et gain</h4>
              <p>Une fois le tirage effectué, le gagnant reçoit la cagnotte automatiquement.</p>
            </div>
          </div>
        </div>

        <div className="how-stats">
          <div className="stat">
            <span className="label">Round</span>
            <span className="value">#{roundNumber}</span>
          </div>
          <div className="stat">
            <span className="label">Prix ticket</span>
            <span className="value">{ticketPrice} ETH</span>
          </div>
          <div className="stat">
            <span className="label">Participants</span>
            <span className="value">{playersCount}</span>
          </div>
          <div className="stat">
            <span className="label">Cagnotte</span>
            <span className="value">{prizePool} ETH</span>
          </div>
        </div>
      </div>
    </section>
  )
}
