import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, BackHandler, Image } from 'react-native';
import {fetchRecommendations} from '../Services';
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
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
import { Ionicons } from "@expo/vector-icons";


const COLORS = [
  'black',
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Aqua Green
  '#FFD93D', // Bright Yellow
  '#1A8FE3', // Sky Blue
  '#FF8C42', // Orange
  '#9B5DE5', // Purple
];

const RecommendationList = ({ category_id, setCatEntered }: { category_id: any, setCatEntered: (id: string) => void }) => {
  useFocusEffect(
      React.useCallback(() => {
        // This will run when the screen is focused(back button to the screen )
        loadRecommendations();
      }, [])
    );
  const navigation = useNavigation();
  const route = useRoute();
  //const { category_id } = route.params as { category_id: string };

  const [options, setOptions] = useState<{ recoId: string; title: string; content: string; imageUrl?: string; color?: string }[]>([]);
  const [RecoModal, setRecoModal] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recoName, setRecoName] = useState("");
  const [recoContent, setRecoContent] = useState("");
  const [catName, setCatName] = useState('');
  const [imageUrl, setImageUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [addReco, setAddReco] = useState(false);

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
    setOptions(Recommendations.map((r: any, idx: number) => ({
      ...r,
      color: r.color || COLORS[idx % COLORS.length],
    })));
  };

  const handleAddReco = async () => {
      if (!recoName.trim()) return;
      await addDoc(collection(db, "recommendations"), {
        title: recoName,
        category_id: category_id,
        created_by: auth.currentUser?.uid,
        content: recoContent,
        imageUrl: imageUrl,
        color: selectedColor, // Save color
      });
      setRecoModal(false);
      setRecoName("");
      setImageUrl("");
      setRecoContent("");
      setSelectedColor(COLORS[0]);
      loadRecommendations();
    };


    useEffect(() => {
      const fetchCatName = async () => {
        const catRef = doc(db, "catagory", category_id);
        const catSnap = await getDoc(catRef);
        if (catSnap.exists()) {
          setCatName(catSnap.data().name);
        }
      };
      fetchCatName();
    }, []);

  return (
      <>
    <View style={styles.header}>
        <Text style={styles.centeredGroupName}>{catName}</Text>
          <TouchableOpacity onPress={() => setCatEntered('')}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
    </View>

    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.grid}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { backgroundColor: option.color || COLORS[index % COLORS.length] }]}
              onPress={() => navigation.navigate("EditableRecommendation", { category_id: category_id,  recommendationId: option.recoId, title: option.title, content: option.content, imageUrl: option.imageUrl, color: option.color, viewMode: "view" })}
            >
              {option.imageUrl ? (
                <Image
                  source={{ uri: option.imageUrl }}
                  style={styles.tileImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.titleOverlay}>
                <Text style={styles.buttonText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.addRecoBtn} onPress={() => { navigation.navigate("EditableRecommendation", { category_id: category_id, recommendationId: "", title: "", content: "", imageUrl: "", color: "black", viewMode: "new" }); }}>
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
                style={[styles.input, { height: 100 }]}
                multiline={true}
                numberOfLines={4}
              />
              <TextInput
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
                style={styles.input}
              />
              <Text style={{ marginTop: 10, fontWeight: "bold" }}>Choose a color:</Text>
              <View style={styles.colorPickerRow}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color, borderWidth: selectedColor === color ? 3 : 1, borderColor: selectedColor === color ? 'black' : '#ccc' }
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.inviteButton} onPress={handleAddReco} >
                <Text style={styles.inviteButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRecoModal(false)}>
                <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
</>
  );
};

export default RecommendationList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "white",
    position: "relative",
  },
  centeredGroupName: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
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

tileImage: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: 20,
},
titleOverlay: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  paddingVertical: 8,
  paddingHorizontal: 10,
  alignItems: "center",
},
buttonText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#fff",
  textAlign: "center",
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
    textAlignVertical: "top", // Add this
    textAlign: "left",        // Add this
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
  recoImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  colorPickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
  },
});
