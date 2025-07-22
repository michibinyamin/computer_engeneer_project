import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import GeneralList from './GeneralList'
import GroupsList from './GroupsList'
import PersonalList from './PersonalList'
import { auth } from '../firebase'
import ManagePanel from './ManagePanel' // this will be your admin page
import { useNavigation } from '@react-navigation/native'
import adminEmails from '../adminEmails.json'
import { ImageBackground } from 'react-native'

// const adminEmails = [
//   'omar@gmail.com',
//   'Adi.yohanann@gmail.com',
//   'michibinyamin@gmail.com',
// ] // Add your admin email(s)

const MainContainer = () => {
  const navigation = useNavigation<any>()
  const [activeTab, setActiveTab] = useState('General')
  const [isAdmin, setIsAdmin] = useState(false)

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
        {renderContent()}
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
    //backgroundColor: '#e0f7fa',
    backgroundColor: 'rgba(224, 247, 250, 0.9)', // 50% transparent
  },
  tab: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    color: 'black',
  },
  activeTab: {
    color: '#1565c0',
  },
})

export default MainContainer
