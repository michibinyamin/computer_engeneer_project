import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
  Modal,
  TextInput,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { db } from '../firebase'
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'

const AdminUsersScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { userId } = route.params as { userId: string }

  const [user, setUser] = useState<any>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banDays, setBanDays] = useState('7')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setUser(docSnap.data())
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [userId])

  const handleBan = async () => {
    const days = Math.max(1, parseInt(banDays || '7', 10))
    const bannedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        bannedUntil,
        status: 'banned',
      })
      setUser((prev: any) => ({
        ...prev,
        bannedUntil: Timestamp.fromDate(bannedUntil),
        status: 'banned',
      }))
      setShowBanModal(false)
      Alert.alert(`User banned for ${days} day${days !== 1 ? 's' : ''}`)
    } catch (error) {
      Alert.alert('Error banning user')
      console.error(error)
    }
  }

  const confirmBan = () => {
    const days = parseInt(banDays || '7', 10)
    const durationText = days === 9999 ? 'permanently' : `for ${days} day${days !== 1 ? 's' : ''}`
    
    Alert.alert('Confirm Ban', `Ban this user ${durationText}?`, [
      { text: 'Cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: handleBan,
      },
    ])
  }

  const handleUnban = async () => {
    Alert.alert('Confirm Unban', 'Unban this user now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unban',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'users', userId), {
              bannedUntil: null,
              status: 'active',
            })
            setUser((prev: any) => ({
              ...prev,
              bannedUntil: null,
              status: 'active',
            }))
            Alert.alert('User unbanned')
          } catch (error) {
            Alert.alert('Error unbanning user')
            console.error(error)
          }
        },
      },
    ])
  }

  const handleDelete = async () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to permanently delete this user?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Only delete from Firestore
              await deleteDoc(doc(db, 'users', userId))
              Alert.alert('User deleted')
              navigation.goBack()
            } catch (error) {
              Alert.alert('Error deleting user')
              console.error(error)
            }
          },
        },
      ],
    )
  }

  const formatBanDate = (timestamp?: Timestamp | null) => {
    if (!timestamp || typeof (timestamp as any)?.toDate !== 'function') return null
    const date = (timestamp as Timestamp).toDate()
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const isBanned = (() => {
    const t = user?.bannedUntil
    if (!t || typeof t.toDate !== 'function') return false
    return t.toDate() > new Date()
  })()

  if (!user) return (
    <ImageBackground
      //source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      source={require('../assets/Glowing-Icons-of-Inspiration-and-Knowledge.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    </ImageBackground>
  )

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      // source={require('../assets/Glowing-Icons-of-Inspiration-and-Knowledge.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>User Info</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>

          {user.username && (
            <>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.value}>{user.username}</Text>
            </>
          )}

          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: isBanned ? 'red' : 'green' }]}>
            {isBanned ? 'banned' : 'active'}
          </Text>

          {isBanned && (
            <>
              <Text style={styles.label}>Banned Until:</Text>
              <Text style={styles.value}>{formatBanDate(user.bannedUntil)}</Text>
            </>
          )}
        </View>

        {!isBanned ? (
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => setShowBanModal(true)}
          >
            <Text style={styles.actionText}>Ban User</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
            onPress={handleUnban}
          >
            <Text style={styles.actionText}>Unban User</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
        >
          <Text style={styles.actionText}>Delete User</Text>
        </TouchableOpacity>

        {/* Simple Ban Duration Modal */}
        <Modal transparent visible={showBanModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Ban Duration (days)</Text>
              
              <TextInput
                value={banDays}
                onChangeText={setBanDays}
                keyboardType="numeric"
                style={styles.modalInput}
                placeholder="Enter number of days"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#1E88E5' }]}
                  onPress={confirmBan}
                >
                  <Text style={styles.modalBtnText}>Ban</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#666' }]}
                  onPress={() => setShowBanModal(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: '#fff',
    fontWeight: 'bold',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#dbeafe',
  },
  infoCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 10,
    color: '#dbeafe',
  },
  value: { 
    fontSize: 16, 
    color: '#ffffff', 
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: '#1E88E5',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  actionText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  deleteBtn: { 
    backgroundColor: '#E53935' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
})

export default AdminUsersScreen