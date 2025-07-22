import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'

const WelcomeScreen = ({
  navigation,
}: {
  navigation: { navigate: (arg0: string) => void }
}) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to RecoMate</Text>

      <View style={styles.featuresContainer}>
        <Text style={styles.feature}>
          🌟 Discover personalized recommendations
        </Text>
        <Text style={styles.feature}>
          👥 From real people in your community
        </Text>
        <Text style={styles.feature}>🔍 Find hidden gems you'll love</Text>
        <Text style={styles.feature}>💬 Share your own favorites</Text>
      </View>

      <Text style={styles.description}>
        RecoMate connects you with authentic recommendations from people who
        share your interests. No algorithms, just real suggestions from real
        users.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'darkblue',
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default WelcomeScreen
