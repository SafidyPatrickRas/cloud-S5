import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { mockDataService } from '../services/mockData';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const antananarivoCenter = [-18.8792, 47.5079];
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('carte');
  const [problemes, setProblemes] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProbleme, setSelectedProbleme] = useState(null);
  const [users, setUsers] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ loading: false, message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const problemesData = await mockDataService.getProblemes();
    const statsData = await mockDataService.getStatistiques();
    const entreprisesData = await mockDataService.getEntreprises();
    
    setProblemes(problemesData);
    setStats(statsData);
    setEntreprises(entreprisesData);
    
    // Mock users data
    setUsers([
      { id: 1, email: 'user1@test.mg', nom: 'Rakoto', prenom: 'Jean', blocked: true },
      { id: 2, email: 'user2@test.mg', nom: 'Rabe', prenom: 'Marie', blocked: false },
      { id: 3, email: 'user3@test.mg', nom: 'Randria', prenom: 'Paul', blocked: true },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSyncFirebase = async () => {
    setSyncStatus({ loading: true, message: 'Synchronisation en cours...' });
    
    // Simulation de synchronisation
    setTimeout(() => {
      setSyncStatus({ 
        loading: false, 
        message: 'Synchronisation réussie ! 5 nouveaux signalements récupérés.' 
      });
      loadData();
      
      setTimeout(() => setSyncStatus({ loading: false, message: '' }), 3000);
    }, 2000);
  };

  const handleUnblockUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, blocked: false } : user
    ));
  };

  const handleBlockUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, blocked: true } : user
    ));
  };

  const handleUpdateProbleme = (id, field, value) => {
    setProblemes(problemes.map(p => 
      p.id_probleme === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSaveProbleme = (probleme) => {
    console.log('Sauvegarde:', probleme);
    setSelectedProbleme(null);
    alert('Modifications enregistrées avec succès !');
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR MANAGER */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">RM</div>
            {!sidebarCollapsed && <span className="logo-text">RouteTracker Manager</span>}
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span className="toggle-icon">{sidebarCollapsed ? '›' : '‹'}</span>
          </button>
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

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!sidebarCollapsed && <div className="nav-section-title">Tableau de bord</div>}
            
            <button 
              className={`nav-item ${activeView === 'carte' ? 'active' : ''}`}
              onClick={() => setActiveView('carte')}
            >
              <span className="nav-icon-text">C</span>
              {!sidebarCollapsed && <span className="nav-label">Carte Interactive</span>}
            </button>

            <button 
              className={`nav-item ${activeView === 'signalements' ? 'active' : ''}`}
              onClick={() => setActiveView('signalements')}
            >
              <span className="nav-icon-text">S</span>
              {!sidebarCollapsed && <span className="nav-label">Gestion Signalements</span>}
            </button>

            <button 
              className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => setActiveView('users')}
            >
              <span className="nav-icon-text">U</span>
              {!sidebarCollapsed && <span className="nav-label">Utilisateurs</span>}
            </button>

            <button 
              className={`nav-item ${activeView === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveView('stats')}
            >
              <span className="nav-icon-text">T</span>
              {!sidebarCollapsed && <span className="nav-label">Statistiques</span>}
            </button>
          </div>

          {stats && (
            <div className="nav-section">
              {!sidebarCollapsed && <div className="nav-section-title">Aperçu Rapide</div>}
              
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
          <button onClick={handleLogout} className="btn-logout-sidebar">
            <span className="btn-icon-text">D</span>
            {!sidebarCollapsed && <span className="btn-text">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* HEADER */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="page-title">Manager Dashboard</h1>
            <p className="page-subtitle">
              Gestion des travaux routiers - {problemes.length} signalements
            </p>
          </div>
          <div className="header-right">
            <button 
              className="btn-sync" 
              onClick={handleSyncFirebase}
              disabled={syncStatus.loading}
            >
              <span className="sync-icon">{syncStatus.loading ? '⟳' : '↻'}</span>
              <span>Synchroniser Firebase</span>
            </button>
          </div>
        </header>

        {syncStatus.message && (
          <div className={`sync-message ${syncStatus.loading ? 'loading' : 'success'}`}>
            {syncStatus.message}
          </div>
        )}

        {/* CONTENT */}
        <main className="app-content">
          {/* VUE CARTE */}
          {activeView === 'carte' && (
            <div className="content-view map-view">
              <div className="view-header">
                <h2 className="view-title">Carte des Signalements</h2>
                <p className="view-description">Vue d'ensemble géographique de tous les problèmes routiers</p>
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
                        <strong>Statut:</strong> <span class="status-${probleme.status.toLowerCase()}">${probleme.status}</span><br/>
                        <strong>Surface:</strong> ${probleme.surface_m2} m²
                      </div>
                    `,
                    popup: `
                      <div class="map-popup">
                        <h4 class="popup-title">${probleme.lieu}</h4>
                        <p class="popup-item"><strong>Statut:</strong> ${probleme.status}</p>
                        <p class="popup-item"><strong>Surface:</strong> ${probleme.surface_m2} m²</p>
                        <p class="popup-description">${probleme.description}</p>
                      </div>
                    `
                  }))}
                />
              </div>
            </div>
          )}

          {/* VUE GESTION SIGNALEMENTS */}
          {activeView === 'signalements' && (
            <div className="content-view signalements-view">
              <div className="view-header">
                <h2 className="view-title">Gestion des Signalements</h2>
                <p className="view-description">Modifier les informations et statuts des problèmes routiers</p>
              </div>
              <div className="signalements-container">
                <div className="signalements-table-wrapper">
                  <table className="signalements-table">
                    <thead>
                      <tr>
                        <th>Lieu</th>
                        <th>Statut</th>
                        <th>Surface (m²)</th>
                        <th>Budget (Ar)</th>
                        <th>Entreprise</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemes.map(probleme => (
                        <tr key={probleme.id_probleme}>
                          <td>{probleme.lieu}</td>
                          <td>
                            <span className={`status-badge status-${probleme.status.toLowerCase()}`}>
                              {probleme.status}
                            </span>
                          </td>
                          <td>{probleme.surface_m2}</td>
                          <td>{(probleme.budget / 1000000).toFixed(1)} M</td>
                          <td>{entreprises.find(e => e.id_entreprise === probleme.id_entreprise)?.nom || 'Non assigné'}</td>
                          <td>
                            <button 
                              className="btn-edit"
                              onClick={() => setSelectedProbleme(probleme)}
                            >
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VUE UTILISATEURS */}
          {activeView === 'users' && (
            <div className="content-view users-view">
              <div className="view-header">
                <h2 className="view-title">Gestion des Utilisateurs</h2>
                <p className="view-description">Débloquer ou bloquer les utilisateurs de l'application</p>
              </div>
              <div className="users-container">
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.nom}</td>
                          <td>{user.prenom}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`user-status ${user.blocked ? 'blocked' : 'active'}`}>
                              {user.blocked ? 'Bloqué' : 'Actif'}
                            </span>
                          </td>
                          <td>
                            {user.blocked ? (
                              <button 
                                className="btn-unblock"
                                onClick={() => handleUnblockUser(user.id)}
                              >
                                Débloquer
                              </button>
                            ) : (
                              <button 
                                className="btn-block"
                                onClick={() => handleBlockUser(user.id)}
                              >
                                Bloquer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VUE STATISTIQUES */}
          {activeView === 'stats' && stats && (
            <div className="content-view stats-view">
              <div className="view-header">
                <h2 className="view-title">Statistiques Détaillées</h2>
                <p className="view-description">Vue d'ensemble des indicateurs de performance</p>
              </div>
              <div className="stats-container">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-header">Total Problèmes</div>
                    <div className="stat-card-value">{stats.nb_total_problemes}</div>
                  </div>
                  <div className="stat-card nouveau">
                    <div className="stat-card-header">Nouveaux</div>
                    <div className="stat-card-value">{stats.nb_nouveaux}</div>
                  </div>
                  <div className="stat-card encours">
                    <div className="stat-card-header">En Cours</div>
                    <div className="stat-card-value">{stats.nb_en_cours}</div>
                  </div>
                  <div className="stat-card termine">
                    <div className="stat-card-header">Terminés</div>
                    <div className="stat-card-value">{stats.nb_termines}</div>
                  </div>
                </div>
                
                <div className="stats-details">
                  <div className="detail-card">
                    <h3>Surface Totale</h3>
                    <p className="detail-value">{stats.total_surface_m2.toLocaleString('fr-FR')} m²</p>
                  </div>
                  <div className="detail-card">
                    <h3>Budget Total</h3>
                    <p className="detail-value">{(stats.total_budget / 1000000).toFixed(1)} Millions Ar</p>
                  </div>
                  <div className="detail-card">
                    <h3>Avancement Global</h3>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{width: `${stats.avancement_pct}%`}}>
                        {stats.avancement_pct}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL MODIFICATION SIGNALEMENT */}
      {selectedProbleme && (
        <div className="modal-overlay" onClick={() => setSelectedProbleme(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier le Signalement</h3>
              <button className="modal-close" onClick={() => setSelectedProbleme(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lieu</label>
                <input 
                  type="text" 
                  value={selectedProbleme.lieu}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, lieu: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Statut</label>
                <select 
                  value={selectedProbleme.status}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, status: e.target.value})}
                >
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="EN_COURS">En Cours</option>
                  <option value="TERMINE">Terminé</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Surface (m²)</label>
                <input 
                  type="number" 
                  value={selectedProbleme.surface_m2}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, surface_m2: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="form-group">
                <label>Budget (Ar)</label>
                <input 
                  type="number" 
                  value={selectedProbleme.budget}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, budget: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="form-group">
                <label>Entreprise</label>
                <select 
                  value={selectedProbleme.id_entreprise || ''}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, id_entreprise: parseInt(e.target.value)})}
                >
                  <option value="">Non assigné</option>
                  {entreprises.map(ent => (
                    <option key={ent.id_entreprise} value={ent.id_entreprise}>
                      {ent.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={selectedProbleme.description}
                  onChange={(e) => setSelectedProbleme({...selectedProbleme, description: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedProbleme(null)}>
                Annuler
              </button>
              <button className="btn-save" onClick={() => handleSaveProbleme(selectedProbleme)}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
