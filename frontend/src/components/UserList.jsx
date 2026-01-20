import { useState, useEffect } from 'react';
import api from '../services/api';
import './UserList.css';

function UserList({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Charger la liste des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // L'API /users n'existe pas encore, utilisons une recherche ou créons-la
      // Pour l'instant, simulons avec l'endpoint qui existe
      const response = await api.get('/users');
      console.log('👥 Utilisateurs récupérés:', response.data);
      setUsers(response.data);
    } catch (err) {
      console.error('❌ Erreur récupération utilisateurs:', err);
      setError('Impossible de charger la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId, currentBlockedStatus) => {
    try {
      setActionLoading(userId);
      const newBlockedStatus = !currentBlockedStatus;
      
      console.log(`🔒 ${newBlockedStatus ? 'Blocage' : 'Déblocage'} de l'utilisateur ${userId}`);
      
      const response = await api.put(`/users/${userId}`, {
        blocked: newBlockedStatus
      });

      console.log('✅ Utilisateur mis à jour:', response.data);

      // Mettre à jour la liste locale
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, blocked: newBlockedStatus }
          : user
      ));

      // Message de succès
      alert(`Utilisateur ${newBlockedStatus ? 'bloqué' : 'débloqué'} avec succès`);
    } catch (err) {
      console.error('❌ Erreur lors du changement de statut:', err);
      alert('Erreur lors de la modification du statut');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gestion des utilisateurs</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="user-list-container">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={user.blocked ? 'user-blocked' : ''}>
                      <td>
                        <div className="user-email">
                          {user.email}
                        </div>
                      </td>
                      <td>{user.nom || '-'}</td>
                      <td>{user.prenom || '-'}</td>
                      <td>
                        <span className={`role-badge role-${user.role?.libelle?.toLowerCase()}`}>
                          {user.role?.libelle || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.blocked ? 'status-blocked' : 'status-active'}`}>
                          {user.blocked ? '🔒 Bloqué' : '✅ Actif'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn-action ${user.blocked ? 'btn-unblock' : 'btn-block'}`}
                          onClick={() => toggleBlockUser(user.id, user.blocked)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <span className="btn-spinner">⏳</span>
                          ) : user.blocked ? (
                            <>🔓 Débloquer</>
                          ) : (
                            <>🔒 Bloquer</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
          <button className="btn-primary" onClick={fetchUsers}>
            🔄 Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserList;
