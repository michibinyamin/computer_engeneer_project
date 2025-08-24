import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useFocusEffect } from '@react-navigation/native'
import { auth, db } from '../firebase'
import { fetchUserById } from '../Services'
import { getUserQuickStats } from '../Services'

// NEW: realtime imports
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { requestPasswordReset, deleteOwnAccount } from '../Services'

type Stats = { groupsCount: number; postsCount: number; avgRating: number }

const Sidebar = (props: any) => {
  const user = auth.currentUser
  const [username, setUsername] = useState<string>('')
  const [photoURL, setPhotoURL] = useState<string | undefined>(user?.photoURL || undefined)
  const [stats, setStats] = useState<Stats>({ groupsCount: 0, postsCount: 0, avgRating: 0 })

  const email = user?.email || ''

  // Initial load
  useEffect(() => {
    const load = async () => {
      const uid = user?.uid
      if (!uid) return
      const udoc = await fetchUserById(uid)
      setUsername(udoc?.username || '')
      setPhotoURL(udoc?.photoURL || user?.photoURL || undefined)

      const s = await getUserQuickStats(uid)
      setStats(s)
    }
    load()
  }, [user?.uid])

  // Refresh when drawer gains focus (opened)
  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser?.uid
      if (!uid) return
      ;(async () => {
        const udoc = await fetchUserById(uid)
        setUsername(udoc?.username || '')
        setPhotoURL(udoc?.photoURL || auth.currentUser?.photoURL || undefined)
        const s = await getUserQuickStats(uid)
        setStats(s)
      })()
    }, [])
  )

  // Live subscriptions: joined groups, posts count, avg rating
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return

    // Realtime membership count
    const memUnsub = onSnapshot(
      query(collection(db, 'membership'), where('user_id', '==', uid)),
      (snap) => setStats((prev) => ({ ...prev, groupsCount: snap.size }))
    )

    // Realtime posts + recompute avg rating
    const recUnsub = onSnapshot(
      query(collection(db, 'recommendations'), where('created_by', '==', uid)),
      async (recSnap) => {
        const postsCount = recSnap.size

        let total = 0
        let count = 0
        for (const rec of recSnap.docs) {
          const rSnap = await getDocs(
            query(collection(db, 'ratings'), where('recommendation_id', '==', rec.id))
          )
          rSnap.forEach((d) => {
            const r = (d.data() as any).rating
            if (typeof r === 'number') {
              total += r
              count += 1
            }
          })
        }
        const avgRating = count ? total / count : 0
        setStats((prev) => ({ ...prev, postsCount, avgRating }))
      }
    )

    return () => {
      memUnsub()
      recUnsub()
    }
  }, [auth.currentUser?.uid])

  const initial = useMemo(
    () => username?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?',
    [username, email]
  )

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.header}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarFallbackText}>{initial}</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.username} numberOfLines={1}>
            {username || 'User'}
          </Text>
          {!!email && (
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.groupsCount}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.postsCount}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {Number.isFinite(stats.avgRating) ? stats.avgRating.toFixed(1) : '0.0'}
          </Text>
          <Text style={styles.statLabel}>Avg ★</Text>
        </View>
      </View>

      {/* Profile & account actions */}
      <View style={{ paddingHorizontal: 12, gap: 8, marginTop: 4 }}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => props.navigation.navigate('EditProfile')}
        >
          <Text style={styles.actionTxt}>Edit profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            try {
              await requestPasswordReset(auth.currentUser?.email)
              Alert.alert('Check your email', 'Password reset link sent.')
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to send reset email.')
            }
          }}
        >
          <Text style={styles.actionTxt}>Change password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
          onPress={() =>
            Alert.alert(
              'Delete account',
              'This will permanently remove your account and data. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteOwnAccount()
                      props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
                    } catch (e: any) {
                      Alert.alert('Error', e?.message || 'Delete failed.')
                    }
                  },
                },
              ]
            )
          }
        >
          <Text style={[styles.actionTxt, { color: '#fff' }]}>Delete account</Text>
        </TouchableOpacity>
      </View>

      {/* Keeping drawer items (if any) */}
      {/* <DrawerItemList {...props} /> */}

      {/* Sign out shortcut */}
      <TouchableOpacity
        style={styles.signout}
        onPress={async () => {
          await auth.signOut()
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }}
      >
        <Text style={styles.signoutText}>Sign out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    gap: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e5e7eb' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2937' },
  avatarFallbackText: { color: 'white', fontWeight: '700', fontSize: 18 },

  username: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  email: { fontSize: 12, color: '#475569', marginTop: 2 },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(30,58,138,0.08)',
    alignItems: 'center',
  },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#334155' },

  actionBtn: {
    backgroundColor: 'rgba(30,58,138,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionTxt: { color: '#0f172a', fontWeight: '700' },

  signout: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  signoutText: { color: 'white', fontWeight: '700' },
})

export default Sidebar
