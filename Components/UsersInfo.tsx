import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'
import { fetchUsers } from '../Services'

const UsersInfo = () => {
  const [users, setUsers] = useState<
    { id: string; username: string; email: string }[]
  >([])
  const [search, setSearch] = useState('')
  const navigation = useNavigation<any>()

  useEffect(() => {
    const fetchData = async () => {
      const fetched = await fetchUsers()
      setUsers(fetched)
    }

    fetchData()
  }, [])

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Users</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by username"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView contentContainerStyle={styles.list}>
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userBtn}
            onPress={() =>
              navigation.navigate('AdminUsersScreen', { userId: user.id })
            }
          >
            <Text style={styles.userText}>{user.username || user.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  list: {
    paddingBottom: 40,
  },
  userBtn: {
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  userText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default UsersInfo
