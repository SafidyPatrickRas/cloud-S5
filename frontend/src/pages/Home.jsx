import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Map from '../components/Map';
import { mockDataService } from '../services/mockData';
import './Home.css';

function Home() {
  // Coordonnées d'Antananarivo (centre-ville)
  const antananarivoCenter = [-18.8792, 47.5079];
  
  const [problemes, setProblemes] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Charger les données de test
    mockDataService.getProblemes().then(data => setProblemes(data));
    mockDataService.getStatistiques().then(data => setStats(data));
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Fonction pour obtenir le nom de l'entreprise
  const getEntrepriseName = (id_entreprise) => {
    if (!id_entreprise) return 'Non assigné';
    const entreprises = {
      1: 'SECREN Madagascar',
      2: 'COLAS Madagascar',
      3: 'GTBTP'
    };
    return entreprises[id_entreprise] || 'Non assigné';
  };

  // Convertir les problèmes en marqueurs pour la carte
  const markers = problemes.map(probleme => ({
    position: [probleme.latitude, probleme.longitude],
    // Tooltip au survol - Informations condensées
    tooltip: `
      <div style="font-size: 12px; line-height: 1.4;">
        <strong style="color: #667eea; font-size: 13px;">${probleme.lieu}</strong><br/>
        <strong>Date:</strong> ${formatDate(probleme.created_at)}<br/>
        <strong>Statut:</strong> <span style="color: ${
          probleme.status === 'NOUVEAU' ? '#f59e0b' : 
          probleme.status === 'EN_COURS' ? '#3b82f6' : 
          '#10b981'
        };">${probleme.status}</span><br/>
        <strong>Surface:</strong> ${probleme.surface_m2} m²<br/>
        <strong>Budget:</strong> ${(probleme.budget / 1000000).toFixed(1)} M Ar<br/>
        <strong>Entreprise:</strong> ${getEntrepriseName(probleme.id_entreprise)}
      </div>
    `,
    // Popup au clic - Informations détaillées
    popup: `
      <div style="min-width: 250px;">
        <h4 style="margin: 0 0 10px 0; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">
          ${probleme.lieu}
        </h4>
        <p style="margin: 6px 0;"><strong>📅 Date de signalement:</strong><br/>${formatDate(probleme.created_at)}</p>
        <p style="margin: 6px 0;"><strong>🚦 Statut:</strong> 
          <span style="color: ${
            probleme.status === 'NOUVEAU' ? '#f59e0b' : 
            probleme.status === 'EN_COURS' ? '#3b82f6' : 
            '#10b981'
          }; font-weight: bold; font-size: 14px;">${probleme.status}</span>
        </p>
        <p style="margin: 6px 0;"><strong>📏 Surface:</strong> ${probleme.surface_m2} m²</p>
        <p style="margin: 6px 0;"><strong>💰 Budget:</strong> ${(probleme.budget / 1000000).toFixed(1)} Millions Ar</p>
        <p style="margin: 6px 0;"><strong>🏢 Entreprise:</strong><br/>${getEntrepriseName(probleme.id_entreprise)}</p>
        <p style="margin: 8px 0 4px 0; padding-top: 8px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #555;">
          <strong>Description:</strong><br/>${probleme.description}
        </p>
      </div>
    `
  }));

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">Mon Application</h1>
          <Link to="/login" className="btn-login">
            Login Manager
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <h2 className="hero-title">Suivi des Travaux Routiers</h2>
          <p className="hero-subtitle">
            Signalement et suivi des problèmes routiers à Antananarivo
          </p>
        </section>

        {/* Statistiques */}
        {stats && (
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card nouveau">
                <div className="stat-icon">🆕</div>
                <div className="stat-value">{stats.nb_nouveaux}</div>
                <div className="stat-label">Nouveaux</div>
              </div>
              <div className="stat-card en-cours">
                <div className="stat-icon">🚧</div>
                <div className="stat-value">{stats.nb_en_cours}</div>
                <div className="stat-label">En Cours</div>
              </div>
              <div className="stat-card termine">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.nb_termines}</div>
                <div className="stat-label">Terminés</div>
              </div>
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.avancement_pct}%</div>
                <div className="stat-label">Avancement</div>
              </div>
            </div>
          </section>
        )}

        {/* Section Carte Interactive */}
        <section className="map-section">
          <h3 className="section-title">Carte des Problèmes Routiers</h3>
          <p className="section-description">
            {problemes.length} problèmes routiers signalés à Antananarivo
          </p>
          <Map 
            center={antananarivoCenter} 
            zoom={13} 
            height="600px"
            markers={markers}
          />
        </section>

        <section className="visitor-section">
          <h3 className="section-title">Fonctionnalités</h3>
          <div className="cards-container">
            <div className="card">
              <div className="card-icon">📍</div>
              <h4 className="card-title">Signalement</h4>
              <p className="card-description">
                Signalez les problèmes routiers directement sur la carte
              </p>
            </div>

            <div className="card">
              <div className="card-icon">📊</div>
              <h4 className="card-title">Suivi en temps réel</h4>
              <p className="card-description">
                Suivez l'avancement des travaux de réparation
              </p>
            </div>

            <div className="card">
              <div className="card-icon">ℹ️</div>
              <h4 className="card-title">Informations</h4>
              <p className="card-description">
                Consultez les détails de chaque intervention
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 Mon Application. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default Home;
