import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemeService } from '../services/api';

import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import ProblemeModal from '../components/ProblemeModal';
import Map from '../components/Map';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  // Data states
  const [problemes, setProblemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProbleme, setSelectedProbleme] = useState(null);

  const [users, setUsers] = useState([]);

  // Load problèmes
  useEffect(() => {
    loadProblemes();
  }, []);

  const loadProblemes = async () => {
    try {
      setLoading(true);
      const data = await problemeService.getAll();
      setProblemes(data || []);
    } catch (error) {
      console.error('Erreur chargement problèmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMarkerClick = (probleme) => {
    setSelectedProbleme(probleme);
  };

  const handleProblemeUpdate = () => {
    loadProblemes();
    setSelectedProbleme(null);
  };

  const handleUserCreated = (user) => {
    console.log('Utilisateur créé:', user);
  };

  return (
    <div className={`dashboard-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">RM</div>
            {!sidebarCollapsed && <span className="logo-text">RouteTracker Manager</span>}
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">M</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">Manager</div>
              <div className="user-role">Administrateur</div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout-sidebar" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        
        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Utilisateurs</h3>
            <p>Ajouter un utilisateur</p>
            <button  className="btn-user" onClick={() => setShowUserForm(true)}>Créer un utilisateur</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Paramètres</h3>
            <p>Gérer les utilisateurs</p>
            <button className="btn-user"  onClick={() => setShowUserList(true)}>Gérer</button>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <div className="section-header">
            <h3>📍 Carte des Problèmes Routiers</h3>
            <p>{loading ? 'Chargement...' : `${problemes.length} problème(s) détecté(s)`}</p>
          </div>

          <Map
            center={[-18.8792, 47.5079]}
            zoom={13}
            height="500px"
            markers={problemes.map(p => ({
              position: [parseFloat(p.latitude), parseFloat(p.longitude)],
              data: p,
              tooltip: p.status,
              popup: `
                <strong>Status:</strong> ${p.status}<br/>
                <strong>Lat:</strong> ${p.latitude}<br/>
                <strong>Lng:</strong> ${p.longitude}
              `
            }))}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </main>

      {/* Modals */}
      {showUserForm && <UserForm onClose={() => setShowUserForm(false)} onUserCreated={handleUserCreated} />}
      {showUserList && <UserList onClose={() => setShowUserList(false)} />}
      {selectedProbleme && <ProblemeModal probleme={selectedProbleme} onClose={() => setSelectedProbleme(null)} onUpdate={handleProblemeUpdate} />}

    </div>
  );
}

export default Dashboard;
