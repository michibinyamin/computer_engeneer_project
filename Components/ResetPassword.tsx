import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'

const ResetPassword = ({
  navigation,
}: {
  navigation: { navigate: (screen: string) => void; goBack: () => void }
}) => {
  const [email, setEmail] = useState('')

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.')
      return
    }

    try {
      await sendPasswordResetEmail(auth, email.trim())
      Alert.alert(
        'Success',
        'Password reset link sent! Please check your inbox (and Spam/Promotions folder).'
      )
      navigation.goBack()
    } catch (error: any) {
      console.error('Reset password error:', error)
      let message = 'Something went wrong. Please try again.'
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.'
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.'
      }
      Alert.alert('Error', message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'darkblue',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backLink: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
})

export default ResetPassword
