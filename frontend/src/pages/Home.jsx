import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemeService } from '../services/api';
import Map from '../components/Map';
import './Home.css';

function Home() {
  const [problemes, setProblemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const antananarivoCenter = [-18.8792, 47.5079];

  useEffect(() => {
    loadProblemes();
  }, []);

  const loadProblemes = async () => {
    try {
      setLoading(true);
      const data = await problemeService.getAll();
      setProblemes(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement problèmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const markers = problemes.map(prob => ({
    position: [parseFloat(prob.latitude), parseFloat(prob.longitude)],
    tooltip: `<strong>${prob.status}</strong>`,
    tooltipPermanent: true,
    popup: `
      <div style="min-width:220px">
        <strong>🚧 Problème Routier</strong><br/>
        <strong>Status:</strong> ${prob.status}<br/>
        ${prob.surface_m2 ? `Surface: ${prob.surface_m2} m²<br/>` : ''}
        ${prob.budget ? `Budget: ${prob.budget} MGA<br/>` : ''}
        ${prob.commentaire ? `Commentaire: ${prob.commentaire}<br/>` : ''}
        <small>👁️ Lecture seule</small>
      </div>
    `
  }));

  return (
    <div className={`home-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">HV</div>
            {!sidebarCollapsed && <span className="logo-text">Home Visitors</span>}
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">V</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">Visiteur</div>
              <div className="user-role">Lecture seule</div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <Link to="/login" className="btn-login-sidebar">Login Manager</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-wrapper">
        <header className="app-header">
          <div className="header-left">
            <h1 className="page-title">Bienvenue à Antananarivo</h1>
            <p className="page-subtitle">
              Visualisez les problèmes routiers signalés par les citoyens
            </p>
          </div>
        </header>

        <div className="app-content">
          <div className="content-view map-container-full">
            <Map
              center={antananarivoCenter}
              zoom={13}
              height="600px"
              markers={markers}
            />
            {loading && <div style={{ padding: '1rem', color: '#6b7280' }}>Chargement des données...</div>}
            {!loading && problemes.length === 0 && <div style={{ padding: '1rem', color: '#6b7280' }}>Aucun problème signalé pour l'instant.</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
