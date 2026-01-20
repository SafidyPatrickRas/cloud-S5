import { useState, useEffect } from 'react';
import { problemeService } from '../services/api';
import api from '../services/api';
import './ProblemeModal.css';

function ProblemeModal({ probleme, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    status: '',
    surface_m2: '',
    budget: '',
    id_entreprise: ''
  });
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (probleme) {
      setFormData({
        status: probleme.status || 'NOUVEAU',
        surface_m2: probleme.surface_m2 || '',
        budget: probleme.budget || '',
        id_entreprise: probleme.id_entreprise || ''
      });
      loadEntreprises();
    }
  }, [probleme]);

  const loadEntreprises = async () => {
    try {
      const response = await api.get('/entreprises');
      setEntreprises(response.data);
    } catch (error) {
      console.error('❌ Erreur chargement entreprises:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Préparer les données à envoyer (uniquement les champs modifiés)
      const updateData = {};
      if (formData.status) updateData.status = formData.status;
      if (formData.surface_m2) updateData.surface_m2 = parseFloat(formData.surface_m2);
      if (formData.budget) updateData.budget = parseFloat(formData.budget);
      if (formData.id_entreprise) updateData.id_entreprise = parseInt(formData.id_entreprise);

      await problemeService.update(probleme.id_probleme, updateData);
      
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!probleme) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚧 Détails du Problème Routier</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="probleme-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>📍 Localisation</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Latitude:</strong>
                <span>{probleme.latitude}</span>
              </div>
              <div className="info-item">
                <strong>Longitude:</strong>
                <span>{probleme.longitude}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>⚙️ Informations</h3>
            
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="NOUVEAU">🔴 NOUVEAU</option>
                <option value="EN_COURS">🟠 EN COURS</option>
                <option value="TERMINE">🟢 TERMINÉ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="surface_m2">Surface (m²)</label>
              <input
                type="number"
                id="surface_m2"
                name="surface_m2"
                value={formData.surface_m2}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Ex: 25.50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget (MGA)</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                step="1000"
                min="0"
                placeholder="Ex: 5000000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_entreprise">Entreprise</label>
              <select
                id="id_entreprise"
                name="id_entreprise"
                value={formData.id_entreprise}
                onChange={handleChange}
              >
                <option value="">Aucune entreprise</option>
                {entreprises.map(entreprise => (
                  <option key={entreprise.id_entreprise} value={entreprise.id_entreprise}>
                    {entreprise.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>📅 Dates</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Créé le:</strong>
                <span>{new Date(probleme.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="info-item">
                <strong>Modifié le:</strong>
                <span>{new Date(probleme.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProblemeModal;
