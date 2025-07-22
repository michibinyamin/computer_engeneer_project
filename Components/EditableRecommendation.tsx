import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import {
  addRecommendation,
  updateRecommendation,
  deleteRecommendation,
  fetchUserNameById,
  fetchUserNameFromRecommendation,
} from '../Services'
import { Ionicons } from '@expo/vector-icons'
import tinycolor from 'tinycolor2'
import { deleteDoc } from 'firebase/firestore'
import { ImageBackground } from 'react-native'
import { auth } from '../firebase'

const COLORS = [
  'black',
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Aqua Green
  '#FFD93D', // Bright Yellow
  '#1A8FE3', // Sky Blue
  '#FF8C42', // Orange
  '#9B5DE5', // Purple
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
    color = '#ff6f00',
    created_by: initialCreatedBy = '', // Default to empty string for new recommendation
    viewMode = 'view',
  } = route.params as {
    category_id: string
    recommendationId?: string // Optional for edit mode
    title: string
    content: string
    imageUrl?: string
    color?: string
    created_by?: string
    viewMode?: string
  }

  const [Mode, setMode] = useState(viewMode) // view, edit or new
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [image, setImage] = useState(imageUrl || '')
  const [selectedColor, setSelectedColor] = useState(color)
  const [recoId, setRecommendationId] = useState(initialRecommendationId) // Optional for edit mode
  //const [color, setColor] = useState(color);
  const [creatorId, setCreatorId] = useState(initialCreatedBy)
  const [usernameCreator, setUsernameCreator] = useState('')

  // i want to load the username of the creator of the recommendation
  useEffect(() => {
    const fetchCreatorUserName = async () => {
      const username = await fetchUserNameById(creatorId)
      setUsernameCreator(username || 'Unknown User')
    }

    fetchCreatorUserName()
  }, [])

  const brightColor = tinycolor(color).brighten(20).toHexString()

  const handleSave = async () => {
    if (Mode === 'edit') {
      await updateRecommendation(recoId, title, content, image, selectedColor)
    } else if (Mode === 'new') {
      const newId = await addRecommendation(
        category_id,
        title,
        content,
        image,
        selectedColor,
      )
      if (newId) setRecommendationId(newId)
    }
    setMode('view')
  }

  const handleDelete = async () => {
    if (recoId) {
      await deleteRecommendation(recoId)
      navigation.goBack()
    }
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
        ) : null}
        {Mode !== 'view' ? (
          <View style={{ marginTop: 10, marginBottom: 50 }}>
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
        <View
          style={{
            position: 'absolute',
            bottom: 30,
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
              onPress={() => handleDelete()}
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
        {/* <View style={styles.description}> */}
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: Mode === 'new' ? 'center' : 'space-between',
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: '#dbeafe', textAlign: 'left' }}>
            {Mode === 'view' && 'Created by: ' + usernameCreator}
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    //backgroundColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: 28,
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
    marginBottom: 110,
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
})

export default EditableRecommendation
