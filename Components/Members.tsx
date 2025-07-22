import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { auth, db } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore'

const Members = () => {
  const route = useRoute()
  const { groupId } = route.params as { groupId: string }

  const [members, setMembers] = useState<{ username: string; role: string }[]>(
    [],
  )
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const fetchMembers = async () => {
    const q = query(
      collection(db, 'membership'),
      where('group_id', '==', groupId),
    )
    const snapshot = await getDocs(q)

    const fetchedMembers = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const userRef = doc(db, 'users', data.user_id)
        const userSnap = await getDoc(userRef)
        const username = userSnap.exists()
          ? userSnap.data().username
          : 'Unknown'
        return { username, role: data.role }
      }),
    )

    setMembers(fetchedMembers)
  }

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return

    const userQuery = query(
      collection(db, 'users'),
      where('username', '==', inviteUsername),
    )
    const userSnapshot = await getDocs(userQuery)

    if (userSnapshot.empty) {
      Alert.alert('Error', 'User not found.')
      return
    }

    const userId = userSnapshot.docs[0].id
    await addDoc(collection(db, 'membership'), {
      membership_id: `membership_${Date.now()}`,
      group_id: groupId,
      user_id: userId,
      role: 'Member',
    })

    Alert.alert('Success', `${inviteUsername} added successfully!`)
    setInviteUsername('')
    setInviteModal(false)
    fetchMembers() // refresh members
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Members</Text>

      <ScrollView contentContainerStyle={styles.listWrapper}>
        <View style={styles.rowHeader}>
          <Text style={styles.colHeader}>Username</Text>
          <Text style={styles.colHeader}>Role</Text>
        </View>

        {members.map((member, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.col}>{member.username}</Text>
            <Text style={styles.col}>{member.role}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => setInviteModal(true)}
      >
        <Text style={styles.inviteBtnText}>Invite</Text>
      </TouchableOpacity>

      <Modal visible={inviteModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Invite User</Text>
            <TextInput
              placeholder="Enter username"
              style={styles.input}
              value={inviteUsername}
              onChangeText={setInviteUsername}
            />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleInvite}>
              <Text style={styles.confirmText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInviteModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  col: {
    fontSize: 16,
  },
  inviteBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'darkblue',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inviteBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  confirmBtn: {
    backgroundColor: 'darkblue',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
  listWrapper: {
    paddingBottom: 100,
  },
})

export default Members
