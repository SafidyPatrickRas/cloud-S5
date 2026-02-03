import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      console.log('Response reçue:', response); // Debug

      // Vérifier si l'utilisateur est un MANAGER
      if (!authService.isManager()) {
        setError('Accès refusé. Cette page est réservée aux managers uniquement.');
        authService.logout(); // Supprimer le token
        setLoading(false);
        return;
      }

      // Rediriger vers le dashboard après connexion réussie
      navigate('/dashboard');
    } catch (err) {
      // Gérer les différents types d'erreurs
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data.error;

        if (status === 423) {
          setError('Compte bloqué. Veuillez réessayer plus tard.');
        } else if (status === 401) {
          setError('Email ou mot de passe invalide.');
        } else {
          setError(message || 'Une erreur est survenue lors de la connexion.');
        }
      } else {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Connexion Manager</h1>
          <p>Accédez à votre espace de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>

        <div className="login-info">
          <p>
            <strong>Note:</strong> Après 3 tentatives échouées, votre compte sera bloqué pendant 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
