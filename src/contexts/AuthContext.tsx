import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function signup(email: string, password: string, displayName: string) {
    if (!auth) throw new Error('Firebase Auth is not initialized')
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
      
      // Create user document in Firestore
      if (db) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName,
          plan: 'starter',
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailAlerts: true
          }
        })
      }
    }
  }

  async function login(email: string, password: string) {
    if (!auth) throw new Error('Firebase Auth is not initialized')
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    if (!auth) throw new Error('Firebase Auth is not initialized')
    await signOut(auth)
  }

  async function loginWithGoogle() {
    if (!auth) throw new Error('Firebase Auth is not initialized')
    
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    
    // Check if user document exists, if not create one
    if (db && userCredential.user) {
      const userRef = doc(db, 'users', userCredential.user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          plan: 'starter',
          createdAt: new Date().toISOString(),
          preferences: {
            notifications: true,
            emailAlerts: true
          }
        })
      }
    }
  }

  async function resetPassword(email: string) {
    if (!auth) throw new Error('Firebase Auth is not initialized')
    await sendPasswordResetEmail(auth, email)
  }

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
