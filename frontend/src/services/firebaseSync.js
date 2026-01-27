// services/firebaseSync.js
import { firebaseService } from './firebaseService';
import api, { authService, problemeService, userService } from './api';

export const syncService = {

  // synchronisation complète
  syncAll: async () => {
    try {
      console.log('🔄 Synchronisation commencée...');

      // 1️⃣ Problèmes routiers
      const apiProblemes = await problemeService.getAll();
      const fbProblemes = await firebaseService.getProblemes();

      for (let p of apiProblemes) {
        const exists = fbProblemes.find(fb => fb.id_probleme === p.id_probleme);
        if (!exists) {
          console.log('➕ Ajout problème dans Firebase:', p.id_probleme);
          await firebaseService.addOrUpdateProbleme(p);
        } else {
          // Optionnel : mettre à jour si modifié
          await firebaseService.addOrUpdateProbleme(p);
        }
      }

      // 2️⃣ Utilisateurs
      const apiUsers = await userService.getUsers();
      const fbUsers = await firebaseService.getUsers();

      for (let u of apiUsers) {
        const exists = fbUsers.find(fb => fb.id === u.id);
        if (!exists) {
          console.log('➕ Ajout user dans Firebase:', u.email);
          await firebaseService.addOrUpdateUser(u);
        } else {
          await firebaseService.addOrUpdateUser(u);
        }
      }

      // 3️⃣ Signalements
      const apiSignalements = await api.get('/signalements').then(res => res.data);
      const fbSignalements = await firebaseService.getSignalements();

      for (let s of apiSignalements) {
        const exists = fbSignalements.find(fb => fb.id_signalement === s.id_signalement);
        if (!exists) {
          console.log('➕ Ajout signalement dans Firebase:', s.id_signalement);
          await firebaseService.addOrUpdateSignalement(s);
        } else {
          await firebaseService.addOrUpdateSignalement(s);
        }
      }
      // After pushing local changes to Firebase, fetch the current Firebase state
      // and send it to the backend so the server can upsert into the local DB (pull).
      const finalFbProblemes = await firebaseService.getProblemes();
      const finalFbUsers = await firebaseService.getUsers();
      const finalFbSignalements = await firebaseService.getSignalements();

      try {
        await api.post('/sync/pull', {
          problemes: finalFbProblemes,
          users: finalFbUsers,
          signalements: finalFbSignalements
        });
        console.log('✅ Backend pull endpoint invoked successfully');
      } catch (err) {
        console.error('❌ Error calling backend pull endpoint:', err);
      }

      console.log('✅ Synchronisation terminée !');
    } catch (error) {
      console.error('❌ Erreur synchronisation Firebase:', error);
    }
  }
};
