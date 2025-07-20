import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addRecommendation, updateRecommendation, deleteRecommendation} from '../Services';
import { Ionicons } from "@expo/vector-icons";
import tinycolor from 'tinycolor2';
import { deleteDoc } from 'firebase/firestore';

const COLORS = [
  'black',
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Aqua Green
  '#FFD93D', // Bright Yellow
  '#1A8FE3', // Sky Blue
  '#FF8C42', // Orange
  '#9B5DE5', // Purple
];


const EditableRecommendation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        category_id,
        recommendationId : initialRecommendationId = '', // Default to empty string for new recommendation
        title: initialTitle,
        content: initialContent,
        imageUrl,
        color = '#ff6f00',
        viewMode = 'view',
    } = route.params as {
        category_id: string;
        recommendationId?: string; // Optional for edit mode
        title: string;
        content: string;
        imageUrl?: string;
        color?: string;
        viewMode?: string;
    };
    
    const [Mode, setMode] = useState(viewMode);   // view, edit or new
    const [content, setContent] = useState(initialContent);
    const [title, setTitle] = useState(initialTitle);
    const [image, setImage] = useState(imageUrl || '');
    const [selectedColor, setSelectedColor] = useState(color);
    const [recoId, setRecommendationId] = useState(initialRecommendationId); // Optional for edit mode
    //const [color, setColor] = useState(color);
    
    
    const brightColor = tinycolor(color).brighten(20).toHexString();
    
    const handleSave = async () => {
        if (Mode === 'edit') {
            await updateRecommendation(recoId, title, content, image, selectedColor);
        } else if (Mode === 'new') {
            const newId = await addRecommendation(category_id, title, content, image, selectedColor);
            if (newId) setRecommendationId(newId);
        }
    setMode('view');
    };

    const handleDelete = async () => {
        if (recoId) {
            await deleteRecommendation(recoId);
            navigation.goBack();
        }
    };

return (
    <>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',  }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 16 }}>
            <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
            Recommendation
        </Text>
        <View style={{ width: 44 }} />
    </View>

    <View style={styles.container}>
      {Mode !== 'view' ? (
          <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Recommendation title"
          multiline
          />
        ) : (
            <Text style={styles.title}>{title}</Text>
        )}
      <View style={[styles.divider, { backgroundColor: selectedColor }]} />
      {Mode !== 'view' ? (
          <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Recommendation content"
          multiline
          />
        ) : (
            <Text style={styles.content}>{content}</Text>
        )}
            {Mode !== "view" && (
                <TextInput
                    style={styles.input}
                    value={image}
                    onChangeText={setImage}
                    placeholder={imageUrl ? imageUrl : "Add an image URL"}
                    multiline
                    />
            )}
            {Mode === 'view' && image ? (
                <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
            ) : null}
    {Mode !== 'view' ? (
    <>
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
    </>
    ) : null}
        <View style={{ position: 'absolute', bottom: 20, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: Mode === 'new' ? 'center' : 'space-between', paddingHorizontal: 20 }}>
            {Mode !== 'new' && 
                <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ff6666' }]}
                onPress={() => handleDelete()}
                >
                <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            }
            <TouchableOpacity
                style={[styles.button, { backgroundColor: selectedColor }]}
                onPress={() => (Mode === 'edit' || Mode === 'new' ? handleSave() : setMode('edit'))}
                >
                <Text style={styles.buttonText}>{Mode === 'edit' || Mode === 'new' ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
        </View>
    </View>
</>
  );
};

const styles = StyleSheet.create({
    container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    margin: 20,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    height: '88%',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
    color: 'black',
  },
  divider: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginVertical: 16,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  input: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
    backgroundColor: '#f9f9f9',
  },
  button: {
    //marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
imageWrapper: {
  position: 'relative',
  width: '100%',
  height: 180,
  marginVertical: 20,
  borderRadius: 16,
  overflow: 'hidden',
},
overlay: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  borderRadius: 16,
  padding: 4,
},
overlayText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  opacity: 0.8,
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

export default EditableRecommendation;