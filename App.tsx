import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'

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

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

function CustomHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>RecoMate</Text>
    </View>
  )
}

/** Drawer that wraps ONLY the main Tabs UI (not Login/Register/Welcome) */
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
  return (
    <>
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={({ route }) => ({
              // Show our custom header on most screens except those that render their own top UI
              header: () =>
                route.name !== 'Tabs' &&
                route.name !== 'EditableRecommendation' &&
                route.name !== 'Members' &&
                route.name !== 'AdminUsersScreen' &&
                route.name !== 'OpenGroup' &&
                route.name !== 'EditProfile' &&

                 ( // hide header for the direct group page
                  <CustomHeader />
                ),
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