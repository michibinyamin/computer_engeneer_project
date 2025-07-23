import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore'
import { db, auth } from './firebase'

// Fetches group names for a user
export const fetchGroups = async (user_id: string | undefined) => {
  if (!user_id) return []

  const membershipSnap = await getDocs(collection(db, 'membership'))
  const userGroupIds = membershipSnap.docs
    .filter((doc) => doc.data().user_id === user_id)
    .map((doc) => doc.data().group_id)

  const groupSnap = await getDocs(collection(db, 'groups'))
  const userGroups = groupSnap.docs
    .filter((doc) => userGroupIds.includes(doc.id))
    .map((doc) => ({ id: doc.id, name: doc.data().name }))

  return userGroups
}

// Adds to group collection
export const createGroup = async (
  groupName: string,
  groupDesc: string,
  createdByUserId: string
) => {
  try {
    const groupRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      description: groupDesc,
      created_by: createdByUserId,
    })

    await addDoc(collection(db, 'membership'), {
      membership_id: `membership_${Date.now()}`,
      user_id: createdByUserId,
      group_id: groupRef.id,
      role: 'Admin',
    })
  } catch (error) {
    console.error('Create group failed:', error)
    alert('Failed to create group')
  }
}

export const addMembership = async (
  inviteUsername: string,
  group_id: string
) => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'))
    const userDoc = usersSnap.docs.find(
      (doc) => doc.data().username === inviteUsername
    )
    if (!userDoc) return alert('User not found')

    const invitedUserId = userDoc.id
    await addDoc(collection(db, 'membership'), {
      membership_id: `membership_${Date.now()}`,
      user_id: invitedUserId,
      group_id: group_id,
      role: 'Member',
    })
  } catch (err) {
    console.error('Invite failed:', err)
  }
}

export const fetchCategories = async (group_id: string) => {
  if (!group_id) return []

  const categoriesSnap = await getDocs(collection(db, 'categories'))
  const groupCategories = categoriesSnap.docs
    .filter((doc) => doc.data().group_id === group_id)
    .map((doc) => doc.data().name)

  return groupCategories
}

// Fetches recomendations froma a group
export const fetchRecommendations = async (category_id: string | undefined) => {
  if (!category_id) return []

  const categoriesSnap = await getDocs(collection(db, 'recommendations'))
  const recomendations = categoriesSnap.docs
    .filter((doc) => doc.data().category_id === category_id)
    .map((doc) => ({
      recoId: doc.id,
      title: doc.data().title,
      content: doc.data().content,
      imageUrl: doc.data().imageUrl,
      location: doc.data().location,
      created_by: doc.data().created_by,
      color: doc.data().color, // Default color if not set
    }))

  return recomendations
}

export const addRecommendation = async (
  category_id: string,
  title: string,
  content: string,
  imageUrl?: string,
  location?: string,
  color?: string
): Promise<string | undefined> => {
  if (!title.trim() || !category_id) return

  try {
    const docRef = await addDoc(collection(db, 'recommendations'), {
      title,
      content,
      category_id,
      created_by: auth.currentUser?.uid,
      imageUrl: imageUrl || '',
      location: location || '',
      color: color || '#ff6f00',
    })
    return docRef.id // Return the new document ID
  } catch (error) {
    console.error('Add recommendation failed:', error)
    alert('Failed to add recommendation')
  }
}

export const updateRecommendation = async (
  recommendationId: string,
  title: string,
  content: string,
  imageUrl?: string,
  location?: string,
  color?: string
) => {
  //if (!title.trim() || !content.trim() || !recommendationId) return
  if (!recommendationId) return

  try {
    const recommendationRef = doc(db, 'recommendations', recommendationId)
    await setDoc(
      recommendationRef,
      {
        title,
        content,
        imageUrl: imageUrl || '',
        location: location || '',
        color: color || '#ff6f00', // Default color if not set
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Update recommendation failed:', error)
    alert('Failed to update recommendation')
  }
}

export const deleteRecommendation = async (recommendationId: string) => {
  if (!recommendationId) return

  try {
    await deleteDoc(doc(db, 'recommendations', recommendationId))
  } catch (error) {
    console.error('Delete recommendation failed:', error)
    alert('Failed to delete recommendation')
  }
}

export const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'))
  const fetched = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any
  return fetched
}

export const fetchUserById = async (userId: string) => {
  if (!userId) return null

  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() }
  } else {
    console.error('User not found:', userId)
    return null
  }
}

export const fetchUserNameById = async (userId: string | undefined = '') => {
  if (!userId) return ''

  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists()) {
    return userDoc.data().username || ''
  } else {
    console.error('User not found:', userId)
    return ''
  }
}

export const fetchUserNameFromRecommendation = async (
  recommendationId: string | undefined
) => {
  if (!recommendationId) return ''

  const recommendationDoc = await getDoc(
    doc(db, 'recommendations', recommendationId)
  )
  if (recommendationDoc.exists()) {
    const createdBy = recommendationDoc.data().created_by
    return await fetchUserNameById(createdBy)
  } else {
    console.error('Recommendation not found:', recommendationId)
    return ''
  }
}

export const addRating = async (
  recommendationId: string,
  rating: number,
  userId?: string,
  comment?: string
) => {
  if (!recommendationId || !userId || rating < 1 || rating > 5) return false
  // search if the user already rated this recommendation
  const existingRatingSnap = await getDocs(
    query(
      collection(db, 'ratings'),
      where('recommendation_id', '==', recommendationId),
      where('user_id', '==', userId)
    )
  )

  if (!existingRatingSnap.empty) {
    // Change the old rating to a new one
    const existingRatingDoc = existingRatingSnap.docs[0]
    await setDoc(
      existingRatingDoc.ref,
      {
        rating,
        comment: comment || '',
      },
      { merge: true }
    )
    return false // Indicate that it was an update, not a new rating
  }

  try {
    await addDoc(collection(db, 'ratings'), {
      recommendation_id: recommendationId,
      user_id: userId,
      rating,
      comment: comment || '',
    })
  } catch (error) {
    console.error('Add rating failed:', error)
    alert('Failed to add rating')
  }
  return true
}

export const fetchRatingsByRecommendation = async (
  recommendationId: string | undefined
): Promise<number> => {
  if (!recommendationId) return 0

  const ratingsSnap = await getDocs(
    query(
      collection(db, 'ratings'),
      where('recommendation_id', '==', recommendationId)
    )
  )

  if (ratingsSnap.empty) return 0

  const totalRating = ratingsSnap.docs.reduce(
    (sum, doc) => sum + (doc.data().rating || 0),
    0
  )

  return totalRating / ratingsSnap.size
}

export const fetchRatingsByRecommendationCount = async (
  recommendationId: string | undefined
): Promise<number> => {
  if (!recommendationId) return 0

  const ratingsSnap = await getDocs(
    query(
      collection(db, 'ratings'),
      where('recommendation_id', '==', recommendationId)
    )
  )

  return ratingsSnap.size
}
