import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyC59kAkxHQU7x1UyMfU7jWLjqH-wkKGZgc',
  authDomain: 'recomate-a132f.firebaseapp.com',
  projectId: 'recomate-a132f',
  storageBucket: 'recomate-a132f.firebasestorage.app',
  messagingSenderId: '460576278701',
  appId: '1:460576278701:web:a65c719fb0aa1cae53de24',
  measurementId: 'G-0QER1CYZDC',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app) 
