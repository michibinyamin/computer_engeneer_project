import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GeneralList from './GeneralList';
import GroupsList from './GroupsList';
import PersonalList from './PersonalList'; 
const Tabs = () => {
    const [selectedTab, setSelectedTab] = useState('General'); 
    return(
        <>
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setSelectedTab('General')}>
                  <Text style={[styles.tabsText, selectedTab == "General" && { color: 'blue' }]}>General</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab('Groups')}>
                  <Text style={[styles.tabsText, selectedTab == "Groups" && { color: 'blue' }]}>Groups</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab('Personal')}>
                  <Text style={[styles.tabsText, selectedTab == "Personal" && { color: 'blue' }]}>Personal</Text>
              </TouchableOpacity>
          </View>
          <View>
              {selectedTab === 'General' && <GeneralList />}
              {selectedTab === 'Groups' && <GroupsList /> }
              {selectedTab === 'Personal' && <PersonalList />}
          </View>
        </>

    )
}
export default Tabs;

const styles = StyleSheet.create({
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
})