import React, { useState } from 'react';
import Catagorys from './Catagorys';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native';

const GroupsList = () => {
    const [categorysOpen, setOpen] = useState(false); // Default tab
    const options = [
        'Childhood Friends', 
        'Family', 
        'Work Colleagues', 
        'Gym Buddies', 
        'College Friends', 
        'Neighbors', 
        'Online Friends', 
        'Study Group',
      ];
  return (
    <>
        {
          categorysOpen ? <Catagorys /> 
          :
          <View style={[styles.buttonGrid]}>
              {options.map((option, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.button, { backgroundColor: '#d3d3d3'}]}
                    onPress={() => setOpen(true)}
                  >
                      <Text style={styles.buttonText}>
                          {option}
                      </Text>
                  </TouchableOpacity>
              ))}
          </View>
        }
    </>
  );
};
export default GroupsList;

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
});

