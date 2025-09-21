import React, { useEffect, useState } from 'react'
import Catagorys from './Catagorys'
import { Animated } from 'react-native'

const GeneralList = ({
  myLocation,
}: {
  myLocation: {
    latitude: number
    longitude: number
  } | null
}) => {
  const [scaleAnim] = useState(new Animated.Value(0.8))
  const [opacityAnim] = useState(new Animated.Value(0))

  useEffect(() => {
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
  }, [])

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Catagorys groupId={'General'} myLocation={myLocation} />
    </Animated.View>
  )
}

export default GeneralList
