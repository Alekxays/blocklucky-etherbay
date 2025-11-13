import React from 'react'

export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="logo">BlockLucky</div>
          <p className="muted">© {new Date().getFullYear()} BlockLucky. All rights reserved.</p>
        </div>

        <div className="footer-right links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  )
}
