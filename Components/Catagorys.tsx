import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { db, auth } from '../firebase'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'
import RecommendationList from './RecommendationList'
import adminEmails from '../adminEmails.json'

const randomColors = [
  '#cc6666', // darker red
  '#6699cc', // darker blue
  '#99cc99', // darker green
  '#cc9966', // darker orange
  '#b399cc', // darker purple
  '#99cc99', // darker mint

  // added darker colors
  '#9966cc', // deep purple
  '#3399cc', // teal blue
  '#66a366', // moss green
  '#cc6666', // rose red
  '#996633', // brownish orange
  '#666699', // indigo
]

const Catagorys = ({
  groupId,
  setGroupEntered,
}: {
  groupId: any
  setGroupEntered: (id: string) => void
}) => {
  //const options = ['Cooking', 'Hikes', 'Books', 'Movies', 'Music', 'Travel', 'Fitness', 'Art']; // Example options
  const navigation = useNavigation()
  // const route = useRoute();
  // const { groupId } = route.params as { groupId: string };

  const [groupName, setGroupName] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [categoryModal, setCategoryModal] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [CatEntered, setCatEntered] = useState('') // Id will be here
  const [IsGroup, setIsGroup] = useState(false)
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

  useEffect(() => {
    if (!groupId) {
      console.error('groupId is not provided')
      return
    }
    const fetchGroupData = async () => {
      const groupRef = doc(db, 'groups', groupId)
      const groupSnap = await getDoc(groupRef)
      if (groupSnap.exists()) {
        setGroupName(groupSnap.data().name)
        setIsGroup(true)
      } else {
        setIsGroup(false)
      }
      fetchCategories()
    }
    fetchGroupData()
  }, [groupId])

  // replace with services functions
  const fetchCategories = async () => {
    const q = query(collection(db, 'catagory'), where('groupId', '==', groupId))
    const snapshot = await getDocs(q)
    const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setCategories(result)
  }

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return
    await addDoc(collection(db, 'catagory'), {
      name: categoryName,
      groupId,
    })
    setCategoryModal(false)
    setCategoryName('')
    fetchCategories()
  }

  const handleDeleteCategory = async (id: string) => {
    if (groupId === 'General' && !isAdmin) {
      return
    }
    Alert.alert('Confirm', 'Are you sure you want to delete this category?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'catagory', id))
          fetchCategories()
        },
      },
    ])
  }

  return CatEntered ? (
    <RecommendationList
      category_id={CatEntered}
      setCatEntered={setCatEntered}
    />
  ) : (
    <View style={styles.container}>
      {IsGroup && (
        <View style={styles.header}>
          <Text style={styles.centeredGroupName}>{groupName}</Text>
          <TouchableOpacity onPress={() => setGroupEntered('')}>
            <Ionicons name="arrow-back" size={24} color="#dbeafe" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.membersButton}
            onPress={() => navigation.navigate('Members', { groupId })}
          >
            <Text style={styles.membersText}>Members</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.grid}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={cat.id}
            onLongPress={() => handleDeleteCategory(cat.id)}
            onPress={() => setCatEntered(cat.id)}
            style={[
              styles.category,
              { backgroundColor: randomColors[index % randomColors.length] },
            ]}
          >
            <Text style={styles.categoryText}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {(groupId !== 'General' || isAdmin) && (
        <TouchableOpacity
          style={styles.addCategoryBtn}
          onPress={() => setCategoryModal(true)}
        >
          <Text style={styles.fabText}>+ Add Category</Text>
        </TouchableOpacity>
      )}

      {/* Category Modal */}
      <Modal visible={categoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput
              placeholder="Category name"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.inviteButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCategoryModal(false)}>
              <Text
                style={{ color: 'red', textAlign: 'center', marginTop: 10 }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0a0f2c',
    //backgroundColor: 'white',
    position: 'relative',
  },
  centeredGroupName: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dbeafe', // light blue
  },
  membersButton: {
    backgroundColor: 'darkblue',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  membersText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
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
    marginTop: 10,
  },
  inviteButton: {
    backgroundColor: 'darkblue',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  grid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  category: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff', // this will be overridden by your color
  },

  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  addCategoryBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'darkblue',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Catagorys
