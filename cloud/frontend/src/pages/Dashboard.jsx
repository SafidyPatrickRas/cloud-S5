import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, problemeViewService, signalementService } from '../services/api'
import UserForm from '../components/UserForm'
import UserList from '../components/UserList'
import ProblemeModal from '../components/ProblemeModal'
import SignalementAssignModal from '../components/SignalementAssignModal'
import Map from '../components/Map'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [showUserForm, setShowUserForm] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const [problemes, setProblemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusOptions, setStatusOptions] = useState([])
  const [selectedProbleme, setSelectedProbleme] = useState(null)
  const [selectedSignalement, setSelectedSignalement] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ loading: false, message: '' })
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [signalements, setSignalements] = useState([])
  const [allSignalements, setAllSignalements] = useState([])
  const [loadingSignalements, setLoadingSignalements] = useState(false)

  useEffect(() => {
    loadProblemes()
    loadSignalements()
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadProblemes = async () => {
    try {
      setLoading(true)
      const { problemes: data, statuses } = await problemeViewService.getAllWithDetails()
      console.log('📍 Problèmes chargés:', data)
      setProblemes(data)
      const options = Array.from(
        new Set(
          statuses
            .map((status) => String(status?.libelle ?? '').trim())
            .filter(Boolean)
            .map((label) => label.toUpperCase().replace(/\s+/g, '_'))
        )
      )
      setStatusOptions(options)
    } catch (error) {
      console.error('❌ Erreur chargement problèmes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSignalements = async () => {
    try {
      setLoadingSignalements(true)
      const [unassigned, allData] = await Promise.all([
        signalementService.getUnassigned(),
        signalementService.getAll()
      ])
      setSignalements(unassigned)
      setAllSignalements(allData)
    } catch (error) {
      console.error('❌ Erreur chargement signalements:', error)
    } finally {
      setLoadingSignalements(false)
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

  const handleSignalementAssigned = () => {
    loadProblemes()
    loadSignalements()
  }

  const filteredProblemes = useMemo(() => {
    return problemes.filter((p) => {
      const statusOk = filterStatus === 'ALL' || p.status === filterStatus
      const searchOk = !searchText ||
        `${p.status} ${p.commentaire ?? ''} ${p.signale_par_email ?? ''} ${p.signale_par_nom ?? ''}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      const date = p.date_signalement ? new Date(p.date_signalement) : null
      const fromOk = !dateFrom || (date && date >= new Date(dateFrom))
      const toOk = !dateTo || (date && date <= new Date(dateTo))
      return statusOk && searchOk && fromOk && toOk
    })
  }, [problemes, filterStatus, searchText, dateFrom, dateTo])

  const normalizeLabel = (value) =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')

  const statusStats = useMemo(() => {
    const base = statusOptions.length
      ? Object.fromEntries(statusOptions.map((status) => [status, 0]))
      : { NOUVEAU: 0, EN_COURS: 0, TERMINE: 0 }
    allSignalements.forEach((signalement) => {
      const label = normalizeLabel(signalement?.status?.libelle)
      if (base[label] !== undefined) base[label] += 1
    })
    return base
  }, [allSignalements, statusOptions])

  const trendData = useMemo(() => {
    const days = 7
    const now = new Date()
    const labels = []
    const counts = []
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      labels.push(key)
      counts.push(0)
    }
    filteredProblemes.forEach((p) => {
      if (!p.date_signalement) return
      const key = new Date(p.date_signalement).toISOString().slice(0, 10)
      const index = labels.indexOf(key)
      if (index >= 0) counts[index] += 1
    })
    return { labels, counts }
  }, [filteredProblemes])

  const handleSyncFirebase = async () => {
    setSyncStatus({ loading: true, message: 'Synchronisation en cours...' })
    try {
      await import('../services/firebaseSync').then(module => module.syncService.syncAll())
      // Recharger les problèmes depuis l'API après la sync
      await loadProblemes()
      setSyncStatus({ loading: false, message: '✅ Synchronisation réussie !' })
    } catch (err) {
      console.error('❌ Erreur de synchronisation :', err)
      setSyncStatus({ loading: false, message: '❌ Erreur de synchronisation' })
    }
    setTimeout(() => setSyncStatus({ loading: false, message: '' }), 3000)
  }

  const maxTrend = Math.max(...trendData.counts, 1)

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-orb" />
          <span>Cloud Feno</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item" onClick={() => setShowUserList(true)}>Utilisateurs</button>
          <button className="nav-item" onClick={() => setShowUserForm(true)}>Créer un utilisateur</button>
          <button className="nav-item" onClick={handleLogout}>Déconnexion</button>
        </nav>
        <div className="sidebar-card">
          <p>Synchronisation</p>
          {isOnline ? (
            <button className="btn-neon" onClick={handleSyncFirebase}>
              {syncStatus.loading ? 'Synchronisation...' : 'Sync Firebase'}
            </button>
          ) : (
            <span className="text-muted">Connexion internet requise</span>
          )}
          {syncStatus.message && <span className="text-muted">{syncStatus.message}</span>}
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <h1>Dashboard Manager</h1>
            <p>Surveillance intelligente des problèmes routiers</p>
          </div>
          <div className="status-pill">
            <span className={`dot ${isOnline ? 'online' : 'offline'}`} />
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </div>
        </header>

        <section className="filters-panel">
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Tous</option>
              {(statusOptions.length ? statusOptions : ['NOUVEAU', 'EN_COURS', 'TERMINE']).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="email, commentaire, statut..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Date début</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Date fin</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total affiché</span>
            <span className="stat-value">{filteredProblemes.length}</span>
          </div>
          <div className="stat-card status-nouveau">
            <span className="stat-label">Nouveaux</span>
            <span className="stat-value">{statusStats.NOUVEAU}</span>
          </div>
          <div className="stat-card status-en-cours">
            <span className="stat-label">En cours</span>
            <span className="stat-value">{statusStats.EN_COURS}</span>
          </div>
          <div className="stat-card status-termine">
            <span className="stat-label">Terminés</span>
            <span className="stat-value">{statusStats.TERMINE}</span>
          </div>
        </section>

        <section className="charts-grid">
          <div className="chart-card">
            <h3>Répartition par statut</h3>
            <div className="bars">
              {(statusOptions.length ? statusOptions : ['NOUVEAU', 'EN_COURS', 'TERMINE']).map((status) => {
                const value = statusStats[status]
                const total = Math.max(allSignalements.length, 1)
                const width = Math.round((value / total) * 100)
                return (
                  <div className="bar-row" key={status}>
                    <span>{status}</span>
                    <div className={`bar-track ${status.toLowerCase().replace('_', '-')}`}>
                      <div className="bar-fill" style={{ width: `${width}%` }} />
                    </div>
                    <strong>{value}</strong>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="chart-card">
            <h3>Signalements (7 jours)</h3>
            <div className="sparkline">
              {trendData.counts.map((value, index) => (
                <div key={trendData.labels[index]} className="spark-col">
                  <div
                    className="spark-bar"
                    style={{ height: `${(value / maxTrend) * 100}%` }}
                    title={`${trendData.labels[index]}: ${value}`}
                  />
                </div>
              ))}
            </div>
            <div className="sparkline-labels">
              {trendData.labels.map((label, index) => (
                <span key={label} className={index % 2 === 0 ? 'show' : ''}>
                  {label.slice(5)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="signalement-section">
          <div className="section-header">
            <h3>📌 Signalements en attente</h3>
            <p>
              {loadingSignalements
                ? 'Chargement des signalements...'
                : `${signalements.length} signalement(s) non attribué(s)`}
            </p>
          </div>

          {loadingSignalements ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement en cours...</p>
            </div>
          ) : signalements.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🚫</span>
              <p>Tous les signalements sont traités</p>
            </div>
          ) : (
            <div className="signalement-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Commentaire</th>
                    <th>Utilisateur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {signalements.map((signalement) => (
                    <tr key={signalement.Id_signalement}>
                      <td>#{signalement.Id_signalement}</td>
                      <td>{signalement.status?.libelle || '-'}</td>
                      <td>{signalement.commentaire || '-'}</td>
                      <td>{signalement.utilisateur?.email || '-'}</td>
                      <td>
                        <button
                          className="btn-action btn-block"
                          onClick={() => setSelectedSignalement(signalement)}
                        >
                          Traiter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="map-section">
          <div className="section-header">
            <h3>📍 Carte des Problèmes Routiers</h3>
            <p>
              {loading ? 'Chargement des problèmes...' : `${filteredProblemes.length} problème(s) filtré(s)`}
            </p>
          </div>
          <Map 
            center={[-18.8792, 47.5079]}
            zoom={13}
            height="520px"
            onMarkerClick={handleMarkerClick}
            markers={filteredProblemes
              .filter(prob => Number.isFinite(parseFloat(prob.latitude)) && Number.isFinite(parseFloat(prob.longitude)))
              .map(prob => ({
              position: [parseFloat(prob.latitude), parseFloat(prob.longitude)],
              data: prob,
              tooltip: `
                <div style="text-align: center;">
                  <strong>${prob.status}</strong><br/>
                  <div style="font-size: 2em;"> ${prob.surface_m2 ?? '-'} m²</div>
                  ${prob.date_signalement ? `<small>${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}</small>` : ''}
                </div>
              `,
              tooltipPermanent: true,
              popup: `
                <div style="min-width: 220px;">
                  <strong style="color: #9f7aea; font-size: 1.1em;"> Problème Routier</strong><br/>
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid rgba(148, 163, 184, 0.35);"/>
                  <strong>Status:</strong> <span style="color: ${prob.status === 'NOUVEAU' ? '#f87171' : prob.status === 'EN_COURS' ? '#fb923c' : '#4ade80'};">${prob.status}</span><br/>
                  ${prob.surface_m2 ? `<strong>Surface:</strong> ${prob.surface_m2} m²<br/>` : ''}
                  ${prob.budget ? `<strong>Budget:</strong> ${new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'MGA', minimumFractionDigits: 0}).format(prob.budget)}<br/>` : ''}
                  ${prob.signale_par_email ? `<strong>Signalé par:</strong> <small>${prob.signale_par_email}</small><br/>` : ''}
                  ${prob.date_signalement ? `<strong>Date:</strong> ${new Date(prob.date_signalement).toLocaleDateString('fr-FR')}<br/>` : ''}
                  ${prob.commentaire ? `<strong>Commentaire:</strong> ${prob.commentaire}<br/>` : ''}
                  <hr style="margin: 8px 0; border: none; border-top: 1px solid rgba(148, 163, 184, 0.35);"/>
                  <small style="color: #94a3b8;">Cliquez pour modifier</small>
                </div>
              `
            }))}
          />
        </section>
      </main>

      {showUserForm && <UserForm onClose={() => setShowUserForm(false)} onUserCreated={handleUserCreated} />}
      {showUserList && <UserList onClose={() => setShowUserList(false)} />}
      {selectedProbleme && <ProblemeModal probleme={selectedProbleme} onClose={() => setSelectedProbleme(null)} onUpdate={handleProblemeUpdate} />}
      {selectedSignalement && (
        <SignalementAssignModal
          signalement={selectedSignalement}
          onClose={() => setSelectedSignalement(null)}
          onAssigned={handleSignalementAssigned}
        />
      )}
    </div>
  )
}

export default Dashboard
