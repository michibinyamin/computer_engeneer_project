import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GeneralList from './Components/GeneralList';
import GroupsList from './Components/GroupsList';
import PersonalList from './Components/PersonalList';
import Login from './Components/Login';

export default function App() {
  const [selectedTab, setSelectedTab] = useState('General'); // Default tab
  return (
    <>
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.headerText}>RecoMate</Text>
          </View>
          <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setSelectedTab('General')}>
                  <Text style={styles.tabsText}>General</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab('Groups')}>
                  <Text style={styles.tabsText}>Groups</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab('Personal')}>
                  <Text style={styles.tabsText}>Personal</Text>
              </TouchableOpacity>
          </View>
          <View>
              {selectedTab === 'General' && <GeneralList />}
              {selectedTab === 'Groups' && <GroupsList /> }
              {selectedTab === 'Personal' && <PersonalList />}
          </View>
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