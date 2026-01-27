import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, problemeService } from '../services/api'
import { firebaseService } from '../services/firebaseService'
import UserForm from '../components/UserForm'
import UserList from '../components/UserList'
import ProblemeModal from '../components/ProblemeModal'
import Map from '../components/Map'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [showUserForm, setShowUserForm] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [problemes, setProblemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProbleme, setSelectedProbleme] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ loading: false, message: '' })

  useEffect(() => {
    loadProblemes()
  }, [])

  const loadProblemes = async () => {
    try {
      setLoading(true)
      const data = await problemeService.getAll()
      console.log('📍 Problèmes chargés:', data)
      setProblemes(data)
    } catch (error) {
      console.error('❌ Erreur chargement problèmes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  const handleUserCreated = (user) => {
    console.log('👤 Nouvel utilisateur créé:', user)
  }

  const handleMarkerClick = (probleme) => {
    console.log('🗺️ Marqueur cliqué:', probleme)
    setSelectedProbleme(probleme)
  }

  const handleProblemeUpdate = () => {
    console.log('✅ Problème mis à jour, rechargement...')
    loadProblemes()
  }

  const handleSyncFirebase = async () => {
    setSyncStatus({ loading: true, message: 'Synchronisation en cours...' })
    try {
      await import('../services/firebaseSync').then(module => module.syncService.syncAll())
      // Recharger les problèmes depuis Firebase après la sync
      const firebaseData = await firebaseService.getProblemes()
      const userData = await firebaseService.getUsers()
      const signalementData = await firebaseService.getSignalements()
      setProblemes(firebaseData)
      setSyncStatus({ loading: false, message: '✅ Synchronisation réussie !' })
    } catch (err) {
      console.error('❌ Erreur de synchronisation :', err)
      setSyncStatus({ loading: false, message: '❌ Erreur de synchronisation' })
    }
    setTimeout(() => setSyncStatus({ loading: false, message: '' }), 3000)
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Manager</h1>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
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
            <p>Ajouter un utilisateur</p>
            <button className="btn-card" onClick={() => setShowUserForm(true)}>Créer un utilisateur</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Paramètres</h3>
            <p>Gérer et paramétrer les utilisateurs</p>
            <button className="btn-card" onClick={() => setShowUserList(true)}>Gérer les utilisateurs</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">☁️</div>
            <h3>Synchronisation</h3>
            <p>Envoyer les données vers Firebase</p>
            <button className="btn-card" onClick={handleSyncFirebase}>
              {syncStatus.loading ? 'Synchronisation...' : 'Sync Firebase'}
            </button>
            {syncStatus.message && <p className="sync-message">{syncStatus.message}</p>}
          </div>
        </div>

        <div className="map-section">
          <div className="section-header">
            <h3>📍 Carte des Problèmes Routiers</h3>
            <p>
              {loading ? 'Chargement des problèmes...' : `${problemes.length} problème(s) routier(s) détecté(s)`}
            </p>
          </div>
          <Map 
            center={[-18.8792, 47.5079]}
            zoom={13}
            height="500px"
            onMarkerClick={handleMarkerClick}
            markers={problemes.map(prob => ({
              position: [parseFloat(prob.latitude), parseFloat(prob.longitude)],
              data: prob,
              tooltip: `
                <div style="text-align: center;">
                  <strong>${prob.status}</strong><br/>
                  <div style="font-size: 2em;">🚧 ${prob.surface_m2} m²</div>
                  <small>${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}</small>
                </div>
              `,
              tooltipPermanent: true,
              popup: `
                <div style="min-width: 220px;">
                  <strong style="color: #667eea; font-size: 1.1em;">🚧 Problème Routier</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                  <strong>Status:</strong> <span style="color: ${prob.status === 'NOUVEAU' ? '#e53e3e' : prob.status === 'EN_COURS' ? '#dd6b20' : '#38a169'};">${prob.status}</span><br/>
                  ${prob.surface_m2 ? `<strong>Surface:</strong> ${prob.surface_m2} m²<br/>` : ''}
                  ${prob.budget ? `<strong>Budget:</strong> ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'MGA', minimumFractionDigits: 0}).format(prob.budget)}<br/>` : ''}
                  ${prob.signale_par_email ? `<strong>Signalé par:</strong> ${prob.signale_par_nom} ${prob.signale_par_prenom || ''}<br/><small>${prob.signale_par_email}</small><br/>` : ''}
                  ${prob.date_signalement ? `<strong>Date:</strong> ${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}<br/>` : ''}
                  ${prob.commentaire ? `<strong>Commentaire:</strong> ${prob.commentaire}<br/>` : ''}
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                  <small style="color: #718096;">Cliquez pour modifier</small>
                </div>
              `
            }))}
          />
        </div>
      </main>

      {showUserForm && <UserForm onClose={() => setShowUserForm(false)} onUserCreated={handleUserCreated} />}
      {showUserList && <UserList onClose={() => setShowUserList(false)} />}
      {selectedProbleme && <ProblemeModal probleme={selectedProbleme} onClose={() => setSelectedProbleme(null)} onUpdate={handleProblemeUpdate} />}
    </div>
  )
}

export default Dashboard
