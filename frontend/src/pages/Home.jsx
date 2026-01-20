import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Map from '../components/Map';
import { mockDataService } from '../services/mockData';
import './Home.css';

function Home() {
  const antananarivoCenter = [-18.8792, 47.5079];
  
  const [problemes, setProblemes] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    mockDataService.getProblemes().then(data => setProblemes(data));
    mockDataService.getStatistiques().then(data => setStats(data));
  }, []);

  return (
    <div className="app-wrapper">
      {/* SIDEBAR STICKY ET RÉTRACTABLE */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">RT</div>
            {!sidebarCollapsed && <span className="logo-text">RouteTracker</span>}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <span className="toggle-icon">{sidebarCollapsed ? '›' : '‹'}</span>
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">V</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">Visiteur</div>
              <div className="user-role">Mode Public</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <div className="nav-section-title">Navigation</div>}
            
            <button 
              className={`nav-item ${activeView === 'map' ? 'active' : ''}`}
              onClick={() => setActiveView('map')}
            >
              <span className="nav-icon-text">M</span>
              {!sidebarCollapsed && <span className="nav-label">Carte Interactive</span>}
            </button>

            <button 
              className={`nav-item ${activeView === 'table' ? 'active' : ''}`}
              onClick={() => setActiveView('table')}
            >
              <span className="nav-icon-text">T</span>
              {!sidebarCollapsed && <span className="nav-label">Tableau Récapitulatif</span>}
            </button>
          </div>

          {stats && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="nav-section-title">Statistiques</div>}
              
              <div className="stat-item nouveau">
                <span className="stat-icon-text">N</span>
                {!sidebarCollapsed && (
                  <div className="stat-content">
                    <div className="stat-label">Nouveaux</div>
                    <div className="stat-value">{stats.nb_nouveaux}</div>
                  </div>
                )}
              </div>

              <div className="stat-item encours">
                <span className="stat-icon-text">C</span>
                {!sidebarCollapsed && (
                  <div className="stat-content">
                    <div className="stat-label">En Cours</div>
                    <div className="stat-value">{stats.nb_en_cours}</div>
                  </div>
                )}
              </div>

              <div className="stat-item termine">
                <span className="stat-icon-text">T</span>
                {!sidebarCollapsed && (
                  <div className="stat-content">
                    <div className="stat-label">Terminés</div>
                    <div className="stat-value">{stats.nb_termines}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <Link to="/login" className="btn-login-sidebar">
            <span className="btn-icon-text">L</span>
            {!sidebarCollapsed && <span className="btn-text">Login Manager</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* HEADER INDÉPENDANT */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="page-title">Suivi des Travaux Routiers - Antananarivo</h1>
            <p className="page-subtitle">
              {problemes.length} problèmes routiers • {stats ? `${stats.avancement_pct}%` : '0%'} d'avancement
            </p>
          </div>
          <div className="header-right">
            <div className="header-date">
              <span className="date-label">Date:</span>
              <span className="date-value">{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </header>

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
    </div>
  );
}

export default Home;
