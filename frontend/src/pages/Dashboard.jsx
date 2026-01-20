import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Manager</h1>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Bienvenue dans votre espace de gestion</h2>
          <p>Vous êtes connecté avec succès !</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Utilisateurs</h3>
            <p>Gérer les utilisateurs du système</p>
            <button className="btn-card">Accéder</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔐</div>
            <h3>Rôles</h3>
            <p>Gérer les rôles et permissions</p>
            <button className="btn-card">Accéder</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Statistiques</h3>
            <p>Voir les statistiques d'utilisation</p>
            <button className="btn-card">Accéder</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Paramètres</h3>
            <p>Configurer l'application</p>
            <button className="btn-card">Accéder</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
