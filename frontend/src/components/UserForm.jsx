import { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import './UserForm.css';

function UserForm({ onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role_id: ''
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger la liste des rôles au montage du composant
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        console.log('📋 Rôles récupérés:', response.data);
        setRoles(response.data);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des rôles:', err);
        setError('Impossible de charger les rôles');
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('📤 Envoi des données:', formData);
      const response = await authService.register(
        formData.email,
        formData.password,
        parseInt(formData.role_id),
        formData.nom,
        formData.prenom
      );
      
      console.log('✅ Utilisateur créé:', response);
      setSuccess('Utilisateur créé avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role_id: ''
      });

      // Notifier le parent
      if (onUserCreated) {
        onUserCreated(response.user);
      }

      // Fermer après 2 secondes
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur création utilisateur:', err);
      
      if (err.response?.data?.errors) {
        // Erreurs de validation Laravel
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de la création de l\'utilisateur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un utilisateur</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="utilisateur@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Au moins 6 caractères"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role_id">Rôle *</label>
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Sélectionner un rôle --</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
