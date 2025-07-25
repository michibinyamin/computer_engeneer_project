import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  BackHandler,
  Image,
  Animated,
} from 'react-native'
import { fetchRecommendations } from '../Services'
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'

const COLORS = [
  'black',
  '#FF6B6B',
  '#4ECDC4',
  '#FFD93D',
  '#1A8FE3',
  '#FF8C42',
  '#9B5DE5',
]

const RecommendationList = ({
  category_id,
  setCatEntered,
}: {
  category_id: any
  setCatEntered: (id: string) => void
}) => {
  useFocusEffect(
    React.useCallback(() => {
      loadRecommendations()
    }, [category_id])
  )

  const navigation = useNavigation()
  const route = useRoute()

  const [options, setOptions] = useState<
    {
      recoId: string
      title: string
      content: string
      imageUrl?: string
      location?: string
      created_by?: string
      color?: string
    }[]
  >([])

  const [scaleAnim] = useState(new Animated.Value(0.8))
  const [opacityAnim] = useState(new Animated.Value(0))
  const firstRender = useRef(true)
  const [catName, setCatName] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadRecommendations()
    })
    return unsubscribe
  }, [category_id])

  const loadRecommendations = async () => {
    const user = auth.currentUser
    if (!user) return
    const Recommendations = await fetchRecommendations(category_id)
    setOptions(
      Recommendations.map((r: any, idx: number) => ({
        ...r,
        color: r.color || COLORS[idx % COLORS.length],
      }))
    )
  }

  // Animate ONLY on first mount, not when navigating back
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false

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
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [options])

  useEffect(() => {
    const fetchCatName = async () => {
      const catRef = doc(db, 'catagory', category_id)
      const catSnap = await getDoc(catRef)
      if (catSnap.exists()) {
        setCatName(catSnap.data().name)
      }
    }
    fetchCatName()
  }, [category_id])

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.centeredGroupName}>{catName}</Text>
        <TouchableOpacity onPress={() => setCatEntered('')}>
          <Ionicons name="arrow-back" size={24} color="#dbeafe" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Animated.View
          style={{
            flex: 1,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <ScrollView contentContainerStyle={styles.grid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      option.color || COLORS[index % COLORS.length],
                  },
                ]}
                onPress={() =>
                  navigation.navigate('EditableRecommendation', {
                    category_id: category_id,
                    recommendationId: option.recoId,
                    title: option.title,
                    content: option.content,
                    imageUrl: option.imageUrl,
                    location: option.location,
                    color: option.color,
                    created_by: option.created_by,
                    viewMode: 'view',
                  })
                }
              >
                {option.imageUrl ? (
                  <Image
                    source={{ uri: option.imageUrl }}
                    style={styles.tileImage}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={styles.titleOverlay}>
                  <Text style={styles.buttonText}>{option.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <TouchableOpacity
          style={styles.addRecoBtn}
          onPress={() => {
            navigation.navigate('EditableRecommendation', {
              category_id: category_id,
              recommendationId: '',
              title: '',
              content: '',
              imageUrl: '',
              location: '',
              color: 'black',
              created_by: auth.currentUser?.uid,
              viewMode: 'new',
            })
          }}
        >
          <Text style={styles.fabText}>+ Add Recommendation</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default RecommendationList

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0a0f2c',
    position: 'relative',
  },
  centeredGroupName: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dbeafe',
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '47%',
    height: 160,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  addRecoBtn: {
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
