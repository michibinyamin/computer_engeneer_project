import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Tabs from './Tabs';

const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  

const handleSubmit = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      console.log("User logged in:", userCredential.user);
      navigation.navigate('Tabs');
    } catch (error) {
      console.error("Login error:", error);
      alert(error);
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
        onChangeText={(text) => setFormData({...formData, email: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
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
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
});

export default Login;