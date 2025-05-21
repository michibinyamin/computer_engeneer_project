import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';


const options = ['Cooking', 'Hikes', 'Books', 'Movies', 'Music', 'Travel', 'Fitness', 'Art'];

const getColor = (index: number) => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33', '#33FFF2'];
  return colors[index % colors.length];
};

const Catagorys = () => {
  return (
      <View style={styles.buttonGrid}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={[styles.button, { backgroundColor: getColor(index) }]}>
            <Text style={styles.buttonText}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
  );
};

export default Catagorys;

const styles = StyleSheet.create({
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
  button: {
    width: 150,
    height: 150,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
