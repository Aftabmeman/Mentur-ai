'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export function NotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    const setupMessaging = async () => {
      // Basic environment checks
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
        return;
      }

      try {
        const supported = await isSupported();
        if (!supported) return;

        const { firebaseApp } = initializeFirebase();
        const messaging = getMessaging(firebaseApp);

        // Many mobile browsers block permission requests unless triggered by a click.
        // We check current permission first to avoid unnecessary prompts that might cause errors.
        if (Notification.permission === 'default') {
          // We don't force prompt on mount to avoid browser-level 'annoyance' blocks
          // A better pattern is to have a 'Enable Notifications' button in settings.
          return; 
        }

        if (Notification.permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BBhVnKOPUzQ4q80N8IUvoavoXtLvKT49T6BHWJgB6wpWcOs9Lcvn8YZANtdZSUJQqF4kSZ53vpWK2cwysjtxh1I'
          });
          
          if (token) {
            // Token is available, user is already opted in.
          }
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || 'Study Reminder',
            description: payload.notification?.body || 'Time for your next assessment!',
          });
        });

      } catch (error) {
        // Silent catch for notification-related issues
        console.warn('FCM setup bypassed:', error);
      }
    };

    setupMessaging();
  }, [toast]);

  return null;
}
