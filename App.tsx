import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Register from './Components/Register';
import Login from './Components/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from './Components/WelcomeScreen';
import Tabs from './Components/Tabs';
import ResetPassword from './Components/ResetPassword';


const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.headerText}>RecoMate</Text>
          </View>

          <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

      </Stack.Navigator>
    </NavigationContainer>

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