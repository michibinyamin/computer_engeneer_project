import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Modal,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { fetchUsers } from '../Services'
import { banUsers, deleteUsersByIds } from '../Services'

type UserRow = { id: string; username: string; email: string }

const UsersInfo = () => {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [showBanModal, setShowBanModal] = useState(false)
  const [banDays, setBanDays] = useState('7')

  const navigation = useNavigation<any>()

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    const fetched = await fetchUsers()
    setUsers(fetched as any)
    setSelected({})
    setShowBanModal(false)
  }

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        (u.username || '').toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  )

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  )
  const hasSelection = selectedIds.length > 0

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const onBan = async () => {
    const days = Math.max(1, parseInt(banDays || '7', 10))
    await banUsers(selectedIds, days)
    await refresh()
  }

  const onDelete = () =>
    Alert.alert(
      'Delete selected users',
      `Are you sure you want to delete ${selectedIds.length} user(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUsersByIds(selectedIds)
            await refresh()
          },
        },
      ]
    )

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>All Users</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by username"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userRow}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('AdminUsersScreen', { userId: user.id })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.userText}>{user.username || user.email}</Text>
                <Text style={styles.uidText}>{user.id}</Text>
              </View>

              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !!selected[user.id] }}
                onPress={() => toggle(user.id)}
                style={[
                  styles.checkbox,
                  selected[user.id] && styles.checkboxChecked,
                ]}
              >
                {selected[user.id] && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bulk actions bar (only when something selected) */}
        {hasSelection && (
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1E88E5' }]}
              onPress={() => setShowBanModal(true)}
            >
              <Text style={styles.actionText}>Ban selected</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#E53935' }]}
              onPress={onDelete}
            >
              <Text style={styles.actionText}>Delete selected</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ban modal */}
        <Modal transparent visible={showBanModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Ban duration (days)</Text>
              <TextInput
                value={banDays}
                onChangeText={setBanDays}
                keyboardType="numeric"
                style={styles.modalInput}
                placeholder="e.g. 7"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#1E88E5' }]}
                  onPress={onBan}
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
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#dbeafe',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  list: { paddingBottom: 120 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  userText: { fontSize: 16, fontWeight: 'bold', color: '#ffffffff' },
  uidText: { marginTop: 2, fontSize: 12, color: '#ffffffff' },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  actionsBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: 'bold' },

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
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
})

export default UsersInfo
