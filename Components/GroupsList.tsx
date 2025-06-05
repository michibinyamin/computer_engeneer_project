import React, { useState, useEffect } from 'react';
import Catagorys from './Catagorys';
import {StyleSheet,Text,View,TouchableOpacity,TextInput,Modal,Pressable} from 'react-native';
import {collection,getDocs,addDoc,doc} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {addMembership, fetchGroups, createGroup} from '../Services'; // Import any necessary services if needed

const GroupsList = () => {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [categorysOpen, setOpen] = useState(false);

  const loadGroups = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userGroups = await fetchGroups(user.uid);
    setOptions(userGroups);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadGroups();
    });
    return unsubscribe;
  }, []);

  const create_Group = async () => {
    const user = auth.currentUser;
    if (!user || !groupName.trim()) return;

    await createGroup(groupName, groupDesc, user.uid);
    setModalVisible(false);
    setGroupName('');
    setGroupDesc('');
    await loadGroups();
  };


  const handleInvite = async () => {
    addMembership(inviteUsername, selectedGroupId);
    setInviteModalVisible(false);
    setInviteUsername('');
    await loadGroups();
  };

  return (
    <>
      {categorysOpen ? <Catagorys group_id={selectedGroupId} /> : (
        <View style={styles.buttonGrid}>
          {options.map((group, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { backgroundColor: '#d3d3d3' }]}
              onPress={() => {
                setOpen(true);
                setSelectedGroupId(group.id);
              }}
              onLongPress={() => {
                setSelectedGroupId(group.id);
                setInviteModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>{group.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.createGroupModalView}>
                <Text style={styles.createGroupTitle}>Create New Group</Text>
                <TextInput
                  style={styles.createInput}
                  placeholder="Group name"
                  value={groupName}
                  onChangeText={setGroupName}
                />
                <TextInput
                  style={styles.createInput}
                  placeholder="Description (optional)"
                  value={groupDesc}
                  onChangeText={setGroupDesc}
                />
                <View style={styles.createGroupButtons}>
                  <Pressable style={styles.createGroupButton} onPress={create_Group}>
                    <Text style={styles.createGroupText}>Create</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.createGroupButton, styles.cancelGroupButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelGroupText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={inviteModalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.inviteModalView}>
                <Text style={styles.inviteTitle}>Invite User to Group</Text>
                <TextInput
                  style={styles.inviteInput}
                  placeholder="Enter username"
                  value={inviteUsername}
                  onChangeText={setInviteUsername}
                />
                <View style={styles.inviteButtons}>
                  <Pressable style={styles.inviteButton} onPress={handleInvite}>
                    <Text style={styles.inviteText}>Send Invite</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.inviteButton, styles.cancelInviteButton]}
                    onPress={() => setInviteModalVisible(false)}
                  >
                    <Text style={styles.cancelInviteText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
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
  createGroupModalView: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    width: '85%',
  },
  createGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  createInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  createGroupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  createGroupButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'darkblue',
  },
  cancelGroupButton: {
    backgroundColor: '#ccc',
  },
  createGroupText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelGroupText: {
    color: 'black',
    fontWeight: 'bold',
  },
  inviteModalView: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    width: '85%',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inviteInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  inviteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inviteButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'darkblue',
  },
  cancelInviteButton: {
    backgroundColor: '#ccc',
  },
  inviteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelInviteText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default GroupsList;