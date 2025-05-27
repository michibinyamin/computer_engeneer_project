import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../firebase';
import * as Google from 'expo-auth-session/providers/google';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as AuthSession from 'expo-auth-session';

const Login = ({ navigation }) => {
  console.log(AuthSession.makeRedirectUri());

  const [formData, setFormData] = useState({ email: '', password: '' });

  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '460576278701-tma9teamaca9dhkjc125j25bbcnd742p.apps.googleusercontent.com',
    androidClientId: '460576278701-l7muhuo81032m4kfq0m2m6qfj2n8gqbq.apps.googleusercontent.com',
    webClientId: '460576278701-l7muhuo81032m4kfq0m2m6qfj2n8gqbq.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              user_id: user.uid,
              email: user.email,
              username: user.displayName || user.email.split('@')[0],
            });
          }

          navigation.navigate('Tabs');
        })
        .catch((error) => {
          console.error('Google Sign-In Error:', error);
          alert('Google login failed. Please try again.');
        });
    }
  }, [response]);

  const handleSubmit = async () => {
    try {
      if (!formData.email.trim() || !formData.password.trim()) {
        alert("Please fill in all fields.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("User logged in:", userCredential.user);
      navigation.navigate('Tabs');
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

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

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.forgotPasswordLink}> Forgot password? </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity>
        <View style={styles.facebookContainer}>
          <Image source={require('../assets/facebook.png')} style={styles.facebookLogo} />
          <Text style={styles.facebookText}> Login with Facebook </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => promptAsync()}>
        <View style={styles.googleContainer}>
          <Image source={require('../assets/google.png')} style={styles.googleLogo} />
          <Text style={styles.GoogleText}> Login with Google </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View style={styles.appleContainer}>
          <Image source={require('../assets/apple.png')} style={styles.appleLogo} />
          <Text style={styles.appleText}> Login with Apple </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
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
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    color: 'darkblue',
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    color: 'darkblue',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
    paddingHorizontal: 5,
  },
  facebookContainer: {
    backgroundColor: '#1877F2',
    alignItems: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 5,
    marginTop: 20,
  },
  facebookLogo: {
    width: 50,
    height: 50,
  },
  facebookText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    marginLeft: 55,
  },
  googleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  googleLogo: {
    width: 45,
    height: 45,
  },
  GoogleText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    marginLeft: 55,
  },
  appleText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 1,
    marginLeft: 55,
  },
  appleLogo: {
    width: 60,
    height: 55,
  },
  appleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 5,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default Login;
