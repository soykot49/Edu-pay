import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser)
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signupStudent({ name, studentId, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const data = {
      role: 'student',
      name,
      studentId,
      email,
      totalDue: 0,
      totalPaid: 0,
      currentSession: '',
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), data)
    await setDoc(doc(db, 'students', cred.user.uid), data)
    return cred.user
  }

  async function signupAdmin({ name, username, email, password, accessCode }) {
    const expected = import.meta.env.VITE_ADMIN_SIGNUP_CODE
    if (expected && accessCode !== expected) {
      throw new Error('Invalid access code. Ask the site developer for the admin invite code.')
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db, 'users', cred.user.uid), {
      role: 'admin',
      name,
      username,
      email,
      createdAt: serverTimestamp(),
    })
    return cred.user
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  const value = { user, profile, loading, signupStudent, signupAdmin, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
