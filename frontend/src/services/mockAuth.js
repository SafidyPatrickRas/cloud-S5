// Service d'authentification simulé pour les tests (sans backend)
// ⚠️ À REMPLACER par la vraie API en production !

const mockUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "manager@travaux.mg",
    password: "password123", // ⚠️ En prod, ne JAMAIS stocker en clair !
    nom: "Rakoto",
    prenom: "Jean",
    role: "MANAGER",
    blocked: false
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "user@travaux.mg",
    password: "password123",
    nom: "Rabe",
    prenom: "Marie",
    role: "UTILISATEUR",
    blocked: false
  }
];

// Simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  // Login simulé
  login: async (email, password) => {
    await delay(500); // Simuler le temps de réponse réseau

    const user = mockUsers.find(u => u.email === email);

    // Utilisateur non trouvé
    if (!user) {
      throw {
        response: {
          status: 401,
          data: { error: 'Email ou mot de passe invalide' }
        }
      };
    }

    // Utilisateur bloqué
    if (user.blocked) {
      throw {
        response: {
          status: 423,
          data: { error: 'Compte bloqué. Veuillez réessayer plus tard.' }
        }
      };
    }

    // Mot de passe incorrect
    if (user.password !== password) {
      throw {
        response: {
          status: 401,
          data: { error: 'Email ou mot de passe invalide' }
        }
      };
    }

    // Succès - Générer un faux token JWT
    const fakeToken = `fake-jwt-token-${user.id}-${Date.now()}`;
    
    return {
      token: fakeToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    };
  },

  // Vérifier si un token est valide (simulé)
  verifyToken: async (token) => {
    await delay(200);
    
    if (!token || !token.startsWith('fake-jwt-token-')) {
      return false;
    }
    
    return true;
  },

  // Récupérer les infos utilisateur depuis le token (simulé)
  getUserFromToken: async (token) => {
    await delay(200);
    
    if (!token || !token.startsWith('fake-jwt-token-')) {
      throw new Error('Token invalide');
    }

    // Extraire l'ID du token
    const parts = token.split('-');
    const userId = parts[3];
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role
    };
  }
};

export default mockAuthService;
