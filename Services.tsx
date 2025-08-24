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
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { sendPasswordResetEmail, User } from 'firebase/auth'
import { deleteUser } from 'firebase/auth'


/* =========================
 * USERS
 * =======================*/
export const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
}

export const fetchUserById = async (userId: string) => {
  if (!userId) return null
  const userDoc = await getDoc(doc(db, 'users', userId))
  return userDoc.exists() ? { id: userDoc.id, ...(userDoc.data() as any) } : null
}

export const fetchUserNameById = async (userId: string | undefined = '') => {
  if (!userId) return ''
  const userDoc = await getDoc(doc(db, 'users', userId))
  return userDoc.exists() ? ((userDoc.data() as any).username || '') : ''
}

export const fetchUserNameFromRecommendation = async (
  recommendationId: string | undefined
) => {
  if (!recommendationId) return ''
  const recommendationDoc = await getDoc(doc(db, 'recommendations', recommendationId))
  if (!recommendationDoc.exists()) return ''
  const createdBy = (recommendationDoc.data() as any).created_by
  return await fetchUserNameById(createdBy)
}

/* (Used by UsersInfo bulk actions — keep these if you already integrated them) */
export const banUsers = async (userIds: string[], days: number) => {
  const until = Timestamp.fromDate(new Date(Date.now() + days * 86400000))
  await Promise.all(
    userIds.map((uid) =>
      setDoc(
        doc(db, 'users', uid),
        { status: 'banned', bannedUntil: until },
        { merge: true }
      )
    )
  )
}

export const deleteUsersByIds = async (userIds: string[]) => {
  await Promise.all(userIds.map((uid) => deleteDoc(doc(db, 'users', uid))))
}

/* =========================
 * RECOMMENDATIONS & RATINGS
 * =======================*/
export const fetchRecommendations = async (category_id: string | undefined) => {
  if (!category_id) return []
  const snap = await getDocs(
    query(collection(db, 'recommendations'), where('category_id', '==', category_id))
  )
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      recoId: d.id,
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl,
      location: data.location,
      created_by: data.created_by,
      color: data.color,
    }
  })
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
    const ref = await addDoc(collection(db, 'recommendations'), {
      title,
      content,
      category_id,
      created_by: auth.currentUser?.uid,
      imageUrl: imageUrl || '',
      location: location || '',
      color: color || '#ff6f00',
    })
    return ref.id
  } catch (e) {
    console.error('Add recommendation failed:', e)
    alert('Failed to add recommendation')
  }
}

