import { Link } from 'react-router-dom';
import Map from '../components/Map';
import './Home.css';

function Home() {
  // Coordonnées d'Antananarivo (centre-ville)
  const antananarivoCenter = [-18.8792, 47.5079];
  
  // Quelques marqueurs d'exemple pour Antananarivo
  const markers = [
    {
      position: [-18.8792, 47.5079],
      popup: '<b>Analakely</b><br>Centre-ville d\'Antananarivo'
    },
    {
      position: [-18.9134, 47.5361],
      popup: '<b>Ivato</b><br>Aéroport International'
    }
  ];

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
          <h2 className="hero-title">Bienvenue à Antananarivo</h2>
          <p className="hero-subtitle">
            Explorez la carte interactive de la capitale ou connectez-vous en tant que manager
          </p>
        </section>

        {/* Section Carte Interactive */}
        <section className="map-section">
          <h3 className="section-title">Carte Interactive d'Antananarivo</h3>
          <p className="section-description">
            Explorez les rues et quartiers de la capitale de Madagascar
          </p>
          <Map 
            center={antananarivoCenter} 
            zoom={13} 
            height="600px"
            markers={markers}
          />
        </section>

        <section className="visitor-section">
          <h3 className="section-title">Section Visiteurs</h3>
          <div className="cards-container">
            <div className="card">
              <div className="card-icon">📍</div>
              <h4 className="card-title">Carte Interactive</h4>
              <p className="card-description">
                Explorez les données géographiques disponibles publiquement
              </p>
            </div>

            <div className="card">
              <div className="card-icon">📊</div>
              <h4 className="card-title">Statistiques</h4>
              <p className="card-description">
                Consultez les statistiques et analyses publiques
              </p>
            </div>

            <div className="card">
              <div className="card-icon">ℹ️</div>
              <h4 className="card-title">Informations</h4>
              <p className="card-description">
                Découvrez plus d'informations sur nos services
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
