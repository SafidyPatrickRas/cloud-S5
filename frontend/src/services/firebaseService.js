import { db } from '../firebase'
import { collection, getDocs, setDoc, doc, addDoc } from 'firebase/firestore'

export const firebaseService = {

  // récupérer tous les problèmes
  getProblemes: async () => {
    const snapshot = await getDocs(collection(db, 'probleme_routier'))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  // ajouter ou mettre à jour un problème
  addOrUpdateProbleme: async (probleme) => {
    if (!probleme.id_probleme) {
      const docRef = await addDoc(collection(db, 'probleme_routier'), probleme)
      return docRef.id
    } else {
      await setDoc(doc(db, 'probleme_routier', probleme.id_probleme), probleme)
      return probleme.id_probleme
    }
  },

  // récupérer tous les signalements
  getSignalements: async () => {
    const snapshot = await getDocs(collection(db, 'signalement'))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  addOrUpdateSignalement: async (signalement) => {
    if (!signalement.id_signalement) {
      const docRef = await addDoc(collection(db, 'signalement'), signalement)
      return docRef.id
    } else {
      await setDoc(doc(db, 'signalement', signalement.id_signalement), signalement)
      return signalement.id_signalement
    }
  },

  // récupérer utilisateurs
  getUsers: async () => {
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  addOrUpdateUser: async (user) => {
    if (!user.id) {
      const docRef = await addDoc(collection(db, 'users'), user)
      return docRef.id
    } else {
      await setDoc(doc(db, 'users', user.id), user)
      return user.id
    }
  },

}
