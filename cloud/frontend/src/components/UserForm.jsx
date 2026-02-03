// src/components/UserForm.jsx
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import api from '../services/api';
import './UserForm.css';

function UserForm({ onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    Id_role: ''
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🔹 Charger les rôles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les rôles');
      }
    };
    fetchRoles();
  }, []);

  // 🔹 Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let firebaseUser = null;

    try {
      // 1️⃣ Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      firebaseUser = userCredential.user;
      const firebaseUid = firebaseUser.uid;

      console.log('✅ Firebase UID:', firebaseUid);

      // 2️⃣ Laravel API
      await api.post('/register', {
        email: formData.email,
        mdp: formData.password,
        Id_role: parseInt(formData.Id_role),
        fire_user_id: firebaseUid
      });

      setSuccess('Utilisateur créé avec succès ✅');

      // Reset
      setFormData({
        email: '',
        password: '',
        Id_role: ''
      });

      if (onUserCreated) {
        onUserCreated({
          email: formData.email,
          Id_role: formData.Id_role,
          fire_user_id: firebaseUid
        });
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur création utilisateur:', err);

      // ♻️ Rollback Firebase
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
          console.log('♻️ Rollback Firebase effectué');
        } catch (rollbackErr) {
          console.error('❌ Erreur rollback Firebase:', rollbackErr);
        }
      }

      setError(
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de la création de l’utilisateur'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un utilisateur</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">

          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Rôle *</label>
            <select
              name="Id_role"
              value={formData.Id_role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Sélectionner un rôle --</option>
              {roles.map(role => (
                <option key={role.Id_role} value={role.Id_role}>
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
              {loading ? 'Création...' : 'Créer l’utilisateur'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default UserForm;
