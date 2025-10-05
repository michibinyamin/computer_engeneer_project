import React, { useEffect, useMemo, useState, useRef } from 'react'
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
  PermissionsAndroid,
  Platform,
} from 'react-native'
import ReportModal from './ReportModal'
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
import { ImageBackground, Linking } from 'react-native'
import { auth, db } from '../firebase'
import adminEmails from '../adminEmails.json'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'

import { Toast } from 'react-native-toast-message/lib/src/Toast'

const COLORS = [
  'black',
  '#CC5555', // Darker Coral Red
  '#3BA49A', // Darker Aqua Green
  '#CCAD31', // Darker Bright Yellow
  '#166EAF', // Darker Sky Blue
  '#CC7035', // Darker Orange
  '#7C48B8', // Darker Purple
  '#FF69B4', // Hot Pink
]

type RouteParams = {
  category_id: string
  recommendationId?: string
  title: string
  content: string
  imageUrl?: string
  location?: string
  color?: string
  created_by?: string
  viewMode?: 'view' | 'edit' | 'new'
  myLocation?: {
    latitude: number
    longitude: number
  } | null
}

const EditableRecommendation = () => {
  const navigation = useNavigation()
  const route = useRoute()

  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedComment, setSelectedComment] = useState<{
    id: string
    userId: string
    userName: string
    text: string
  } | null>(null)

  const {
    category_id,
    recommendationId: initialRecommendationId = '',
    title: initialTitle,
    content: initialContent,
    imageUrl,
    location: initialLocation = '',
    color = '#ff6f00',
    created_by: initialCreatedBy = '',
    viewMode = 'view',
    myLocation = null,
  } = route.params as RouteParams

  // Core state
  const [Mode, setMode] = useState<RouteParams['viewMode']>(viewMode)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [image, setImage] = useState(imageUrl || '')
  const [location, setLocation] = useState(initialLocation)
  const [selectedColor, setSelectedColor] = useState(color)
  const [recoId, setRecommendationId] = useState(initialRecommendationId)
  const [creatorId, setCreatorId] = useState(initialCreatedBy)

  // Meta
  const [usernameCreator, setUsernameCreator] = useState('')
  const [showRating, setShowRating] = useState(false)
  const [ratings, setRatings] = useState<string>('No Rating')
  const [voterCount, setVoterCount] = useState(0)

  // Permissions
  const [isPublisher, setIsPublisher] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const canEdit = isPublisher || isAdmin

  // const [myLocation, setMyLocation] = useState<{
  //   latitude: number
  //   longitude: number
  // } | null>(null)

  // useEffect(() => {
  //   const getLocation = async () => {
  //     try {
  //       const { status } = await Location.getForegroundPermissionsAsync()

  //       if (status !== 'granted') {
  //         const request = await Location.requestForegroundPermissionsAsync()
  //         if (request.status !== 'granted') {
  //           console.warn('Permission not granted')
  //           return
  //         }
  //       }

  //       const location = await Location.getCurrentPositionAsync({})
  //       setMyLocation({
  //         latitude: location.coords.latitude,
  //         longitude: location.coords.longitude,
  //       })
  //       console.log(
  //         'current location:',
  //         location.coords.latitude,
  //         ',',
  //         location.coords.longitude
  //       )
  //     } catch (err) {
  //       console.error('Error:', err)
  //     }
  //   }

  //   getLocation()
  // }, [])

  // Comments
  const [comments, setComments] = useState<
    Array<{
      id: string
      text: string
      user_id: string
      username: string
      createdAt?: any
      likes: string[]
      dislikes: string[]
    }>
  >([])
  const [newComment, setNewComment] = useState('')

  // ----- Load creator username -----
  useEffect(() => {
    const run = async () => {
      if (!creatorId) return
      const username = await fetchUserNameById(creatorId)
      setUsernameCreator(username || 'Unknown User')
    }
    run()
  }, [creatorId])

  // ----- Compute publisher/admin flags -----
  useEffect(() => {
    const u = auth.currentUser
    setIsPublisher(!!(u && creatorId && u.uid === creatorId))
    setIsAdmin(!!(u && adminEmails.includes(u.email ?? '')))
  }, [creatorId])

  // ----- Ratings -----
  useEffect(() => {
    const load = async () => {
      if (!recoId) return
      const avg = await fetchRatingsByRecommendation(recoId)
      const rounded = Math.round(avg || 0)
      setRatings(rounded ? '⭐'.repeat(rounded) : 'No Rating')
      const count = await fetchRatingsByRecommendationCount(recoId)
      setVoterCount(count)
    }
    load()
  }, [showRating, recoId])

  // ----- Live comments (no index needed; sort client-side) -----
  useEffect(() => {
    if (!recoId) return
    const q = query(
      collection(db, 'comments'),
      where('recommendation_id', '==', recoId)
    )
    const unsub = onSnapshot(q, async (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      // Fetch usernames in parallel
      const withNames = await Promise.all(
        rows.map(async (r) => {
          const username = await fetchUserNameById(r.user_id)
          return {
            id: r.id,
            text: r.text,
            user_id: r.user_id,
            createdAt: r.createdAt,
            likes: r.likes || [],
            dislikes: r.dislikes || [],
            username: username || 'Anonymous',
          }
        })
      )
      // Order by createdAt ascending, client-side (avoids composite index)
      withNames.sort((a, b) => {
        const ad = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0
        const bd = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0
        return (ad as any) - (bd as any)
      })
      setComments(withNames)
    })
    return unsub
  }, [recoId])

  // ----- Handlers -----
  const handleSave = async () => {
    if (Mode === 'edit' && !canEdit) {
      Alert.alert('Permission denied', 'Only the publisher can edit this.')
      return
    }
    if (Mode === 'edit') {
      await updateRecommendation(
        recoId,
        title,
        content,
        image,
        location,
        selectedColor
      )
    } else if (Mode === 'new') {
      const newId = await addRecommendation(
        category_id,
        title,
        content,
        image,
        location,
        selectedColor
      )
      if (newId) {
        setRecommendationId(newId)
        setCreatorId(auth.currentUser?.uid || '')
        setMode('view')
        setIsPublisher(true)
        return
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
          if (!recoId) return
          await deleteRecommendation(recoId)
          navigation.goBack()
        },
      },
    ])
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    const u = auth.currentUser
    if (!u) {
      Alert.alert('Login required')
      return
    }
    await addDoc(collection(db, 'comments'), {
      recommendation_id: recoId,
      user_id: u.uid,
      text: newComment.trim(),
      likes: [],
      dislikes: [],
      createdAt: serverTimestamp(),
    })
    setNewComment('')
  }

  const handleVote = async (commentId: string, type: 'like' | 'dislike') => {
    const u = auth.currentUser
    if (!u) return Alert.alert('Login required')
    const uid = u.uid
    const ref = doc(db, 'comments', commentId)
    const c = comments.find((x) => x.id === commentId)
    if (!c) return
    if (type === 'like') {
      if (c.likes.includes(uid)) {
        await updateDoc(ref, { likes: arrayRemove(uid) })
      } else {
        await updateDoc(ref, {
          likes: arrayUnion(uid),
          dislikes: arrayRemove(uid),
        })
      }
    } else {
      if (c.dislikes.includes(uid)) {
        await updateDoc(ref, { dislikes: arrayRemove(uid) })
      } else {
        await updateDoc(ref, {
          dislikes: arrayUnion(uid),
          likes: arrayRemove(uid),
        })
      }
    }
  }

  const handleDeleteComment = async (commentId: string, ownerUid: string) => {
    const u = auth.currentUser
    if (!u) return
    if (u.uid !== ownerUid && !isAdmin) return
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'comments', commentId))
        },
      },
    ])
  }

  const calculateDistance = (
    userLocation: { latitude: number; longitude: number } | null
  ) => {
    if (!userLocation || !location) return '?'
    const [lat, lng] = location.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return '?'
    const distance = getDistance(userLocation, {
      latitude: lat,
      longitude: lng,
    })
    return distance
  }
  const getDistance = (loc1: any, loc2: any) => {
    const toRad = (value: number) => (value * Math.PI) / 180
    const R = 6371 // Radius of the Earth in km
    const dLat = toRad(loc2.latitude - loc1.latitude)
    const dLon = toRad(loc2.longitude - loc1.longitude)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(loc1.latitude)) *
        Math.cos(toRad(loc2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c)
  }

  const onRate = async (rate: number) => {
    const result = await addRating(
      recoId,
      rate,
      auth.currentUser?.uid,
      'rating'
    )
    setShowRating(false)
    Toast.show({
      type: 'success',
      text1: `${rate} stars submitted successfully!`,
      position: 'top',
      visibilityTime: 2000, // disappears after 2 seconds
    })
    // Alert.alert(
    //   result ? 'Thank you for your rating!' : 'Your rate has been updated.'
    // )
  }

  const formatDate = (ts: any) => {
    if (!ts) return ''
    const d = ts?.toDate ? ts.toDate() : ts
    try {
      return d.toLocaleString()
    } catch {
      return ''
    }
  }

  // Derived booleans
  const inAddOrEdit = Mode !== 'view'

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 16 }}
        >
          <Ionicons name="arrow-back" size={28} color="#dbeafe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommendation</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          // keep add/edit screen identical to your original layout
          inAddOrEdit ? {} : { paddingBottom: 28 },
        ]}
      >
        {/* Title */}
        {inAddOrEdit ? (
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

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: selectedColor }]} />

        {/* Content */}
        {inAddOrEdit ? (
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

        {/* Image url input only while editing/creating */}
        {inAddOrEdit && (
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={setImage}
            placeholder={imageUrl ? imageUrl : 'Add an image URL'}
            multiline
          />
        )}

        {/* Image preview in view mode */}
        {!inAddOrEdit && !!image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {/* Location input only while editing/creating */}
        {inAddOrEdit && (
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location (lat,lng)"
          />
        )}

        {/* Map preview in view mode */}
        {/* {!inAddOrEdit && !!location ? (
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
        ) : !inAddOrEdit ? (
          <View style={{ height: 10 }} />
        ) : null} */}

        {!inAddOrEdit && !!location ? (
          // i want to add here also the distance from the location to my current location
          <>
            <TouchableOpacity
              style={styles.buttonUrl}
              onPress={() => {
                const [lat, lng] = location.split(',').map(Number)
                const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                Linking.openURL(url)
              }}
            >
              <Text style={styles.buttonTextUrl}>View Location on Map</Text>
            </TouchableOpacity>
            <View style={{ marginBottom: 10, marginTop: -8 }}>
              <Text>{calculateDistance(myLocation)} km from you</Text>
            </View>
          </>
        ) : !inAddOrEdit ? (
          <View style={{ height: 10 }} />
        ) : null}

        {/* Map preview in view mode */}

        {/* Color picker — ONLY when adding/editing (unchanged from your UI) */}
        {inAddOrEdit && (
          <View
            style={{ marginTop: 0, marginBottom: 24, alignSelf: 'stretch' }}
          >
            <Text style={{ fontWeight: 'bold' }}>Choose a color:</Text>
            <View style={styles.colorPickerRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c,
                      borderWidth: selectedColor === c ? 3 : 1,
                      borderColor: selectedColor === c ? 'black' : '#ccc',
                    },
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Save button inside panel for add/edit (keeps your original look) */}
        {inAddOrEdit && (
          <TouchableOpacity style={[styles.saveBtn]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        )}

        {/* Publisher + rating (inline; no collision) */}
        {!inAddOrEdit && (
          <View
            style={{ alignSelf: 'stretch', marginTop: 16, marginBottom: 12 }}
          >
            <Text
              style={{
                color: '#333',
                fontSize: 16,
                fontFamily: 'serif',
                lineHeight: 22,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Created by:{' '}
              <Text style={{ fontWeight: 'bold' }}>{usernameCreator}</Text>
              {'\n'}
              Overall Ratings: {ratings} ({voterCount})
            </Text>
            <View style={{ alignItems: 'center' }}>
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
                  style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}
                >
                  ⭐ Rate!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments (view mode only) */}
        {!inAddOrEdit && (
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>

            {/* Input row */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                style={styles.commentSend}
              >
                <Ionicons name="send" size={22} color="darkblue" />
              </TouchableOpacity>
            </View>

            {/* List */}
            {comments.map((c) => {
              const me = auth.currentUser?.uid
              const iLike = !!me && c.likes.includes(me)
              const iDislike = !!me && c.dislikes.includes(me)
              const canRemove = me === c.user_id || isAdmin
              return (
                <TouchableOpacity
                  key={c.id}
                  onLongPress={() =>
                    canRemove && handleDeleteComment(c.id, c.user_id)
                  }
                  delayLongPress={300}
                  style={styles.commentCard}
                >
                  <Text style={styles.commentUser}>@{c.username}</Text>
                  <Text>{c.text}</Text>
                  <Text style={styles.commentDate}>
                    {formatDate(c.createdAt)}
                  </Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => handleVote(c.id, 'like')}
                      style={styles.commentBtn}
                    >
                      <Ionicons
                        name={iLike ? 'thumbs-up' : 'thumbs-up-outline'}
                        size={16}
                        color="green"
                      />
                      <Text style={{ marginLeft: 4 }}>{c.likes.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleVote(c.id, 'dislike')}
                      style={styles.commentBtn}
                    >
                      <Ionicons
                        name={iDislike ? 'thumbs-down' : 'thumbs-down-outline'}
                        size={16}
                        color="red"
                      />
                      <Text style={{ marginLeft: 4 }}>{c.dislikes.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedComment({
                          id: c.id,
                          userId: c.user_id,
                          userName: c.username,
                          text: c.text,
                        })
                        setShowReportModal(true)
                      }}
                      style={styles.commentBtn}
                    >
                      <Ionicons name="flag-outline" size={16} color="orange" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Action buttons (view mode only) */}
        {!inAddOrEdit && canEdit && (
          <View style={styles.bottomButtonsInline}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ff6666' }]}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: selectedColor }]}
              onPress={() => setMode('edit')}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Rating modal */}
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

      <ReportModal
        visible={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedComment(null)
        }}
        reportedItemType="comment"
        reportedItemId={selectedComment?.id || ''}
        reportedUserId={selectedComment?.userId || ''}
        reportedUserName={selectedComment?.userName || ''}
        recommendationId={recoId}
        commentText={selectedComment?.text}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
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
    minHeight: '88%',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0a0f2c',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dbeafe',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
    color: 'black',
    alignSelf: 'stretch',
  },
  divider: {
    height: 4,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 2,
    marginVertical: 16,
    backgroundColor: 'linear-gradient(90deg, #ff7eb3, #ff758c, #ff7eb3)', // if using expo-linear-gradient
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
    minHeight: 60,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 20,
  },
  location: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 20,
  },
  colorPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    width: '70%',
    alignSelf: 'center',
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 3, // spacing between circles
  },

  // Save button inside the panel (add/edit screen)
  saveBtn: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 15,
  },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // View-mode action buttons
  bottomButtonsInline: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: { paddingVertical: 10, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Comments
  commentsSection: { alignSelf: 'stretch', marginTop: 10 },
  commentsTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  commentSend: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  commentCard: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
  },
  commentUser: { fontWeight: 'bold', marginBottom: 4 },
  commentDate: { fontSize: 12, color: '#666', marginTop: 2 },
  commentActions: { flexDirection: 'row', marginTop: 6 },
  commentBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },

  // Rating modal
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
  buttonUrl: {
    backgroundColor: '#2570baff', // nice blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonTextUrl: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default EditableRecommendation
