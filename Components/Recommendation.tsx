import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";

const Recommendation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, content } = route.params as { title: string; content: string };
  return(
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.divider} />
    <Text style={styles.content}>{content}</Text>
  </View>
  ) 
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffbe7',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: '#ffe082',
    marginVertical: 8,
    borderRadius: 1,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});

export default Recommendation;