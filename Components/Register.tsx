import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebase'
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const Register = ({
  navigation,
}: {
  navigation: { navigate: (arg0: string) => void }
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    try {
      const userRef = collection(db, 'users')
      const usernameQuery = query(
        userRef,
        where('username', '==', formData.username)
      )
      const querySnapshot = await getDocs(usernameQuery)

      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      if (
        !formData.username.trim() ||
        !formData.email.trim() ||
        !formData.password.trim() ||
        !formData.confirmPassword.trim()
      ) {
        alert('Please fill in all fields.')
        return
      }

      if (!isValidEmail(formData.email)) {
        alert('Invalid Email, Please enter a valid email address.')
        return
      }

      // Check if username is taken
      if (!querySnapshot.empty) {
        alert('Username already taken, Choose another one.')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match")
        return
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        user_id: user.uid,
        username: formData.username,
        email: formData.email,
        status: 'active',
      })

      alert(`Account created successfully!\nWelcome, ${formData.username}`)
      navigation.navigate('Login')
    } catch (error) {
      console.error('Registration error:', error)
      alert('Error: ' + (error as Error).message)
    }
  }

  return (
    <ImageBackground
      source={require('../assets/background1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Join RecoMate</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={formData.username}
          onChangeText={(text) => setFormData({ ...formData, username: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  link: {
    textAlign: 'center',
    color: '#FFD93D',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

export default Register
