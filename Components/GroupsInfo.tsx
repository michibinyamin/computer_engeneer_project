// Components/GroupsInfo.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Alert,                 // ➕ added
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'      // ➕ added
import { fetchAllGroups, deleteGroupCascade } from '../Services' // ➕ added deleteGroupCascade
import Catagorys from './Catagorys'

// Tiny inline screen that shows a group's page directly using your existing component
export function OpenGroupScreen({ route, navigation }: any) {
  const { groupId } = route.params
  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Catagorys
        groupId={groupId}
        setGroupEntered={() => navigation.goBack()}
      />
    </ImageBackground>
  )
}

type GroupItem = {
  id: string
  name: string
  description?: string
  created_by?: string
}

const GroupsInfo = () => {
  const navigation = useNavigation<any>()
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [search, setSearch] = useState('')

  // ➕ added multi-select state
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const all = await fetchAllGroups()
      setGroups(all)
      setSelected({}) // reset selection on load
    }
    load()
  }, [])

  const filtered = groups.filter((g) =>
    (g.name || '').toLowerCase().includes(search.toLowerCase())
  )

  // ➕ helpers for selection
  const selectedIds = Object.keys(selected).filter((id) => selected[id])
  const hasSelection = selectedIds.length > 0
  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleAll = () => {
    if (!filtered.length) return
    const allIds = filtered.map((g) => g.id)
    const allSelected = allIds.every((id) => selected[id])
    if (allSelected) {
      setSelected((prev) => {
        const next = { ...prev }
        allIds.forEach((id) => delete next[id])
        return next
      })
    } else {
      setSelected((prev) => {
        const next = { ...prev }
        allIds.forEach((id) => (next[id] = true))
        return next
      })
    }
  }
  const confirmDeleteSelected = () => {
    if (!hasSelection) return
    Alert.alert(
      'Delete groups',
      `Delete ${selectedIds.length} selected group(s) and all their data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDeleteSelected },
      ]
    )
  }
  const doDeleteSelected = async () => {
    if (!hasSelection) return
    try {
      setIsDeleting(true)
      await Promise.all(selectedIds.map((gid) => deleteGroupCascade(gid)))
      // refresh
      const all = await fetchAllGroups()
      setGroups(all)
      setSelected({})
    } catch (e) {
      Alert.alert('Error', 'Failed to delete one or more groups.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>All Groups</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by group name"
          value={search}
          onChangeText={setSearch}
        />

        {/* ➕ small toolbar for bulk actions */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={toggleAll}>
            <Text style={styles.toolbarBtnText}>Select / Clear Visible</Text>
          </TouchableOpacity>

          {hasSelection && (
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: '#b91c1c' }]}
              onPress={confirmDeleteSelected}
              disabled={isDeleting}
            >
              <Text style={styles.toolbarBtnText}>
                {isDeleting ? 'Deleting…' : `Delete Selected (${selectedIds.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No groups found</Text>
          ) : (
            filtered.map((g) => (
              // ➕ wrap each row to host the checkbox (kept your button intact)
              <View key={g.id} style={styles.row}>
                <TouchableOpacity
                  style={styles.groupBtn}
                  // ✅ Directly open the group's page (categories view)
                  onPress={() => navigation.navigate('OpenGroup', { groupId: g.id })}
                >
                  <Text style={styles.groupText}>{g.name || '(no name)'}</Text>
                </TouchableOpacity>

                {/* ➕ checkbox */}
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!selected[g.id] }}
                  onPress={() => toggle(g.id)}
                  style={[styles.checkbox, selected[g.id] && styles.checkboxChecked]}
                >
                  {selected[g.id] && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  )
}

export default GroupsInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#dbeafe',
  },
  searchInput: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  // ➕ toolbar styles
  toolbar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  toolbarBtn: {
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  toolbarBtnText: { color: '#f8fafc', fontWeight: '600' },

  list: {
    paddingBottom: 40,
  },

  // ➕ row + checkbox styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
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

  groupBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.85)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  groupText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  emptyText: {
    textAlign: 'center',
    color: '#dbeafe',
    marginTop: 16,
  },
})
