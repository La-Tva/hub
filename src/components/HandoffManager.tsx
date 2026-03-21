'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSystemStore } from '@/store/useSystemStore';
import { pusherClient } from '@/lib/pusher-client';

export default function HandoffManager() {
  const { data: session } = useSession();
  const { applyRemoteUpdate } = useSystemStore();

  useEffect(() => {
    if (!session?.user?.name || !pusherClient) return;

    const channelName = `user-${encodeURIComponent(session.user.name.toLowerCase())}`;
    
    // Explicitly check pusherClient for TypeScript
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(channelName);

    channel.bind('sync', (data: any) => {
      console.log('[Handoff] Received remote update:', data);
      applyRemoteUpdate(data);
    });

    return () => {
      if (pusherClient) {
        pusherClient.unsubscribe(channelName);
      }
    };
  }, [session, applyRemoteUpdate]);

  return null; // This is a logic-only component
}
