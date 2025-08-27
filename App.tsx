import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, BackHandler, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

import Register from './Components/Register'
import Login from './Components/Login'
import WelcomeScreen from './Components/WelcomeScreen'
import MainContainer from './Components/MainContainer'
import ResetPassword from './Components/ResetPassword'
import Members from './Components/Members'
import AdminUsersScreen from './Components/AdminUsersScreen'
import UsersInfo from './Components/UsersInfo'
import ManagePanel from './Components/ManagePanel'
import EditableRecommendation from './Components/EditableRecommendation'
import GroupsInfo, { OpenGroupScreen } from './Components/GroupsInfo'
import Sidebar from './Components/Sidebar'
import EditProfile from './Components/EditProfile'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

function CustomHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>RecoMate</Text>
    </View>
  )
}

function TabsWithDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <Sidebar {...props} />}
    >
      <Drawer.Screen name="Tabs" component={MainContainer} />
    </Drawer.Navigator>
  )
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string>('Welcome')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setInitialRoute('Tabs')
      } else {
        setInitialRoute('Welcome')
      }
      setReady(true)
    })
    return unsub
  }, [])

  // Handle Android back button → exit app when in main flow
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (initialRoute === 'Tabs') {
          BackHandler.exitApp()
          return true
        }
        return false
      }
    )
    return () => backHandler.remove()
  }, [initialRoute])

  if (!ready) return null // or splash screen

  return (
    <>
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={({ route }) => ({
              header: () =>
                route.name !== 'Tabs' &&
                route.name !== 'EditableRecommendation' &&
                route.name !== 'Members' &&
                route.name !== 'AdminUsersScreen' &&
                route.name !== 'OpenGroup' &&
                route.name !== 'EditProfile' && <CustomHeader />,
            })}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="Tabs" component={TabsWithDrawer} />
            <Stack.Screen
              name="EditableRecommendation"
              component={EditableRecommendation}
            />
            <Stack.Screen name="Members" component={Members} />
            <Stack.Screen name="ManagePanel" component={ManagePanel} />
            <Stack.Screen name="UsersInfo" component={UsersInfo} />
            <Stack.Screen name="AdminUsersScreen" component={AdminUsersScreen} />
            <Stack.Screen name="GroupsInfo" component={GroupsInfo} />
            <Stack.Screen name="OpenGroup" component={OpenGroupScreen} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
      <StatusBar style="auto" />
    </>
  )
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
})
