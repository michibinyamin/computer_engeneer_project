import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native'
import { auth } from '../firebase'
import { fetchGroups, createGroup } from '../Services'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Catagorys from './Catagorys'

const GroupsList = () => {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [groupEntered, setGroupEntered] = useState('') // Id will be here
  const user = auth.currentUser
  const navigation = useNavigation<any>()

  const [scaleAnimEntered] = useState(new Animated.Value(0.8))
  const [opacityAnimEntered] = useState(new Animated.Value(0))

  const [scaleAnimList] = useState(new Animated.Value(0.8))
  const [opacityAnimList] = useState(new Animated.Value(0))

  // Animate when groupEntered changes
  useEffect(() => {
    if (groupEntered) {
      scaleAnimEntered.setValue(0.8)
      opacityAnimEntered.setValue(0)
      Animated.parallel([
        Animated.timing(scaleAnimEntered, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimEntered, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scaleAnimList.setValue(0.8)
      opacityAnimList.setValue(0)
      Animated.parallel([
        Animated.timing(scaleAnimList, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimList, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [groupEntered])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadGroups()
    })
    return unsubscribe
  }, [])

  const loadGroups = async () => {
    const user = auth.currentUser
    if (!user) return
    const userGroups = await fetchGroups(user.uid)
    setOptions(userGroups)
  }

  const create_Group = async () => {
    const user = auth.currentUser
    if (!user || !groupName.trim()) return
    await createGroup(groupName, groupDesc, user.uid)
    setModalVisible(false)
    setGroupName('')
    setGroupDesc('')
    await loadGroups()
  }

  const renderGroupList = () => (
    <ScrollView contentContainerStyle={styles.groupListContainer}>
      {options.map((group, index) => (
        <TouchableOpacity
          key={index}
          style={styles.groupCard}
          onPress={() => setGroupEntered(group.id)}
        >
          <Text style={styles.groupName}>{group.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  const renderCreateGroupModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Create New Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Group name"
            value={groupName}
            onChangeText={setGroupName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={groupDesc}
            onChangeText={setGroupDesc}
            onPress={create_Group}
          />
          <View style={styles.buttonRow}>
            <Pressable style={styles.createButton} testID="create-button">
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
            <Pressable
              style={[styles.createButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
              testID="cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )

  return groupEntered ? (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnimEntered,
        transform: [{ scale: scaleAnimEntered }],
      }}
    >
      <Catagorys groupId={groupEntered} setGroupEntered={setGroupEntered} />
    </Animated.View>
  ) : (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnimList,
        transform: [{ scale: scaleAnimList }],
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Your Groups</Text>
        {renderGroupList()}
        <TouchableOpacity
          testID="open-modal-button"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={60} color="#dbeafe" />
        </TouchableOpacity>
        {renderCreateGroupModal()}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    //backgroundColor: '#f2f2f2',
    //backgroundColor: '#0a0f2c',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    //color: 'black',
    color: '#dbeafe', // light blue
  },
  groupListContainer: {
    padding: 20,
    gap: 12,
  },
  // groupCard: {
  //   backgroundColor: '#e0e0e0',
  //   paddingVertical: 20,
  //   paddingHorizontal: 25,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   elevation: 3,
  // },
  groupCard: {
    backgroundColor: '#1e3a8a', // deep blue
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    //color: 'black',
    color: '#f1f5f9', // soft white
  },

  fab: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    flex: 1,
    backgroundColor: 'darkblue',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
})

export default GroupsList
