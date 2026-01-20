import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemeService } from '../services/api';
import Map from '../components/Map';
import { mockDataService } from '../services/mockData';
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

        {/* CONTENT AREA INDÉPENDANT */}
        <main className="app-content">
          {activeView === 'map' && (
            <div className="content-view map-view">
              <div className="view-header">
                <h2 className="view-title">Carte des Problèmes Routiers</h2>
                <p className="view-description">
                  Visualisez en temps réel tous les problèmes signalés sur la carte d'Antananarivo
                </p>
              </div>
              <div className="map-container-full">
                <Map 
                  center={antananarivoCenter} 
                  zoom={13} 
                  height="100%"
                  markers={problemes.map(probleme => ({
                    position: [probleme.latitude, probleme.longitude],
                    tooltip: `
                      <div class="map-tooltip">
                        <strong class="tooltip-title">${probleme.lieu}</strong><br/>
                        <strong>Date:</strong> ${new Date(probleme.created_at).toLocaleDateString('fr-FR')}<br/>
                        <strong>Statut:</strong> <span class="status-${probleme.status.toLowerCase()}">${probleme.status}</span><br/>
                        <strong>Surface:</strong> ${probleme.surface_m2} m²<br/>
                        <strong>Budget:</strong> ${(probleme.budget / 1000000).toFixed(1)} M Ar
                      </div>
                    `,
                    popup: `
                      <div class="map-popup">
                        <h4 class="popup-title">${probleme.lieu}</h4>
                        <p class="popup-item"><strong>Date:</strong> ${new Date(probleme.created_at).toLocaleDateString('fr-FR')}</p>
                        <p class="popup-item"><strong>Statut:</strong> ${probleme.status}</p>
                        <p class="popup-item"><strong>Surface:</strong> ${probleme.surface_m2} m²</p>
                        <p class="popup-item"><strong>Budget:</strong> ${(probleme.budget / 1000000).toFixed(1)} M Ar</p>
                        <p class="popup-description">${probleme.description}</p>
                      </div>
                    `
                  }))}
                />
              </div>
            </div>
          )}

          {activeView === 'table' && stats && (
            <div className="content-view table-view">
              <div className="view-header">
                <h2 className="view-title">Tableau Récapitulatif</h2>
                <p className="view-description">
                  Vue d'ensemble des indicateurs clés et statistiques des travaux routiers
                </p>
              </div>
              <div className="table-container-full">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Indicateur</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="indicator-icon">Point</span>
                        <strong>Nombre de points signalés</strong>
                      </td>
                      <td className="value-cell">{stats.nb_total_problemes}</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="indicator-icon nouveau-icon">Nouveau</span>
                        <strong>Nouveaux problèmes</strong>
                      </td>
                      <td className="value-cell nouveau-value">{stats.nb_nouveaux}</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="indicator-icon encours-icon">Cours</span>
                        <strong>Travaux en cours</strong>
                      </td>
                      <td className="value-cell encours-value">{stats.nb_en_cours}</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="indicator-icon termine-icon">Terminé</span>
                        <strong>Travaux terminés</strong>
                      </td>
                      <td className="value-cell termine-value">{stats.nb_termines}</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="indicator-icon">Surface</span>
                        <strong>Surface totale concernée</strong>
                      </td>
                      <td className="value-cell">
                        {stats.total_surface_m2.toLocaleString('fr-FR')} m²
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="indicator-icon">Budget</span>
                        <strong>Budget total alloué</strong>
                      </td>
                      <td className="value-cell budget-value">
                        {(stats.total_budget / 1000000).toLocaleString('fr-FR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1
                        })} M Ar
                      </td>
                    </tr>
                    <tr className="highlight-row">
                      <td>
                        <span className="indicator-icon">Avancement</span>
                        <strong>Avancement global</strong>
                      </td>
                      <td className="value-cell avancement-value">
                        <div className="progress-container">
                          <div className="progress-bar" style={{width: `${stats.avancement_pct}%`}}>
                            {stats.avancement_pct}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
  );
}

export default Home;
