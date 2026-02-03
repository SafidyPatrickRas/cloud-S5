import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemeViewService } from '../services/api';
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
      const { problemes: data } = await problemeViewService.getAllWithDetails();
      setProblemes(data);
    } catch (error) {
      console.error('❌ Erreur chargement problèmes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Transformation des problèmes en marqueurs pour visiteurs (lecture seule)
  const markers = problemes
    .filter(prob => Number.isFinite(parseFloat(prob.latitude)) && Number.isFinite(parseFloat(prob.longitude)))
    .map(prob => ({
      position: [parseFloat(prob.latitude), parseFloat(prob.longitude)],
      tooltip: `<div class="map-tooltip">${prob.status}</div>`,
      tooltipPermanent: true,
      popup: `
        <div class="map-popup">
          <h4>Problème Routier</h4>
          <hr class="divider" />
          <div><strong>Status:</strong> ${prob.status}</div>
          ${prob.surface_m2 ? `<div><strong>Surface:</strong> ${prob.surface_m2} m²</div>` : ''}
          ${prob.budget ? `<div><strong>Budget:</strong> ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'MGA', minimumFractionDigits: 0}).format(prob.budget)}</div>` : ''}
          ${prob.date_signalement ? `<div><strong>Date:</strong> ${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}</div>` : ''}
          ${prob.commentaire ? `<div><strong>Commentaire:</strong> ${prob.commentaire}</div>` : ''}
          <hr class="divider" />
          <div class="muted">👁️ Mode lecture seule</div>
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
