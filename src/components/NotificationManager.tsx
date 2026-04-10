'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    const setupMessaging = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

      try {
        const { firebaseApp } = initializeFirebase();
        const messaging = getMessaging(firebaseApp);

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' // Aapko Firebase Console se VAPID key yahan dalni hogi
          });
          
          if (token) {
            console.log('FCM Token generated:', token);
            // In a real app, you'd save this token to the user's Firestore profile
          }
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);
          toast({
            title: payload.notification?.title || 'Study Reminder',
            description: payload.notification?.body || 'Time for your next assessment!',
          });
        });

      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    setupMessaging();
  }, [toast]);

  return null;
}