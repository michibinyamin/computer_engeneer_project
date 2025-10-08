import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db, auth } from './firebase'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export class NotificationService {
  // Request permissions and get push token
  static async registerForPushNotifications() {
    if (!Device.isDevice) {
      alert('Must use physical device for push notifications')
      return null
    }

    try {
      // Get existing permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!')
        return null
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data
      console.log('Expo Push Token:', token)

      // For Android: configure channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        })
      }

      return token
    } catch (error) {
      console.error('Error getting push token:', error)
      return null
    }
  }

  // Save token to user's document in Firestore
  static async savePushToken(userId: string, token: string) {
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(
        userRef,
        {
          pushTokens: arrayUnion(token),
        },
        { merge: true }
      )
      console.log('Push token saved successfully')
    } catch (error) {
      console.error('Error saving push token:', error)
    }
  }

  // Remove token when user logs out
  static async removePushToken(userId: string, token: string) {
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(
        userRef,
        {
          pushTokens: arrayRemove(token),
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Error removing push token:', error)
    }
  }

  // Schedule a local notification (optional)
  static async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number = 2
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds,
      },
    })
  }

  static async sendDirectPushNotification(
    expoPushToken: string,
    title: string,
    body: string
  ) {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: { test: 'data' },
      }

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }
}
