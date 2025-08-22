import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native'
import GeneralList from './GeneralList'
import GroupsList from './GroupsList'
import PersonalList from './PersonalList'
import { auth } from '../firebase'
import ManagePanel from './ManagePanel'
import { useNavigation } from '@react-navigation/native'
import adminEmails from '../adminEmails.json'
import { ImageBackground } from 'react-native'

const MainContainer = ({ route }: any) => {
  
  const navigation = useNavigation<any>()
   const [activeTab, setActiveTab] = useState<'General' | 'Groups' | 'Personal' | 'Manage'>('General')
  const [isAdmin, setIsAdmin] = useState(false)

  const scaleAnim = useState(new Animated.Value(0.8))[0]
  const opacityAnim = useState(new Animated.Value(0))[0]

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

   // NEW: if Tabs is opened with { initialTab: 'Groups' }, honor it
  useEffect(() => {
    const tab = route?.params?.initialTab
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
        return <GeneralList />
      case 'Groups':
        return <GroupsList />
      case 'Personal':
        return <PersonalList />
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 5,
    paddingBottom: 5,
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
