import React, { useState } from 'react'

export default function Navbar({ account, onConnect }) {
  const [open, setOpen] = useState(false)

  function toggle() {
    setOpen(v => !v)
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <strong>BlockLucky</strong>
        </div>

        <button className={`hamburger ${open ? 'is-open' : ''}`} onClick={toggle} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          <li><a href="#how">Comment ça marche</a></li>
          <li><a href="#stats">Stats</a></li>
          <li><a href="#winners">Gagnants</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-cta">
          {account ? (
            <div className="wallet-pill" title={account}>
              <span className="dot" />
              <span className="addr">{account.slice(0,6)}...{account.slice(-4)}</span>
            </div>
          ) : (
            <button className="btn btn-wallet" onClick={onConnect}>Connect Wallet</button>
          )}
        </div>
      </div>
    </nav>
  )
}
