const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data();
    const { userId, title, body, data } = notification;

    try {
      // Get user's push tokens from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.pushTokens || userData.pushTokens.length === 0) {
        console.log('No push tokens found for user:', userId);
        return;
      }

      // Send to all tokens (user might have multiple devices)
      const messages = userData.pushTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {},
      }));

      // Send notifications
      const responses = await Promise.all(
        messages.map(message => 
          admin.messaging().send(message).catch(error => {
            console.error('Error sending to token:', message.to, error);
            // Remove invalid tokens
            if (error.code === 'messaging/registration-token-not-registered') {
              return admin.firestore().collection('users').doc(userId).update({
                pushTokens: admin.firestore.FieldValue.arrayRemove(message.to)
              });
            }
          })
        )
      );

      console.log('Notifications sent successfully:', responses);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  });