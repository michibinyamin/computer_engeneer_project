import { addDoc, collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// Fetches group names for a user
export const fetchGroups = async (user_id: string | undefined) => {
  if (!user_id) return [];

  const membershipSnap = await getDocs(collection(db, 'membership'));
      const userGroupIds = membershipSnap.docs
        .filter(doc => doc.data().user_id === user_id)
        .map(doc => doc.data().group_id);
  
      const groupSnap = await getDocs(collection(db, 'groups'));
      const userGroups = groupSnap.docs
        .filter(doc => userGroupIds.includes(doc.id))
        .map(doc => ({ id: doc.id, name: doc.data().name }));

  return userGroups;
};


// Adds to group collection
export const createGroup = async (groupName: string, groupDesc: string, createdByUserId: string) => {
  try {
    const groupRef = await addDoc(collection(db, 'groups'), {
      name: groupName,
      description: groupDesc,
      created_by: createdByUserId
    });

    await addDoc(collection(db, 'membership'), {
      membership_id: `membership_${Date.now()}`,
      user_id: createdByUserId,
      group_id: groupRef.id,
      role: 'Admin'
    });
  } catch (error) {
    console.error('Create group failed:', error);
    alert('Failed to create group');
  }
};

export const addMembership = async (inviteUsername : string, group_id: string) => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const userDoc = usersSnap.docs.find(doc => doc.data().username === inviteUsername);
      if (!userDoc) return alert('User not found');

      const invitedUserId = userDoc.id;
      await addDoc(collection(db, 'membership'), {
        membership_id: `membership_${Date.now()}`,
        user_id: invitedUserId,
        group_id: group_id,
        role: 'Member'
      });
    } catch (err) {
      console.error('Invite failed:', err);
    }
  };

  export const fetchCategories = async (group_id: string) => {
    if (!group_id) return [];

    const categoriesSnap = await getDocs(collection(db, 'categories'));
    const groupCategories = categoriesSnap.docs
      .filter(doc => doc.data().group_id === group_id)
      .map(doc => doc.data().name);

    return groupCategories;
  };

  // Fetches recomendations froma a group
  export const fetchRecommendations = async (category_id: string | undefined) => {
    if (!category_id) return [];

      const categoriesSnap = await getDocs(collection(db, 'recommendations'));
      const recomendations = categoriesSnap.docs
        .filter(doc => doc.data().category_id === category_id)
        .map(doc => ({ title: doc.data().title, content: doc.data().content}));

      return recomendations;
  };