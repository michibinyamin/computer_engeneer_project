import React from 'react';
import GeneralList from './Components/GeneralList';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from './Components/Login';

export default function App() {
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

});