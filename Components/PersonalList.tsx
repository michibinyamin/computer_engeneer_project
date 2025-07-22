import React from 'react'
import Catagorys from './Catagorys'
import { ScrollView } from 'react-native-gesture-handler'
import { auth } from '../firebase'

const PersonalList = () => {
  const user = auth.currentUser
  return <>{user ? <Catagorys groupId={user.uid} /> : null}</>
}

export default PersonalList
