import { trpc } from '@/src/util/trpc.ts';
import { FC, useEffect } from 'react';

export const AppWrapper: FC<{ children: any }> = ({ children }) => {
  const subscriptionMutator = trpc.sub.subscribe.useMutation();
  useEffect(() => {
    // Ask for permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(() => {
        subscribeUserToPush();
      });
    }
  }, []);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  async function subscribeUserToPush() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_KEY_PUBLIC,
        ),
      });

      // Utility to convert ArrayBuffer to Base64
      function arrayBufferToBase64(buffer: ArrayBuffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return window.btoa(binary);
      }

      const auth = subscription.getKey('auth');
      const p256dh = subscription.getKey('p256dh');

      if (!auth || !p256dh) {
        throw new Error('No key information found in subscription');
      }

      subscriptionMutator.mutate({
        auth: arrayBufferToBase64(auth), // Convert to Base64
        p256dh: arrayBufferToBase64(p256dh), // Convert to Base64
        endpoint: subscription.endpoint,
      });

      console.log('Push subscription:', subscription);
    }
  }

  return <>{children}</>;
};
