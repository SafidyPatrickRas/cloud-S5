// src/components/UserForm.jsx
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import api from '../services/api';
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
        setRoles(response.data);
      } catch (err) {
        console.error('Erreur récupération des rôles:', err);
        setError('Impossible de charger les rôles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let firebaseUser = null;

    try {
      // 1️⃣ Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;
      console.log('✅ Firebase Auth UID:', uid);

      // 2️⃣ Créer le document Firestore lié à l'utilisateur
      await setDoc(doc(db, "users", uid), {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        role_id: parseInt(formData.role_id),
        createdAt: serverTimestamp()
      });
      console.log('✅ Document Firestore créé');

      setSuccess('Utilisateur créé avec succès !');

      // Réinitialiser le formulaire
      setFormData({ email: '', password: '', nom: '', prenom: '', role_id: '' });

      // Notifier le parent
      if (onUserCreated) {
        onUserCreated({ uid, ...formData });
      }

      // Fermer après 2 secondes
      setTimeout(() => { if (onClose) onClose(); }, 2000);

    } catch (err) {
      console.error('❌ Erreur création utilisateur Firebase:', err);

      // Rollback si Auth a créé l'utilisateur mais Firestore a échoué
      if (firebaseUser && err.code !== 'auth/email-already-in-use') {
        try {
          await deleteUser(firebaseUser);
          console.log('♻️ Utilisateur Firebase supprimé en rollback');
        } catch (delErr) {
          console.error('❌ Erreur rollback:', delErr);
        }
      }

      // Affichage de l'erreur
      setError(err.message || 'Une erreur est survenue lors de la création de l\'utilisateur');
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} placeholder="Doe" disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="John" disabled={loading} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="utilisateur@example.com" required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Au moins 6 caractères" required minLength={6} disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="role_id">Rôle *</label>
            <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} required disabled={loading}>
              <option value="">-- Sélectionner un rôle --</option>
              {roles.map(role => (<option key={role.id} value={role.id}>{role.libelle}</option>))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Création...' : 'Créer l\'utilisateur'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
