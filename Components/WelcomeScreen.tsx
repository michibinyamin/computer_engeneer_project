import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native'

const WelcomeScreen = ({
  navigation,
}: {
  navigation: { navigate: (arg0: string) => void }
}) => {
  return (
    <ImageBackground
      source={require('../assets/background1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
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
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    marginTop: 60,
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
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 18,
    marginBottom: 15,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    marginBottom: 40,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: 'darkblue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
})

export default WelcomeScreen
