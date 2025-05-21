import React from 'react';
import GeneralList from './Components/GeneralList';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from './Components/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import GeneralList from './Components/GeneralList';
import WelcomeScreen from './Components/WelcomeScreen';

const Stack = createStackNavigator();

export default function App() {
  const [selectedTab, setSelectedTab] = useState('General'); // Default tab
  return (
    <>
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.headerText}>RecoMate</Text>
          </View>

          <Login /> 
          {/* <GeneralList /> */}
      </SafeAreaView>
      <StatusBar style="auto" />

 


    </>
   
  );
};



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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'lightblue',
  },
  tabsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },

});