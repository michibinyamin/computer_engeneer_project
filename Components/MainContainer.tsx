import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GeneralList from './GeneralList';
import GroupsList from './GroupsList';
import PersonalList from './PersonalList';
import { auth } from '../firebase';
import ManagePanel from './ManagePanel'; // this will be your admin page
import { useNavigation } from '@react-navigation/native';

const adminEmails = ['omar@gmail.com', 'Adi.yohanann@gmail.com','michibinyamin@gmail.com']; // Add your admin email(s)

const MainContainer = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('General');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && adminEmails.includes(user.email ?? '')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        //() => navigation.navigate('Catagorys', { groupId: "General" })
        return <GeneralList />;
        //return <GroupInfo />;
      case 'Groups':
        return <GroupsList />;
      case 'Personal':
        return <PersonalList />;
      case 'Manage':
        return <ManagePanel />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveTab('General')}>
          <Text style={[styles.tab, activeTab === 'General' && styles.activeTab]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Groups')}>
          <Text style={[styles.tab, activeTab === 'Groups' && styles.activeTab]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Personal')}>
          <Text style={[styles.tab, activeTab === 'Personal' && styles.activeTab]}>
            Personal
          </Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity onPress={() => setActiveTab('Manage')}>
            <Text style={[styles.tab, activeTab === 'Manage' && styles.activeTab]}>
              Manage
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    backgroundColor: '#e0f7fa',
  },
  tab: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    color: 'black',
  },
  activeTab: {
    color: 'blue',
  },
});

export default MainContainer;
