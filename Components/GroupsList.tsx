import React, { useState, useEffect } from 'react';
import Catagorys from './Catagorys';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Pressable } from 'react-native';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { addMembership, fetchGroups, createGroup } from '../Services';

let groupCounter = 1;

const GroupsList = () => {

  const [options, setOptions] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [categorysOpen, setOpen] = useState(false);

  // const fetchGroups = async () => {
  //   const querySnapshot = await getDocs(collection(db, 'groups'));
  //   const groupNames = querySnapshot.docs.map(doc => doc.data().name);
  //   setOptions(groupNames);

  
  //   groupCounter = querySnapshot.docs.length + 1;
  // };
  interface Group {
    created_by: string;
    description?: string;
    group_id?: string;
    name: string;
  }
  const loadGroups = async () => {
    const groups = await fetchGroups(auth.currentUser?.uid) ?? [];
    setOptions(groups);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleInvite = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const userDoc = usersSnap.docs.find(doc => doc.data().username === inviteUsername);

      if (!userDoc) {
        alert('User not found.');
        return;
      }

      const invitedUserId = userDoc.id;
      await addMembership(selectedGroupId, invitedUserId, 'Member');

      alert('User successfully added to the group!');
      setInviteModalVisible(false);
      setInviteUsername('');
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Failed to invite user.');
    }
  };

  return (
    <>
      {
        categorysOpen ? <Catagorys />
        :
        <View style={styles.buttonGrid}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { backgroundColor: '#d3d3d3' }]}
              onPress={() => setOpen(true)}
              onLongPress={() => {
                  setSelectedGroupId(option.id);
                  setInviteModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Create New Group</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Group name"
                  value={groupName}
                  onChangeText={setGroupName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Description (optional)"
                  value={groupDesc}
                  onChangeText={setGroupDesc}
                />

                <View style={styles.modalButtons}>
                  <Pressable
                    style={styles.modalButton}
                    onPress={() => {
                      createGroup(groupName, groupDesc, auth.currentUser?.uid || '');
                      setModalVisible(false);
                      setGroupName('');
                      setGroupDesc('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Create</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={inviteModalVisible}
            onRequestClose={() => setInviteModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Invite User to Group</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={inviteUsername}
                  onChangeText={setInviteUsername}
                />

                <Pressable style={styles.modalButton} onPress={handleInvite}>
                  <Text style={styles.modalButtonText}>Send Invite</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                  onPress={() => setInviteModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      }
    </>
  );
};

const styles = StyleSheet.create({
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 20,
    gap: 10,
  },
  button: {
    backgroundColor: 'darkblue',
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: 'darkblue',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default GroupsList;