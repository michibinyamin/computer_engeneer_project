import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import {fetchRecommendations} from '../Services';
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const getColor = (index: number) => {
  const colors = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Aqua Green
    '#FFD93D', // Bright Yellow
    '#1A8FE3', // Sky Blue
    '#FF8C42', // Orange
    '#9B5DE5', // Purple
  ];
  return colors[index % colors.length];
};

const RecommendationList = ({ category_id }: { category_id: any }) => {
  const navigation = useNavigation();
  const route = useRoute();
  //const { category_id } = route.params as { category_id: string };
  
  const [options, setOptions] = useState<{ title: string; content: string }[]>([]);
  const [RecoModal, setRecoModal] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recoName, setRecoName] = useState("");
  const [recoContent, setRecoContent] = useState("");
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadRecommendations();
    });
    return unsubscribe;
  }, []);

  const loadRecommendations = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const Recommendations = await fetchRecommendations(category_id);
    setOptions(Recommendations);
  };

  const handleAddReco = async () => {
      if (!recoName.trim()) return;
      await addDoc(collection(db, "recommendations"), {
        title: recoName,
        category_id: category_id,
        created_by: auth.currentUser?.uid,
        content: recoContent,
      });
      setRecoModal(false);
      setRecoName("");
      loadRecommendations();
    };

  return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.grid}>
          {options.map((option, index) => (
            <TouchableOpacity key={index} style={[styles.button, { backgroundColor: getColor(index) }]} onPress={() => navigation.navigate("Recommendation", { title: option.title, content: option.content })}>
              <Text style={styles.buttonText}>
                {option.title}
              </Text>
              
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.addRecoBtn} onPress={() => setRecoModal(true)}>
                <Text style={styles.fabText}>+ Add Recommendation</Text>
        </TouchableOpacity>
        <Modal visible={RecoModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>New Recommendation</Text>
                    <TextInput
                      placeholder="Recommendation title"
                      value={recoName}
                      onChangeText={setRecoName}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Recommendation content"
                      value={recoContent}
                      onChangeText={setRecoContent}
                      style={styles.input}
                    />
                    <TouchableOpacity style={styles.inviteButton} onPress={handleAddReco}>
                      <Text style={styles.inviteButtonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRecoModal(false)}>
                      <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
    </View>
  );
};

export default RecommendationList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: 'darkblue',
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 20,
  },
  grid: {
  paddingHorizontal: 16,
  paddingTop: 24,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

button: {
  width: "47%",
  height: 160,
  borderRadius: 20,
  marginBottom: 20,
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
  backgroundColor: "#fff", // Will be overridden by getColor()
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
},

buttonText: {
  fontSize: 18,
  fontWeight: "600",
  textAlign: "center",
  color: "#fff",
},

    addRecoBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "darkblue",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fabText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  inviteButton: {
    backgroundColor: "darkblue",
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  inviteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
