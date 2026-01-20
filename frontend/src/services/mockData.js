// Service pour utiliser les données de test JSON avant la connexion à la vraie base de données

// Charger les données de test depuis le dossier public
let testData = null;

const loadTestData = async () => {
  if (!testData) {
    const response = await fetch('/test-data.json');
    testData = await response.json();
  }
  return testData;
};

export const mockDataService = {
  // Récupérer tous les problèmes routiers
  getProblemes: async () => {
    const data = await loadTestData();
    return data.problemes_routiers;
  },

  // Récupérer un problème par ID
  getProblemeById: async (id) => {
    const data = await loadTestData();
    const probleme = data.problemes_routiers.find(p => p.id_probleme === id);
    return probleme;
  },

  // Récupérer les problèmes par statut
  getProblemesByStatus: async (status) => {
    const data = await loadTestData();
    const problemes = data.problemes_routiers.filter(p => p.status === status);
    return problemes;
  },

  // Récupérer toutes les entreprises
  getEntreprises: async () => {
    const data = await loadTestData();
    return data.entreprises;
  },

  // Récupérer les signalements d'un problème
  getSignalementsByProbleme: async (id_probleme) => {
    const data = await loadTestData();
    const signalements = data.signalements.filter(s => s.id_probleme === id_probleme);
    return signalements;
  },

  // Récupérer les statistiques
  getStatistiques: async () => {
    const data = await loadTestData();
    return data.statistiques;
  },

  // Ajouter un nouveau signalement (simulé)
  addSignalement: async (signalementData) => {
    const newSignalement = {
      id_signalement: `750e8400-e29b-41d4-a716-${Date.now()}`,
      ...signalementData,
      date_signalement: new Date().toISOString()
    };
    return newSignalement;
  },

  // Créer un nouveau problème (simulé)
  createProbleme: async (problemeData) => {
    const newProbleme = {
      id_probleme: `650e8400-e29b-41d4-a716-${Date.now()}`,
      status: 'NOUVEAU',
      created_at: new Date().toISOString(),
      ...problemeData
    };
    return newProbleme;
  },

  // Mettre à jour le statut d'un problème (simulé)
  updateProblemeStatus: async (id, newStatus) => {
    return {
      success: true,
      message: `Statut mis à jour vers ${newStatus}`
    };
  },

  // Assigner une entreprise à un problème (simulé)
  assignEntreprise: async (id_probleme, id_entreprise) => {
    return {
      success: true,
      message: 'Entreprise assignée avec succès'
    };
  }
};

export default mockDataService;
