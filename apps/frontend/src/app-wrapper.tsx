import { trpc } from '@/src/util/trpc.ts';
import { FC, useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/src/stores/store.ts';
import { setUsers } from '@/src/stores/slices/auth.slice.ts';
import { MainMenu } from '@/src/components/main-menu/main-menu.tsx';
import { Link, useLocation } from 'react-router-dom';
import { Image } from '@mantine/core';
import logo from '@/src/assets/images/logo.webp';
import bgImage from '@/src/assets/images/background.webp';
export const AppWrapper: FC<{ children: any }> = ({ children }) => {
  const subscriptionMutator = trpc.sub.subscribe.useMutation();
  const location = useLocation();
  const users = trpc.auth.list.useQuery();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (users.isSuccess) {
      dispatch(setUsers(users.data));
    }
  }, [users.data, users.isSuccess]);
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
    }
  }

  const getImageStyle = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const elementHeight = Math.min(Math.max(viewportHeight * 0.25, 300), 500);
    const elementWidth = Math.min(Math.max(viewportWidth * 0.25, 300), 500);
    const elementHeightOffset = elementHeight * 0.5;
    if (location.pathname === '/') {
      // Middle of the viewport
      return {
        transform: `translate(-50%, ${viewportHeight / 2 - elementHeightOffset}px) scale(1)`,
        position: 'fixed',
        transition: 'transform 0.3s, opacity 0.3s',
        left: '50%',
        pointerEvents: 'none',
        transformOrigin: 'top',
        width: `${elementWidth}px`,
        height: `${elementHeight}px`,
        zIndex: 999,
        filter: 'drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.2))',
      } as any;
    } else {
      // Top of the viewport
      return {
        transform: `translate(-50%, 0) scale(0.35)`,
        position: 'fixed',
        transition: 'transform 0.3s, opacity 0.3',
        left: '50%',
        transformOrigin: 'top',
        width: `${elementWidth}px`,
        height: `${elementHeight}px`,
        zIndex: 999,
        opacity: 0.8,
        filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))',
      } as any;
    }
  }, [location]);
  return (
    <div className={'flex flex-col w-full h-full relative items-center'}>
      <Image
        src={bgImage}
        className={
          'fixed pointer-events-none opacity-70 w-full h-full top-0 left-0 object-cover'
        }
      ></Image>
      <div className={'h-32'}></div>
      <div
        style={getImageStyle()}
        className={'flex items-center flex-initial justify-center'}
      >
        <Link to={'/'} className={'h-full w-full'}>
          <Image src={logo} className={'h-full w-full object-contain'}></Image>
        </Link>
      </div>
      <div
        className={
          'flex-1 w-[1024px] max-w-full slg-scrollbar max-w-5xl overflow-y-auto '
        }
      >
        {children}
      </div>
      <div className={'h-24 relative flex-initial'}>
        <MainMenu></MainMenu>
      </div>
    </div>
  );
};
