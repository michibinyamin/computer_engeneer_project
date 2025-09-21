import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { auth, db } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

// ✅ NEW: AuthSession (Expo)
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { makeRedirectUri } from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

const Login = ({
  navigation,
}: {
  navigation: { navigate: (screen: string) => void; goBack: () => void }
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ⚠️ Paste your real client IDs here (from Google Cloud OAuth)
  const config = useMemo(
    () => ({
      // Expo Go / Proxy will primarily use the webClientId
      webClientId:
        '460576278701-ko1sgndmfhnddlkvnsu329h49lu9rv38.apps.googleusercontent.com',
      androidClientId:
        '460576278701-andnfn632315ei16jvvgjhaofgdkpidb.apps.googleusercontent.com',
      iosClientId:
        '460576278701-2b4im98505eg1mlrhtg3c0frmss4va3h.apps.googleusercontent.com',
    }),
    []
  )

  // Request for Google auth (use proxy in Expo Go)
  // Compute the redirect URI once. In Expo Go, this will be of the form
  // https://auth.expo.io/@<expo-username>/recomate. Logging it helps ensure
  // it matches the URI added in Google Cloud console.
  const redirectUri = useMemo(() => makeRedirectUri({ useProxy: true }), [])

  // Log the redirect URI once on mount for debugging. Remove this in production.
  useEffect(() => {
    console.log('Expo AuthSession redirect URI:', redirectUri)
  }, [redirectUri])

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: config.webClientId, // This is the web client ID
    androidClientId: config.androidClientId,
    // iosClientId: config.iosClientId,
    scopes: ['profile', 'email'],
    redirectUri,
  })

  // ————— Email/password flow (your existing logic) —————
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      // Check Firestore user & status first (your current approach)
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
        Alert.alert(
          'Access Denied',
          `Your account is ${userStatus || 'unavailable'}.`
        )
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

  // ————— Google Sign-In flow —————
  const handleGoogle = async () => {
    try {
      if (!request) {
        Alert.alert('Please wait', 'Google auth is still initializing.')
        return
      }
      const result = await promptAsync({ useProxy: true })
      if (result.type !== 'success') {
        // Show a message only if the user didn’t just dismiss the prompt
        if (result.type !== 'dismiss') Alert.alert('Google Sign-In cancelled')
        return
      }

      // Retrieve the ID token from either result.params or authentication.
      const idToken =
        (result.params && (result.params as any).id_token) ||
        result.authentication?.idToken
      if (!idToken) {
        Alert.alert('Google Sign-In error', 'Missing ID token in the response.')
        return
      }

      // Exchange Google id_token for Firebase credential
      const credential = GoogleAuthProvider.credential(idToken)
      const userCred = await signInWithCredential(auth, credential)
      const { uid, email, displayName } = userCred.user

      // Ensure Firestore user doc exists and status is active
      const userRef = doc(db, 'users', uid)
      const snap = await getDoc(userRef)
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid,
          email: email ?? '',
          username: displayName ?? '',
          status: 'active',
          provider: 'google',
          createdAt: serverTimestamp(),
        })
      } else {
        // Optionally, keep user active
        if (snap.data().status !== 'active') {
          await setDoc(userRef, { status: 'active' }, { merge: true })
        }
      }

      navigation.navigate('Tabs')
    } catch (err: any) {
      console.error('Google Sign-In error:', err)
      Alert.alert('Google Sign-In error', err?.message ?? 'Unknown error')
    }
  }

  // (Optional) react to AuthSession response in a side effect
  useEffect(() => {
    // We do everything inside handleGoogle now, so nothing here
  }, [response])

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

      {/* NEW: Google button */}
      <TouchableOpacity
        style={[styles.button, styles.googleBtn]}
        onPress={handleGoogle}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
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
  container: { padding: 20, paddingTop: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'darkblue',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  googleBtn: { backgroundColor: '#4285F4' },
  buttonText: { color: 'white', fontSize: 18 },
  switchText: { textAlign: 'center', fontSize: 16, color: '#555' },
  link: { textAlign: 'center', color: 'darkblue', fontWeight: 'bold' },
})

export default Login
