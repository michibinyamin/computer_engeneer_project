import { addDoc, collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// Adds to membership collection
export const addMembership = async (group_id: string, user_id: string, role: 'Admin' | 'Member') => {
  if (!user_id) return;
  const snapshot = await getDocs(collection(db, 'membership'));
  const nextId = snapshot.size + 1;

  await addDoc(collection(db, 'membership'), {
    membership_id: `membership_${nextId}`,
    user_id: user_id,
    group_id: group_id,
    role: role
  });
};

export const fetchGroups = async (user_id: string | undefined) => {
  if (!user_id) return [];

  // Get memberships where user_id matches
  const membershipQuery = query(collection(db, 'membership'), where('user_id', '==', user_id));
  const membershipSnap = await getDocs(membershipQuery);

  const groupIds = membershipSnap.docs.map(doc => doc.data().group_id);

  // Fetch each group by ID
  const groupPromises = groupIds.map(id => getDoc(doc(db, 'groups', id)));
  const groupDocs = await Promise.all(groupPromises);

  const groupNames = groupDocs
    .filter(doc => doc.exists())
    .map(doc => doc.data()?.name);  // .name

  return groupNames;
};



// Adds to group collection
let groupCounter = 1;
export const createGroup = async (name: string, description: string, user_id: string) => {

    const snapshot = await getDocs(collection(db, 'membership'));
    const nextId = snapshot.size + 1;
    if (!name.trim()) {
        alert('Group name is required.');
        return;
    }

    //const user = auth.currentUser;
    if (!user_id) {
        alert('You must be logged in to create a group.');
        return;
    }

    try {
        const userRef = doc(db, 'users', user_id);
        const userSnap = await getDoc(userRef);
        const username = userSnap.exists() ? userSnap.data().username : user_id;

        const groupId = `group_${nextId}`;

        await setDoc(doc(db, 'groups', groupId), {
        group_id: groupId,
        name,
        description,
        created_by: username
    });

        groupCounter += 1; 
        alert('Group created successfully!');
        await addMembership(groupId, user_id, 'Admin'); // Add the creator as an admin
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Failed to create group.');
    }
};