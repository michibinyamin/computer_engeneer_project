import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useNavigation, useRoute } from '@react-navigation/native'
import {
  addRecommendation,
  updateRecommendation,
  deleteRecommendation,
  fetchUserNameById,
  addRating,
  fetchRatingsByRecommendation,
  fetchRatingsByRecommendationCount,
} from '../Services'
import { Ionicons } from '@expo/vector-icons'
//import tinycolor from 'tinycolor2'
import { deleteDoc } from 'firebase/firestore'
import { ImageBackground } from 'react-native'
import { auth } from '../firebase'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
import { log } from 'detox'
import adminEmails from '../adminEmails.json'

const COLORS = [
  'black',
  '#CC5555', // Darker Coral Red
  '#3BA49A', // Darker Aqua Green
  '#CCAD31', // Darker Bright Yellow
  '#166EAF', // Darker Sky Blue
  '#CC7035', // Darker Orange
  '#7C48B8', // Darker Purple
]

const EditableRecommendation = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const {
    category_id,
    recommendationId: initialRecommendationId = '', // Default to empty string for new recommendation
    title: initialTitle,
    content: initialContent,
    imageUrl,
    location: initialLocation = '',
    color = '#ff6f00',
    created_by: initialCreatedBy = '', // Default to empty string for new recommendation
    viewMode = 'view',
  } = route.params as {
    category_id: string
    recommendationId?: string // Optional for edit mode
    title: string
    content: string
    imageUrl?: string
    location?: string
    color?: string
    created_by?: string
    viewMode?: string
  }

  const [Mode, setMode] = useState(viewMode) // view, edit or new
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [image, setImage] = useState(imageUrl || '')
  const [location, setLocation] = useState(initialLocation)
  const [selectedColor, setSelectedColor] = useState(color)
  const [recoId, setRecommendationId] = useState(initialRecommendationId) // Optional for edit mode
  //const [color, setColor] = useState(color);
  const [creatorId, setCreatorId] = useState(initialCreatedBy)
  const [usernameCreator, setUsernameCreator] = useState('')
  const [showRating, setShowRating] = useState(false)
  const [ratings, setRatings] = useState<string>('')
  const [voterCount, setVoterCount] = useState(0)
  
  const [isPublisher, setIsPublisher] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const canEdit = isPublisher || isAdmin


  // i want to load the username of the creator of the recommendation
  useEffect(() => {
    const fetchCreatorUserName = async () => {
      const username = await fetchUserNameById(creatorId)
      setUsernameCreator(username || 'Unknown User')
    }

    fetchCreatorUserName()
  }, [recoId])

  useEffect(() => {
  const u = auth.currentUser
  setIsPublisher(!!(u && creatorId && u.uid === creatorId))

  // optional admin check (matches pattern used in other files)
  if (u && adminEmails.includes(u.email ?? '')) {
    setIsAdmin(true)
  } else {
    setIsAdmin(false)
  }
}, [creatorId])

  useEffect(() => {
    const fetchRatingByRecoId = async () => {
      if (recoId) {
        const rating = await fetchRatingsByRecommendation(recoId)
        console.log('Rating for recommendation:', rating, recoId)
        switch (Math.round(rating)) {
          case 1:
            setRatings('⭐')
            break
          case 2:
            setRatings('⭐⭐')
            break
          case 3:
            setRatings('⭐⭐⭐')
            break
          case 4:
            setRatings('⭐⭐⭐⭐')
            break
          case 5:
            setRatings('⭐⭐⭐⭐⭐')
            break
          default:
            setRatings('No Rating')
        }
      }
    }

    const fetchVoterCount = async () => {
      if (recoId) {
        const count = await fetchRatingsByRecommendationCount(recoId)
        setVoterCount(count)
      }
    }

    fetchRatingByRecoId()
    fetchVoterCount()
  }, [showRating, recoId])

  //const brightColor = tinycolor(color).brighten(20).toHexString()

  const handleSave = async () => {
  if (Mode === 'edit' && !canEdit) {
    Alert.alert('Permission denied', 'Only the publisher can edit this.')
    return
  }
  if (Mode === 'edit') {
    await updateRecommendation(recoId, title, content, image, location, selectedColor)
  } else if (Mode === 'new') {
    const newId = await addRecommendation(
      category_id, title, content, image, location, selectedColor
    )
    if (newId) {
      setRecommendationId(newId)
      setCreatorId(auth.currentUser?.uid || '')
      setIsPublisher(true) // you are the creator of the new item
    }
  }
  setMode('view')
}