/* owner-guard */
const assertOwner = async (recommendationId: string) => {
  const u = auth.currentUser
  if (!u) throw new Error('Not signed in')
  const ref = doc(db, 'recommendations', recommendationId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Recommendation not found')
  const createdBy = (snap.data() as any).created_by
  if (createdBy !== u.uid) throw new Error('Permission denied')
  return ref
}

export const updateRecommendation = async (
  recommendationId: string,
  title: string,
  content: string,
  imageUrl?: string,
  location?: string,
  color?: string
) => {
  if (!recommendationId) return
  try {
    const ref = await assertOwner(recommendationId)
    await setDoc(
      ref,
      {
        title,
        content,
        imageUrl: imageUrl || '',
        location: location || '',
        color: color || '#ff6f00',
      },
      { merge: true }
    )
  } catch (e: any) {
    console.error('Update recommendation failed:', e)
    alert(e?.message || 'Failed to update recommendation')
  }
}

export const deleteRecommendation = async (recommendationId: string) => {
  if (!recommendationId) return
  try {
    const ref = await assertOwner(recommendationId)
    await deleteDoc(ref)
  } catch (e: any) {
    console.error('Delete recommendation failed:', e)
    alert(e?.message || 'Failed to delete recommendation')
  }
}

/* Ratings */
export const addRating = async (
  recommendationId: string,
  rating: number,
  userId?: string,
  comment?: string
) => {
  if (!recommendationId || !userId || rating < 1 || rating > 5) return false
  const existing = await getDocs(
    query(
      collection(db, 'ratings'),
      where('recommendation_id', '==', recommendationId),
      where('user_id', '==', userId)
    )
  )
  if (!existing.empty) {
    await setDoc(
      existing.docs[0].ref,
      { rating, comment: comment || '' },
      { merge: true }
    )
    return false
  }
  await addDoc(collection(db, 'ratings'), {
    recommendation_id: recommendationId,
    user_id: userId,
    rating,
    comment: comment || '',
  })
  return true
}

export const fetchRatingsByRecommendation = async (
  recommendationId: string | undefined
): Promise<number> => {
  if (!recommendationId) return 0
  const snap = await getDocs(
    query(collection(db, 'ratings'), where('recommendation_id', '==', recommendationId))
  )
  if (snap.empty) return 0
  const total = snap.docs.reduce((sum, d) => sum + ((d.data() as any).rating || 0), 0)
  return total / snap.size
}

export const fetchRatingsByRecommendationCount = async (
  recommendationId: string | undefined
): Promise<number> => {
  if (!recommendationId) return 0
  const snap = await getDocs(
    query(collection(db, 'ratings'), where('recommendation_id', '==', recommendationId))
  )
  return snap.size
}

/* =========================
 * MEMBERSHIP / GROUP MGMT
 * =======================*/

/* Promote & remove (used by Members screen 3-dots) */
export const promoteMemberToAdmin = async (membershipDocId: string) => {
  await setDoc(doc(db, 'membership', membershipDocId), { role: 'Admin' }, { merge: true })
}

export const removeMemberByDocId = async (membershipDocId: string) => {
  const ref = doc(db, 'membership', membershipDocId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as any
  const groupId = data.group_id as string
  const role = (data.role as string) || 'Member'

  // remove the member
  await deleteDoc(ref)

  // check what's left in the group
  const restSnap = await getDocs(
    query(collection(db, 'membership'), where('group_id', '==', groupId))
  )

  if (restSnap.empty) {
    // no members left → delete the whole group
    await deleteGroupCascade(groupId)
    return
  }

  // if we removed an Admin, ensure there is an Admin; if none, pick random
  if (role === 'Admin') {
    await assignRandomAdmin(groupId)
  }
}


/* Cascade delete an entire group and related data */
export const deleteGroupCascade = async (groupId: string) => {
  // memberships
  const mSnap = await getDocs(
    query(collection(db, 'membership'), where('group_id', '==', groupId))
  )

  // categories (your app uses collection 'catagory' with field 'groupId')
  const cSnap = await getDocs(
    query(collection(db, 'catagory'), where('groupId', '==', groupId))
  )

  // recommendations + ratings per category
  const recDeletes: Promise<any>[] = []
  const ratingDeletes: Promise<any>[] = []

  for (const c of cSnap.docs) {
    const recSnap = await getDocs(
      query(collection(db, 'recommendations'), where('category_id', '==', c.id))
    )
    for (const r of recSnap.docs) {
      const rts = await getDocs(
        query(collection(db, 'ratings'), where('recommendation_id', '==', r.id))
      )
      rts.forEach((rt) => ratingDeletes.push(deleteDoc(rt.ref)))
      recDeletes.push(deleteDoc(r.ref))
    }
  }

  const batch = writeBatch(db)
  mSnap.forEach((m) => batch.delete(m.ref))
  cSnap.forEach((c) => batch.delete(c.ref))
  batch.delete(doc(db, 'groups', groupId))

  await Promise.all([...ratingDeletes, ...recDeletes])
  await batch.commit()
}

/* Leave group:
   - Remove current member
   - If empty → delete group (cascade)
   - If admin left and no other admin remains → promote the next oldest member
*/

export const leaveGroup = async (groupId: string, userId: string) => {
  // my membership
  const mySnap = await getDocs(
    query(
      collection(db, 'membership'),
      where('group_id', '==', groupId),
      where('user_id', '==', userId)
    )
  )
  if (mySnap.empty) return
  const myDoc = mySnap.docs[0]
  const myRole = (myDoc.data() as any).role || 'Member'

  // remove me
  await deleteDoc(myDoc.ref)

  // who remains?
  const restSnap = await getDocs(
    query(collection(db, 'membership'), where('group_id', '==', groupId))
  )
  if (restSnap.empty) {
    await deleteGroupCascade(groupId)
    return
  }

  // ✅ NEW: if I was Admin and no admins remain, pick a random member as new Admin
  if (myRole === 'Admin') {
    await assignRandomAdmin(groupId)
  }
}

// Fetch ALL groups in the database (used by GroupsInfo)
export const fetchAllGroups = async () => {
  const snap = await getDocs(collection(db, 'groups'))
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      id: d.id,
      name: data.name || '',
      description: data.description || '',
      created_by: data.created_by || '',
    }
  })
}

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

// If no admins remain in a group, promote a random remaining member to Admin
export const assignRandomAdmin = async (groupId: string) => {
  const restSnap = await getDocs(
    query(collection(db, 'membership'), where('group_id', '==', groupId))
  )
  if (restSnap.empty) return // nothing to assign

  // If an admin already exists, do nothing
  const someoneIsAdmin = restSnap.docs.some((d) => (d.data() as any).role === 'Admin')
  if (someoneIsAdmin) return

  // Pick a random member and promote
  const idx = Math.floor(Math.random() * restSnap.docs.length)
  const randomDoc = restSnap.docs[idx]
  await setDoc(randomDoc.ref, { role: 'Admin' }, { merge: true })
}

//////////////////////////////
export const getUserQuickStats = async (uid: string) => {
  if (!uid) return { groupsCount: 0, postsCount: 0, avgRating: 0 }

  // joined groups
  const memSnap = await getDocs(
    query(collection(db, 'membership'), where('user_id', '==', uid))
  )
  const groupsCount = memSnap.size

  // posts authored
  const recSnap = await getDocs(
    query(collection(db, 'recommendations'), where('created_by', '==', uid))
  )
  const postsCount = recSnap.size

  // average rating on user's posts (across all ratings on those recs)
  let total = 0
  let cnt = 0
  for (const rec of recSnap.docs) {
    const rSnap = await getDocs(
      query(collection(db, 'ratings'), where('recommendation_id', '==', rec.id))
    )
    rSnap.forEach((d) => {
      const r = (d.data() as any).rating
      if (typeof r === 'number') {
        total += r
        cnt += 1
      }
    })
  }
  const avgRating = cnt ? total / cnt : 0

  return { groupsCount, postsCount, avgRating }
}

export const updateUserProfile = async (
  uid: string,
  data: { username?: string; bio?: string; photoURL?: string }
) => {
  if (!uid) return
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

export const requestPasswordReset = async (email?: string | null) => {
  if (!email) throw new Error('No email for this account.')
  await sendPasswordResetEmail(auth, email)
}

export const deleteOwnAccount = async () => {
  const user = auth.currentUser
  if (!user) return

  // Delete user from Firestore
  await deleteDoc(doc(db, 'users', user.uid))

  // Delete user from Authentication
  await deleteUser(user)
}
