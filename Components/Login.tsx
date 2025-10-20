import React, { useEffect, useMemo, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform
} from 'react-native'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession()

const Login = ({ navigation }: { navigation: { navigate: (screen: string) => void; goBack: () => void } }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Google OAuth Client IDs
  const config = useMemo(() => ({
    webClientId: '460576278701-ko1sgndmfhnddlkvnsu329h49lu9rv38.apps.googleusercontent.com',
    androidClientId: '460576278701-andnfn632315ei16jvvgjhaofgdkpidb.apps.googleusercontent.com',
    iosClientId: '460576278701-2b4im98505eg1mlrhtg3c0frmss4va3h.apps.googleusercontent.com'
  }), [])

  // ✅ FIXED: Use hardcoded Expo proxy URI for development
  const redirectUri = useMemo(() => {
    // For Expo Go development, always use the Expo auth proxy
    return 'https://auth.expo.io/@kabha/recomate'
  }, [])

  // ✅ FIXED: Use AuthRequest instead of IdTokenAuthRequest for better compatibility
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: config.webClientId,
    scopes: ['profile', 'email'],
    redirectUri,
  })

  // Log configuration for debugging
  useEffect(() => {
    console.log('🔗 Using Redirect URI:', redirectUri)
    console.log('📱 Platform:', Platform.OS)
    console.log('🛠️  Client ID:', config.webClientId?.substring(0, 20) + '...')
  }, [redirectUri])

  // Handle auth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response)
    }
  }, [response])

  // ────────── Email/Password Login ──────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('email', '==', email))
      const snapshot = await getDocs(userQuery)
      
      if (snapshot.empty) {
        Alert.alert('Error', 'User not found')
        return
      }
      
      const userData = snapshot.docs[0].data()
      const userStatus = userData.status
      
      if (!userStatus || userStatus !== 'active') {
        Alert.alert('Access Denied', `Your account is ${userStatus || 'unavailable'}.`)
        return
      }

      await signInWithEmailAndPassword(auth, email, password)
      Alert.alert('Success', `Welcome back, ${userData.username || 'user'}!`)
      navigation.navigate('Tabs')
    } catch (error: any) {
      console.error('Login Error:', error.message)
      Alert.alert('Login Error', error.message)
    }
  }

  // ────────── Google Sign-In Handler ──────────
  const handleGoogle = async () => {
    try {
      console.log('🔵 Starting Google Sign-In...')
      
      if (!request) {
        Alert.alert('Please wait', 'Google auth is still initializing.')
        return
      }

      console.log('🔗 Using redirect URI:', redirectUri)

      // Use proxy for Expo Go
      await promptAsync({ useProxy: true })

    } catch (err: any) {
      console.error('❌ Google Sign-In Error:', err)
      Alert.alert('Sign-In Error', 'Failed to start Google Sign-In. Please try again.')
    }
  }

  // Handle successful Google auth response
  const handleGoogleResponse = async (response: any) => {
    try {
      console.log('✅ Google Auth Response:', response.type)

      if (response.type !== 'success') {
        if (response.type !== 'dismiss') {
          Alert.alert('Google Sign-In Cancelled', 'Please try again.')
        }
        return
      }

      // Get authentication from response
      const { authentication } = response
      
      if (!authentication?.accessToken) {
        console.error('❌ No access token in response:', response)
        Alert.alert('Authentication Error', 'Could not retrieve authentication token.')
        return
      }

      console.log('✅ Access token received, authenticating with Firebase...')

      // Create Firebase credential using access token
      const credential = GoogleAuthProvider.credential(
        null, // idToken - we don't have it with useAuthRequest
        authentication.accessToken
      )

      const userCred = await signInWithCredential(auth, credential)
      const { uid, email: userEmail, displayName, photoURL } = userCred.user

      console.log('✅ Firebase authentication successful for:', userEmail)

      // Check/Create Firestore user document
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        console.log('📝 Creating new user document in Firestore')
        await setDoc(userRef, {
          uid,
          email: userEmail ?? '',
          username: displayName ?? 'Google User',
          photoURL: photoURL ?? '',
          status: 'active',
          provider: 'google',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        })
      } else {
        console.log('📝 Updating existing user document')
        const existingData = userSnap.data()
        
        // Check user status
        if (existingData.status !== 'active') {
          Alert.alert('Access Denied', `Your account is ${existingData.status || 'unavailable'}.`)
          await auth.signOut()
          return
        }

        // Update last login
        await setDoc(userRef, { 
          lastLogin: serverTimestamp(),
          photoURL: photoURL ?? existingData.photoURL ?? ''
        }, { merge: true })
      }

      console.log('✅ Sign-in complete, navigating to app...')
      Alert.alert('Welcome!', `Signed in as ${displayName || userEmail}`)
      navigation.navigate('Tabs')

    } catch (err: any) {
      console.error('❌ Google Sign-In Error:', err)
      Alert.alert(
        'Sign-In Error', 
        err?.message || 'An unexpected error occurred. Please try again.'
      )
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to RecoMate</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.googleBtn, !request && styles.disabledBtn]} 
        onPress={handleGoogle} 
        disabled={!request}
      >
        <Text style={styles.buttonText}>
          {request ? 'Continue with Google' : 'Loading...'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.link}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: 'darkblue', 
    textAlign: 'center', 
    marginBottom: 25 
  },
  input: {
    height: 50, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingHorizontal: 15,
    marginBottom: 15, 
    borderRadius: 8, 
    fontSize: 16,
    backgroundColor: '#fff'
  },
  button: { 
    backgroundColor: 'darkblue', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginVertical: 10 
  },
  googleBtn: { 
    backgroundColor: '#4285F4' 
  },
  disabledBtn: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18,
    fontWeight: '600'
  },
  switchText: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: '#555',
    marginTop: 20
  },
  link: { 
    color: 'darkblue', 
    fontWeight: 'bold' 
  },
  configHelp: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  configText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  configCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
    color: '#d63384',
  },
})

export default Login