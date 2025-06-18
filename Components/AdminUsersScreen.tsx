import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

const AdminUsersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as { userId: string };

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleBan = async () => {
    Alert.alert('Confirm Ban', 'Ban this user temporarily?', [
      { text: 'Cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: async () => {
          const bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
          try {
            await updateDoc(doc(db, 'users', userId), {
              bannedUntil,
              status: 'banned',
            });
            setUser((prev: any) => ({
              ...prev,
              bannedUntil: Timestamp.fromDate(bannedUntil),
              status: 'banned',
            }));
            Alert.alert('User banned for 7 days');
          } catch (error) {
            Alert.alert('Error banning user');
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to permanently delete this user?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('User deleted');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error deleting user');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const formatBanDate = (timestamp?: Timestamp) => {
    if (!timestamp) return null;
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const isBanned =
    user?.bannedUntil &&
    new Date(user.bannedUntil.toDate()) > new Date();

  if (!user) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>User Info</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user.email}</Text>

      {user.username && (
        <>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>
        </>
      )}

      <Text style={styles.label}>Status:</Text>
      <Text style={[styles.value, { color: isBanned ? 'red' : 'green' }]}>
        {isBanned ? 'banned' : 'active'}
      </Text>

      {isBanned && (
        <>
          <Text style={styles.label}>Banned Until:</Text>
          <Text style={styles.value}>{formatBanDate(user.bannedUntil)}</Text>
        </>
      )}

      <TouchableOpacity style={styles.actionBtn} onPress={handleBan}>
        <Text style={styles.actionText}>Ban for 7 Days</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.deleteBtn]}
        onPress={handleDelete}
      >
        <Text style={styles.actionText}>Delete User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: 'darkblue',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: 'red',
  },
});

export default AdminUsersScreen;
