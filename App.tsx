import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Register from './Components/Register'
import Login from './Components/Login'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import WelcomeScreen from './Components/WelcomeScreen'
import MainContainer from './Components/MainContainer'
import ResetPassword from './Components/ResetPassword'
import Members from './Components/Members'
import AdminUsersScreen from './Components/AdminUsersScreen'
import UsersInfo from './Components/UsersInfo'
import ManagePanel from './Components/ManagePanel'
import EditableRecommendation from './Components/EditableRecommendation'

const Stack = createStackNavigator()

function CustomHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>RecoMate</Text>
    </View>
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
              header: () =>
                route.name !== 'Tabs' &&
                route.name !== 'EditableRecommendation' &&
                route.name !== 'Members' &&
                route.name !== 'AdminUsersScreen' && <CustomHeader />,
            })}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Tabs" component={MainContainer} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen
              name="EditableRecommendation"
              component={EditableRecommendation}
            />
            {/* <Stack.Screen name="GroupInfo" component={GroupInfo} /> */}
            {/* <Stack.Screen name="Catagorys" component={Catagorys} /> */}
            <Stack.Screen name="Members" component={Members} />
            <Stack.Screen name="ManagePanel" component={ManagePanel} />
            <Stack.Screen name="UsersInfo" component={UsersInfo} />
            <Stack.Screen
              name="AdminUsersScreen"
              component={AdminUsersScreen}
            />
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