const handleDelete = async () => {
  if (!canEdit) {
    Alert.alert('Permission denied', 'Only the publisher can delete this.')
    return
  }
  Alert.alert('Delete Recommendation', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        if (recoId) {
          await deleteRecommendation(recoId)
          navigation.goBack()
        }
      },
    },
  ])
}
  const onRate = async (rate: number) => {
    const result = await addRating(
      recoId,
      rate,
      auth.currentUser?.uid,
      'Test Comment'
    )
    setShowRating(false)
    Alert.alert(
      result ? 'Thank you for your rating!' : 'Your Rate has been updated.'
    )
  }

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          //backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#0a0f2c',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 16 }}
        >
          <Ionicons name="arrow-back" size={28} color="#dbeafe" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#dbeafe', // light blue
          }}
        >
          Recommendation
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {Mode !== 'view' ? (
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Recommendation title"
            multiline
          />
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        <View style={[styles.divider, { backgroundColor: selectedColor }]} />
        {Mode !== 'view' ? (
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="Recommendation content"
            multiline
          />
        ) : (
          <Text style={styles.content}>{content}</Text>
        )}
        {Mode !== 'view' && (
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={setImage}
            placeholder={imageUrl ? imageUrl : 'Add an image URL'}
            multiline
          />
        )}
        {Mode === 'view' && image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          //Mode === 'view' && <View style={{ height: 120 }} />
          Mode === 'view' && <View />
        )}

        {Mode !== 'view' && (
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location (lat,lng)"
          />
        )}

        {Mode === 'view' && location ? (
          <MapView
            style={styles.location}
            initialRegion={{
              latitude: parseFloat(location.split(',')[0]),
              longitude: parseFloat(location.split(',')[1]),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(location.split(',')[0]),
                longitude: parseFloat(location.split(',')[1]),
              }}
            />
          </MapView>
        ) : (
          Mode === 'view' && <View style={{ height: 200 }} />
        )}

        {Mode !== 'view' ? (
          <View style={{ marginTop: 0, marginBottom: 80 }}>
            <Text style={{ fontWeight: 'bold' }}>Choose a color:</Text>
            <View style={styles.colorPickerRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 3 : 1,
                      borderColor: selectedColor === color ? 'black' : '#ccc',
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Bottom buttons: show only if canEdit */}
        {canEdit && (
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: Mode === 'new' ? 'center' : 'space-between',
              paddingHorizontal: 20,
            }}
          >
            {Mode !== 'new' && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ff6666' }]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: selectedColor }]}
              onPress={() =>
                Mode === 'edit' || Mode === 'new' ? handleSave() : setMode('edit')
              }
            >
              <Text style={styles.buttonText}>
                {Mode === 'edit' || Mode === 'new' ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* <View style={styles.description}> */}
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            width: '100%',
            //alignItems: 'center's,
            paddingHorizontal: 20,
          }}
        >
          {Mode === 'view' && (
            <View>
              <Text
                style={{
                  color: '#333',
                  fontSize: 16,
                  fontFamily: 'serif',
                  lineHeight: 22,
                  textAlign: 'center',
                  marginVertical: 10,
                }}
              >
                Created by:{' '}
                <Text style={{ fontWeight: 'bold' }}>{usernameCreator}</Text>
                {'\n'}
                Overall Ratings: {ratings} ({voterCount})
              </Text>
              <TouchableOpacity
                onPress={() => setShowRating(true)}
                style={{
                  backgroundColor: '#4682B4',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  ⭐ Rate!
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Modal visible={showRating} transparent animationType="fade">
          <View style={styles.overlayR}>
            <View style={styles.modalR}>
              <Text style={styles.titleR}>⭐ Rate this Recommendation</Text>
              <Text style={styles.subtitleR}>Choose a rating from 1 to 5:</Text>
              <View style={styles.buttonsR}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => onRate(num)}
                    style={styles.buttonR}
                  >
                    <Text style={{ fontSize: 20 }}>{'⭐'.repeat(num)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowRating(false)}
                style={styles.cancelR}
              >
                <Text style={{ color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    //backgroundColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 15,
    margin: 20,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    // height: '88%', ← remove or replace
    minHeight: '88%',
  },
  grid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    //marginBottom: 140,
    marginTop: 20,
  },
  location: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 200,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
    color: 'black',
  },
  divider: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginVertical: 16,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  input: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
  },
  button: {
    //marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 4,
  },
  overlayText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  colorPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  description: {
    marginTop: 20,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  overlayR: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalR: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  titleR: { fontSize: 18, fontWeight: 'bold' },
  subtitleR: { marginTop: 10, marginBottom: 20 },
  buttonsR: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  buttonR: {
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
    margin: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  cancelR: { marginTop: 20 },
})

export default EditableRecommendation
