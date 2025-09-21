// Components/MainContainer.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import GeneralList from './GeneralList'
import GroupsList from './GroupsList'
import PersonalList from './PersonalList'
import ManagePanel from './ManagePanel'
import { auth } from '../firebase'
import adminEmails from '../adminEmails.json'
import * as Location from 'expo-location'

type TabKey = 'General' | 'Groups' | 'Personal' | 'Manage'

const MainContainer = ({ route }: any) => {
  const navigation = useNavigation<any>()

  const [activeTab, setActiveTab] = useState<TabKey>('General')
  const [isAdmin, setIsAdmin] = useState(false)

  const scaleAnim = useState(new Animated.Value(0.8))[0]
  const opacityAnim = useState(new Animated.Value(0))[0]

  const [myLocation, setMyLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync()

        if (status !== 'granted') {
          const request = await Location.requestForegroundPermissionsAsync()
          if (request.status !== 'granted') {
            console.warn('Permission not granted')
            return
          }
        }

        const location = await Location.getCurrentPositionAsync({})
        setMyLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        console.log(
          'current location:',
          location.coords.latitude,
          ',',
          location.coords.longitude
        )
      } catch (err) {
        console.error('Error:', err)
      }
    }

    getLocation()
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && adminEmails.includes(user.email ?? '')) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const tab = route?.params?.initialTab as TabKey | undefined
    if (tab && ['General', 'Groups', 'Personal', 'Manage'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [route?.params?.initialTab])

  useEffect(() => {
    scaleAnim.setValue(0.8)
    opacityAnim.setValue(0)

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return <GeneralList myLocation={myLocation} />
      case 'Groups':
        return <GroupsList myLocation={myLocation} />
      case 'Personal':
        return <PersonalList myLocation={myLocation} />
      case 'Manage':
        return <ManagePanel />
      default:
        return null
    }
  }

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        {/* Hamburger to open the Drawer */}
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuBtn}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Top tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('General')}>
            <Text
              style={[styles.tab, activeTab === 'General' && styles.activeTab]}
            >
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Groups')}>
            <Text
              style={[styles.tab, activeTab === 'Groups' && styles.activeTab]}
            >
              Groups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Personal')}>
            <Text
              style={[styles.tab, activeTab === 'Personal' && styles.activeTab]}
            >
              Personal
            </Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity onPress={() => setActiveTab('Manage')}>
              <Text
                style={[styles.tab, activeTab === 'Manage' && styles.activeTab]}
              >
                Manage
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View
          style={{
            flex: 1,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {renderContent()}
        </Animated.View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  menuBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 50,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 48, // <- pushes tabs to the right of the hamburger
    paddingRight: 8,
    backgroundColor: 'rgba(26, 46, 64, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    color: '#cccccc',
  },
  activeTab: {
    color: '#4da6ff',
  },
})

export default MainContainer
