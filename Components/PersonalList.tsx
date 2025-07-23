import React, { useEffect, useState } from 'react'
import Catagorys from './Catagorys'
import { auth } from '../firebase'
import { Animated } from 'react-native'

const PersonalList = () => {
  const user = auth.currentUser
  const [scaleAnim] = useState(new Animated.Value(0.8))
  const [opacityAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (user) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [user])

  if (!user) return null

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Catagorys groupId={user.uid} />
    </Animated.View>
  )
}

export default PersonalList
