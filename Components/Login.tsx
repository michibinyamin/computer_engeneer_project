import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Login = ({ navigation }: { navigation: { navigate: (screen: string) => void } }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Get user data from Firestore
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(userQuery);

      if (snapshot.empty) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const userData = snapshot.docs[0].data();
      const userStatus = userData.status;

      if (!userStatus || userStatus !== 'active') {
        Alert.alert('Access Denied', `Your account is ${userStatus || 'unavailable'}.`);
        return;
      }

      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert('Success', `Welcome back, ${userData.username}!`);
      navigation.navigate('Tabs'); // or your home screen

    } catch (error: any) {
      console.error('Login Error:', error.message);
      Alert.alert('Login Error', error.message);
    }
  };

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.link}>Sign Up</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
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
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  link: {
    color: 'darkblue',
    fontWeight: 'bold',
  },
});

export default Login;
