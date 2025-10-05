import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'

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
import GroupsInfo from './Components/GroupsInfo'
import { OpenGroupScreen } from './Components/GroupsInfo'
import Sidebar from './Components/Sidebar'
import EditProfile from './Components/EditProfile'
import { Toast } from 'react-native-toast-message/lib/src/Toast'
import ReviewingReports from './Components/ReviewingReports'

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
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return unsubscribe
  }, [])

  if (user === undefined) {
    // Show loading spinner while checking auth state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="darkblue" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={user ? 'Tabs' : 'Welcome'}
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
            {/* Auth / pre-app screens (no drawer here) */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />

            {/* Main app wrapped by the drawer */}
            <Stack.Screen name="Tabs" component={TabsWithDrawer} />

            {/* Other stack screens */}
            <Stack.Screen
              name="EditableRecommendation"
              component={EditableRecommendation}
            />
            <Stack.Screen name="Members" component={Members} />
            <Stack.Screen name="ManagePanel" component={ManagePanel} />
            <Stack.Screen name="UsersInfo" component={UsersInfo} />
            <Stack.Screen
              name="AdminUsersScreen"
              component={AdminUsersScreen}
            />
            <Stack.Screen name="GroupsInfo" component={GroupsInfo} />
            <Stack.Screen name="OpenGroup" component={OpenGroupScreen} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="ReviewingReports" component={ReviewingReports} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
      <Toast />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
