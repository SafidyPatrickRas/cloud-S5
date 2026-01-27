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

export const authService = {
  login: async (email, password) => {
    console.log('🔐 Tentative de login avec:', email);
    try {
      const response = await api.post('/login', { email, password });
      console.log('✅ Réponse du serveur:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('💾 Token stocké');
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('👤 Utilisateur stocké:', response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  register: async (email, password, role_id, nom = '', prenom = '') => {
    console.log('📝 Tentative d\'inscription:', { email, role_id, nom, prenom });
    try {
      const response = await api.post('/register', { 
        email, 
        password, 
        role_id,
        nom,
        prenom
      });
      console.log('✅ Inscription réussie:', response.data);
      
      // Ne pas stocker automatiquement le token lors de la création par un admin
      // if (response.data.token) {
      //   localStorage.setItem('token', response.data.token);
      // }
      // if (response.data.user) {
      //   localStorage.setItem('user', JSON.stringify(response.data.user));
      // }
      
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
    return user && user.role === 'MANAGER';
  }
};
export const userService = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
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

export default api;
