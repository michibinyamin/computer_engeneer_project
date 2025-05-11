import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity} from 'react-native';

export default function App() {
  const options = ['Cooking', 'Hikes', 'Books', 'Movies', 'Music', 'Travel', 'Fitness', 'Art'];
  const getColor = (index: number) => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33', '#33FFF2']; // Different colors for each button
  return colors[index % colors.length]; // Ensures the color array wraps if more than 6 items
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>RecoMate</Text>
      </View>
      <View style={styles.buttonGrid}>
      {options.map((option, index) => (
        <TouchableOpacity key={index} style={[styles.button, { backgroundColor: getColor(index) }]}>
          <Text style={styles.buttonText}>{option}</Text>
        </TouchableOpacity>
  ))}
</View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
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
  content: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
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
    backgroundColor: 'blue',
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
