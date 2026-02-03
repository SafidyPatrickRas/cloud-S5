import { useEffect, useState } from 'react'
import { entrepriseService, problemeService, signalementService, statusService } from '../services/api'
import './SignalementAssignModal.css'

const normalizeLabel = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')

function SignalementAssignModal({ signalement, onClose, onAssigned }) {
  const [formData, setFormData] = useState({
    budget: '',
    surface: '',
    Id_entreprise: ''
  })
  const [entreprises, setEntreprises] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!signalement) return

    const loadData = async () => {
      try {
        const [entreprisesData, statusesData] = await Promise.all([
          entrepriseService.getAll(),
          statusService.getAll()
        ])
        setEntreprises(entreprisesData)
        setStatuses(statusesData)
      } catch (err) {
        console.error('❌ Erreur chargement données:', err)
        setError('Impossible de charger les données')
      }
    }

    loadData()
  }, [signalement])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!signalement) return

    setLoading(true)
    setError('')

    try {
      const payload = {
        Id_entreprise: parseInt(formData.Id_entreprise),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        surface: formData.surface ? parseFloat(formData.surface) : undefined,
        Id_signalement: signalement.Id_signalement
      }

      await problemeService.create(payload)

      const inProgress = statuses.find((status) => normalizeLabel(status.libelle) === 'EN_COURS')
      if (inProgress?.Id_status) {
        await signalementService.update(signalement.Id_signalement, {
          Id_status: inProgress.Id_status
        })
      }

      if (onAssigned) {
        onAssigned()
      }
      onClose()
    } catch (err) {
      console.error('❌ Erreur attribution problème:', err)
      setError(err.response?.data?.message || 'Erreur lors de l\'attribution')
    } finally {
      setLoading(false)
    }
  }

  if (!signalement) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Attribuer un problème</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="assign-meta">
          <p><strong>Signalement:</strong> #{signalement.Id_signalement}</p>
          <p><strong>Commentaire:</strong> {signalement.commentaire || '—'}</p>
        </div>

        <form onSubmit={handleSubmit} className="assign-form">
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Entreprise *</label>
            <select
              name="Id_entreprise"
              value={formData.Id_entreprise}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {entreprises.map((entreprise) => (
                <option key={entreprise.Id_entreprise} value={entreprise.Id_entreprise}>
                  {entreprise.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Surface (m²)</label>
            <input
              type="number"
              name="surface"
              value={formData.surface}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Budget (MGA)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              step="1000"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Attribution...' : 'Attribuer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignalementAssignModal
