import React from 'react'

export default function CaseStudies() {
  const items = [
    { title: 'Round Visualizer', desc: 'Inspectez les tirages passés et la distribution des tickets.' },
    { title: 'Realtime Jackpot', desc: 'Cagnotte mise à jour en temps réel avec animations.' },
    { title: 'Provably Fair', desc: 'Tirages transparents sur la blockchain.' }
  ]

  return (
    <section id="showcase" className="case-studies">
      <h2>Fonctionnalités</h2>
      <div className="case-grid">
        {items.map((it, i) => (
          <article className="case-card" key={i}>
            <h3>{it.title}</h3>
            <p>{it.desc}</p>
            <div className="case-cta"><button className="btn btn-outline">En savoir plus</button></div>
          </article>
        ))}
      </div>
    </section>
  )
}
