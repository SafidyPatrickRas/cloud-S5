  import axios from 'axios';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour ajouter le token aux requêtes
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs de réponse
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  const normalizeLabel = (value) =>
    String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')

  export const roleService = {
    getAll: async () => {
      try {
        const response = await api.get('/roles')
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des rôles:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`/roles/${id}`)
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du rôle:', error)
        throw error
      }
    }
  }

  export const statusService = {
    getAll: async () => {
      try {
        const response = await api.get('/statuses')
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des status:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`/statuses/${id}`)
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du status:', error)
        throw error
      }
    }
  }

  export const entrepriseService = {
    getAll: async () => {
      try {
        const response = await api.get('/entreprises')
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des entreprises:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`/entreprises/${id}`)
        return response.data
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'entreprise:', error)
        throw error
      }
    }
  }

  export const authService = {
    login: async (email, password) => {
      console.log('🔐 Tentative de login avec:', email);
      try {
        const response = await api.post('/login', { email, mdp: password });
        console.log('✅ Réponse du serveur:', response.data);

        const user = response.data.user
        if (user?.Id_role) {
          try {
            const role = await roleService.getById(user.Id_role)
            user.role = role
            user.role_libelle = role?.libelle
          } catch (roleError) {
            console.warn('⚠️ Impossible de charger le rôle:', roleError)
          }
        }

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('💾 Token stocké');
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          console.log('👤 Utilisateur stocké:', user);
        }
        return response.data;
      } catch (error) {
        console.error('❌ Erreur login:', error);
        throw error;
      }
    },

    register: async (email, password, Id_role, fire_user_id = '') => {
      console.log('📝 Tentative d\'inscription:', { fire_user_id, email, Id_role });
      try {
        const response = await api.post('/register', { 
          email,
          mdp: password,
          Id_role,
          fire_user_id
        });
        console.log('✅ Inscription réussie:', response.data);

        return response.data;
      } catch (error) {
        console.error('❌ Erreur inscription:', error);
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },

    getToken: () => {
      return localStorage.getItem('token');
    },

    getUser: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },

    isManager: () => {
      const user = authService.getUser();
      const label = user?.role?.libelle ?? user?.role_libelle ?? user?.role
      return normalizeLabel(label) == 'ADMIN' || user.role.niveau >= 10;
    }
  };
  export const userService = {
    getUsers: async () => {
      try {
        const response = await api.get('/utilisateurs');
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        throw error;
      }
    },

    updateUser: async (id, userData) => {
      try {
        const response = await api.put(`/utilisateurs/${id}`, userData);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
        throw error;
      }
    }
  };
  export const signalementService = { 
    getAll: async () => {
      try {
        const response = await api.get('/signalements');
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des signalements:', error);
        throw error;
      }
    },

    getUnassigned: async () => {
      try {
        const response = await api.get('/signalements-unassigned');
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des signalements non attribués:', error);
        throw error;
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`/signalements/${id}`);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du signalement:', error);
        throw error;
      }
    },

    create: async (signalementData) => {
      try {
        const response = await api.post('/signalements', signalementData);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la création du signalement:', error);
        throw error;
      }
    },

    update: async (id, signalementData) => {
      try {
        const response = await api.put(`/signalements/${id}`, signalementData);
        return response.data;
      }               catch (error) {   
        console.error('❌ Erreur lors de la mise à jour du signalement:', error);
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await api.delete(`/signalements/${id}`);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du signalement:', error);
        throw error;
      }
    }
  };
  export const problemeService = {
    getAll: async () => {
      try {
        const response = await api.get('/problemes');
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des problèmes:', error);
        throw error;
      }
    },

    getById: async (id) => {
      try {
        const response = await api.get(`/problemes/${id}`);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du problème:', error);
        throw error;
      }
    },

    create: async (problemeData) => {
      try {
        const response = await api.post('/problemes', problemeData);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la création du problème:', error);
        throw error;
      }
    },

    update: async (id, problemeData) => {
      try {
        const response = await api.put(`/problemes/${id}`, problemeData);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du problème:', error);
        throw error;
      }
    },

    delete: async (id) => {
      try {
        await api.delete(`/problemes/${id}`);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du problème:', error);
        throw error;
      }
    }
  };

  const parsePosition = (position) => {
    if (!position || typeof position !== 'string') return { latitude: null, longitude: null }
    const [latRaw, lngRaw] = position.split(',')
    const latitude = latRaw ? parseFloat(latRaw.trim()) : null
    const longitude = lngRaw ? parseFloat(lngRaw.trim()) : null
    return {
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null
    }
  }

  export const problemeViewService = {
    getAllWithDetails: async () => {
      try {
        const [problemes, statuses] = await Promise.all([
          problemeService.getAll(),
          statusService.getAll()
        ])

        const statusMap = new Map(
          statuses.map((st) => [String(st.Id_status ?? st.id_status ?? st.id), st])
        )

        const merged = problemes.map((p) => {
          const signalement = Array.isArray(p.signalements) ? p.signalements[0] : undefined
          const status = signalement?.status
            ?? statusMap.get(String(signalement?.Id_status ?? signalement?.id_status ?? ''))
          const user = signalement?.utilisateur

          const { latitude, longitude } = parsePosition(signalement?.position_)
          const statusLabel = status?.libelle ?? ''
          const normalizedStatus = normalizeLabel(statusLabel) || 'NOUVEAU'

          return {
            ...p,
            Id_probleme: p.Id_probleme ?? p.id_probleme ?? p.id,
            Id_signalement: signalement?.Id_signalement ?? signalement?.id_signalement,
            Id_status: signalement?.Id_status,
            status: normalizedStatus,
            status_label: statusLabel,
            latitude,
            longitude,
            surface_m2: p.surface ?? p.surface_m2,
            commentaire: signalement?.commentaire ?? p.commentaire,
            date_signalement: signalement?.create_at ?? signalement?.update_at ?? p.create_at,
            created_at: p.create_at ?? p.created_at,
            updated_at: p.update_at ?? p.updated_at,
            signale_par_email: user?.email
          }
        })

        return { problemes: merged, statuses }
      } catch (error) {
        console.error('❌ Erreur lors de la consolidation des problèmes:', error)
        throw error
      }
    }
  }

  export default api;
