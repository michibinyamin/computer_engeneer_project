import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const ManagePanel = () => {
  const navigation = useNavigation<any>()

  const goToUsersInfo = () => {
    navigation.navigate('UsersInfo')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Control Panel</Text>

      <TouchableOpacity style={styles.button} onPress={goToUsersInfo}>
        <Text style={styles.buttonText}>Manage Users</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    //backgroundColor: 'white',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#dbeafe',
  },
  button: {
    backgroundColor: 'darkblue',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default ManagePanel
