import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemeService } from '../services/api';
import Map from '../components/Map';
import './Home.css';

function Home() {
  const [problemes, setProblemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coordonnées d'Antananarivo (centre-ville)
  const antananarivoCenter = [-18.8792, 47.5079];
  
  useEffect(() => {
    loadProblemes();
  }, []);

  const loadProblemes = async () => {
    try {
      setLoading(true);
      const data = await problemeService.getAll();
      setProblemes(data);
    } catch (error) {
      console.error('❌ Erreur chargement problèmes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Transformation des problèmes en marqueurs pour visiteurs (lecture seule)
  const markers = problemes.map(prob => ({
    position: [parseFloat(prob.latitude), parseFloat(prob.longitude)],
    tooltip: `<strong style="color: white;">${prob.status}</strong>`,
    tooltipPermanent: true,
    popup: `
      <div style="min-width: 220px;">
        <strong style="color: #667eea; font-size: 1.1em;">🚧 Problème Routier</strong><br/>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;"/>
        <strong>Status:</strong> <span style="color: ${prob.status === 'NOUVEAU' ? '#e53e3e' : prob.status === 'EN_COURS' ? '#dd6b20' : '#38a169'};">${prob.status}</span><br/>
        ${prob.surface_m2 ? `<strong>Surface:</strong> ${prob.surface_m2} m²<br/>` : ''}
        ${prob.budget ? `<strong>Budget:</strong> ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'MGA', minimumFractionDigits: 0}).format(prob.budget)}<br/>` : ''}
        ${prob.date_signalement ? `<strong>Date:</strong> ${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}<br/>` : ''}
        ${prob.commentaire ? `<strong>Commentaire:</strong> ${prob.commentaire}<br/>` : ''}
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;"/>
        <small style="color: #718096;">👁️ Mode lecture seule</small>
      </div>
    `
  }));

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">Section des visiteurs</h1>
          <Link to="/login" className="btn-login">
            Login Manager
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <h2 className="hero-title">Bienvenue à Antananarivo</h2>
          <p className="hero-subtitle">
            Explorez la carte interactive de la capitale et visualiser les problemes routier du quotidien.
          </p>
        </section>

        {/* Section Carte Interactive */}
        <section className="map-section">
          <h3 className="section-title">🗺️ Carte des Problèmes Routiers</h3>
          <p className="section-description">
            {loading 
              ? 'Chargement des problèmes routiers...' 
              : `${problemes.length} problème(s) signalé(s) à Antananarivo - Survolez les marqueurs pour plus de détails`
            }
          </p>
          <Map 
            center={antananarivoCenter} 
            zoom={13} 
            height="600px"
            markers={markers}
          />
        </section>


      </main>

      <footer className="home-footer">
        <p>&copy; 2026 Mon Application. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Home;
