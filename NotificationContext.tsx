import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationService } from './notificationService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: any | null;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      // Register for push notifications
      const token = await NotificationService.registerForPushNotifications();
      if (isMounted && token) {
        setExpoPushToken(token);
      }

      // Listen for incoming notifications when app is foregrounded
      const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
        if (isMounted) {
          setNotification(notification);
        }
      });

      // Listen for notification responses (user taps on notification)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        // You can navigate to specific screens here based on notification data
      });

      return () => {
        notificationSubscription.remove();
        responseSubscription.remove();
      };
    };

    setupNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save push token when user logs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && expoPushToken) {
        await NotificationService.savePushToken(user.uid, expoPushToken);
      }
    });

    return () => unsubscribe();
  }, [expoPushToken]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};