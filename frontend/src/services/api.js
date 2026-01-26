import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, token, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getProblemes: async () => {
    try {
      const response = await api.get('/problemes');
      return response.data.map(probleme => ({
        id_probleme: probleme.id_probleme,
        latitude: parseFloat(probleme.latitude),
        longitude: parseFloat(probleme.longitude),
        status: probleme.status,
        surface_m2: parseFloat(probleme.surface_m2) || 0,
        budget: parseFloat(probleme.budget) || 0,
        id_entreprise: probleme.id_entreprise,
        created_at: probleme.created_at,
        updated_at: probleme.updated_at,
        lieu: probleme.lieu || 'Position: ' + probleme.latitude + ', ' + probleme.longitude,
        description: probleme.commentaire || 'Aucune description disponible'
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des problèmes:', error);
      throw error;
    }
  },

  getStatistiques: async () => {
    try {
      const problemes = await apiService.getProblemes();
      
      const stats = {
        nb_total_problemes: problemes.length,
        nb_nouveaux: problemes.filter(p => p.status === 'NOUVEAU').length,
        nb_en_cours: problemes.filter(p => p.status === 'EN_COURS').length,
        nb_termines: problemes.filter(p => p.status === 'TERMINE').length,
        total_surface_m2: problemes.reduce((sum, p) => sum + (p.surface_m2 || 0), 0),
        total_budget: problemes.reduce((sum, p) => sum + (p.budget || 0), 0),
      };

      stats.avancement_pct = stats.nb_total_problemes > 0 
        ? Math.round((stats.nb_termines / stats.nb_total_problemes) * 100)
        : 0;

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  },

  getEntreprises: async () => {
    try {
      const response = await api.get('/entreprises');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      throw error;
    }
  },

  updateProblemeStatus: async (id, status) => {
    try {
      const response = await api.put('/problemes/' + id, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  updateProbleme: async (id, problemeData) => {
    try {
      const response = await api.put('/problemes/' + id, problemeData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du problème:', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.post('/reset-block/' + userId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'utilisateur:', error);
      throw error;
    }
  },

  syncWithFirebase: async () => {
    try {
      console.log('Synchronisation Firebase pas encore implémentée');
      return { success: true, message: 'Synchronisation simulée' };
    } catch (error) {
      console.error('Erreur lors de la synchronisation Firebase:', error);
      throw error;
    }
  }
};

export default api;
