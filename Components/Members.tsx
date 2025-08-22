// Components/Members.tsx
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
  ImageBackground,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { auth, db } from '../firebase'
import adminEmails from '../adminEmails.json'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'
import {
  promoteMemberToAdmin,
  removeMemberByDocId,
  leaveGroup,
} from '../Services'

type MemberRow = {
  membershipDocId: string
  userId: string
  username: string
  role: 'Member' | 'Admin'
}

const Members = () => {
  const route = useRoute()
  const navigation = useNavigation<any>()
  const { groupId } = route.params as { groupId: string }

  const [members, setMembers] = useState<MemberRow[]>([])
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuFor, setMenuFor] = useState<MemberRow | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [isMember, setIsMember] = useState(false) // ✅ only members can leave

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  useEffect(() => {
    const resolvePermissions = async () => {
      const u = auth.currentUser
      const isManager = adminEmails.includes(u?.email ?? '')
      if (!u) {
        setCanManage(isManager)
        setIsMember(false)
        return
      }
      const myQ = query(
        collection(db, 'membership'),
        where('group_id', '==', groupId),
        where('user_id', '==', u.uid)
      )
      const mySnap = await getDocs(myQ)

      const amMember = !mySnap.empty
      setIsMember(amMember)

      const isGroupAdmin =
        amMember && (mySnap.docs[0].data() as any).role === 'Admin'
      setCanManage(isManager || isGroupAdmin)
    }
    resolvePermissions()
  }, [groupId])

  const fetchMembers = async () => {
    const q = query(collection(db, 'membership'), where('group_id', '==', groupId))
    const snapshot = await getDocs(q)

    const fetchedMembers: MemberRow[] = await Promise.all(
      snapshot.docs.map(async (m) => {
        const data = m.data() as any
        const userRef = doc(db, 'users', data.user_id)
        const userSnap = await getDoc(userRef)
        const username = userSnap.exists()
          ? (userSnap.data() as any).username
          : 'Unknown'
        return {
          membershipDocId: m.id,
          userId: data.user_id,
          username,
          role: (data.role as 'Member' | 'Admin') ?? 'Member',
        }
      })
    )

    setMembers(fetchedMembers)
  }

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return

    const userQuery = query(
      collection(db, 'users'),
      where('username', '==', inviteUsername)
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
      created_at: Timestamp.now(), // helps pick next admin later
    })

    Alert.alert('Success', `${inviteUsername} added successfully!`)
    setInviteUsername('')
    setInviteModal(false)
    fetchMembers()
  }

  const openMenu = (row: MemberRow) => {
    if (!canManage) return
    setMenuFor(row)
    setMenuVisible(true)
  }

  const doPromote = async () => {
    if (!canManage || !menuFor) {
      Alert.alert('Permission denied', 'You cannot manage members in this group.')
      return
    }
    if (menuFor.role === 'Admin') {
      setMenuVisible(false)
      return
    }
    try {
      await promoteMemberToAdmin(menuFor.membershipDocId)
      setMenuVisible(false)
      await fetchMembers()
    } catch (e) {
      Alert.alert('Error', 'Failed to promote user.')
    }
  }

  const doRemove = async () => {
    if (!canManage || !menuFor) {
      Alert.alert('Permission denied', 'You cannot manage members in this group.')
      return
    }
    const u = auth.currentUser
    const isManager = adminEmails.includes(u?.email ?? '')
    if (menuFor.role === 'Admin' && !isManager) {
      Alert.alert('Blocked', 'Only managers can remove another Admin.')
      return
    }

    Alert.alert('Remove from group', `Remove ${menuFor.username}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMemberByDocId(menuFor.membershipDocId)
            setMenuVisible(false)
            await fetchMembers()
          } catch (e) {
            Alert.alert('Error', 'Failed to remove user.')
          }
        },
      },
    ])
  }

  const onLeave = () => {
  if (!isMember) return
  Alert.alert('Leave group', 'Are you sure you want to leave this group?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Leave',
      style: 'destructive',
      onPress: async () => {
        await leaveGroup(groupId, auth.currentUser?.uid || '')

       navigation.reset({
          index: 1,
          routes: [
            { name: 'Login' },                              // keep Login in history
            { name: 'Tabs', params: { initialTab: 'Groups' } },
          ],
        })
      },
    },
  ])
}

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Members</Text>

        <ScrollView contentContainerStyle={styles.listWrapper}>
          <View style={styles.rowHeader}>
            <Text style={[styles.colHeader, { flex: 1.2 }]}>Username</Text>
            <Text style={[styles.colHeader, { flex: 0.8, textAlign: 'center' }]}>
              Role
            </Text>
            <Text style={[styles.colHeader, { width: 32 }]}>{' '}</Text>
          </View>

          {members.map((member) => (
            <View key={member.membershipDocId} style={styles.row}>
              <Text style={[styles.col, { flex: 1.2 }]} numberOfLines={1}>
                {member.username}
              </Text>
              <Text style={[styles.col, { flex: 0.8, textAlign: 'center' }]}>
                {member.role}
              </Text>

              {canManage && (
                <TouchableOpacity
                  onPress={() => openMenu(member)}
                  style={styles.menuBtn}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#dbeafe" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Leave group — only for members */}
        {isMember && (
          <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        )}

        {/* Invite */}
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => setInviteModal(true)}
        >
          <Text style={styles.inviteBtnText}>Invite</Text>
        </TouchableOpacity>

        {/* Invite modal */}
        <Modal visible={inviteModal} animationType="slide" transparent>
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

        {/* Per-row action menu */}
        <Modal transparent visible={menuVisible} animationType="fade">
          <View style={styles.menuOverlay}>
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>Manage {menuFor?.username}</Text>

              {menuFor?.role !== 'Admin' && (
                <TouchableOpacity style={styles.menuItem} onPress={doPromote}>
                  <Ionicons name="arrow-up-circle" size={18} color="#fff" />
                  <Text style={styles.menuItemText}>Promote to Admin</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: '#b91c1c' }]}
                onPress={doRemove}
              >
                <Ionicons name="person-remove" size={18} color="#fff" />
                <Text style={styles.menuItemText}>Remove from Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: '#475569' }]}
                onPress={() => setMenuVisible(false)}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.menuItemText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 16 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
    color: '#dbeafe',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
  },
  colHeader: { fontWeight: 'bold', fontSize: 16, color: '#dbeafe' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  col: { fontSize: 16, color: '#dbeafe' },

  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  leaveBtn: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#ef4444',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  leaveBtnText: { color: 'white', fontWeight: 'bold' },

  inviteBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'darkblue',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inviteBtnText: { color: 'white', fontWeight: 'bold' },

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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  confirmBtn: {
    backgroundColor: 'darkblue',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontWeight: 'bold' },
  cancelText: { textAlign: 'center', color: 'red', marginTop: 10 },

  listWrapper: { paddingBottom: 120 },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: '85%',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  menuTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#2563eb',
    borderRadius: 10,
  },
  menuItemText: { color: '#fff', fontWeight: 'bold' },
})

export default Members
