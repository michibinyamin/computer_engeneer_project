// Components/EditProfile.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
} from 'react-native'
import { auth } from '../firebase'
import { fetchUserById, updateUserProfile } from '../Services'

export default function EditProfile({ navigation }: any) {
  const uid = auth.currentUser?.uid || ''
  const email = auth.currentUser?.email || ''
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string>('')

  useEffect(() => {
    (async () => {
      const u = await fetchUserById(uid)
      setUsername(u?.username || '')
      setBio(u?.bio || '')
      setPhotoUrl(u?.photoURL || '')
    })()
  }, [uid])

  const useIdenticon = () => {
    // Free, no-login avatar service (PNG). Works fine in <Image />
    const url = `https://api.dicebear.com/7.x/identicon/png?seed=${encodeURIComponent(uid)}&size=160`
    setPhotoUrl(url)
  }

  const onSave = async () => {
    try {
      await updateUserProfile(uid, {
        username: username.trim(),
        bio: bio.trim(),
        photoURL: photoUrl.trim() || undefined,
      })
      Alert.alert('Saved', 'Profile updated.')
      navigation.goBack()
    } catch (e: any) {
      console.log('edit profile failed:', e)
      Alert.alert('Error', e?.message || 'Failed to update profile.')
    }
  }

  const initial =
    (username?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'U')

  return (
    <ImageBackground
      source={require('../assets/Glowing-Concepts-in-a-Blue-Dream.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.avatarWrap}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Photo URL</Text>
        <TextInput
          style={styles.input}
          value={photoUrl}
          onChangeText={setPhotoUrl}
          placeholder="https://example.com/your-photo.png"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.smallBtn} onPress={useIdenticon}>
          <Text style={styles.smallBtnText}>Use Identicon</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell people about yourself"
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveTxt}>Save</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30 },
  title: {
    fontSize: 22, fontWeight: '800', color: '#dbeafe', textAlign: 'center', marginBottom: 16,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb' },
  avatarFallback: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2937' },
  avatarInitial: { color: '#fff', fontWeight: '800', fontSize: 28 },

  label: { color: '#dbeafe', fontWeight: '600', marginTop: 10 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginTop: 6,
    borderWidth: 1, borderColor: '#e5e7eb',
  },

  smallBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(30,58,138,0.18)', paddingVertical: 8,
    paddingHorizontal: 12, borderRadius: 8,
  },
  smallBtnText: { color: '#dbeafe', fontWeight: '700' },

  saveBtn: {
    marginTop: 18, backgroundColor: '#2563eb', paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  saveTxt: { color: '#fff', fontWeight: '700' },
})

