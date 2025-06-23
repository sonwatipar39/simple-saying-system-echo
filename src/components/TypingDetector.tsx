import React, { useEffect, useState } from 'react';
import { wsClient } from '@/integrations/ws-client';

interface TypingEvent {
  id: string;
  user_ip: string;
  field_name: string;
  is_typing: boolean;
  timestamp: string;
}

const TypingDetector = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBj+S2PS1fyEE');
    audio.play().catch(() => console.log('Could not play notification sound'));
  };

  useEffect(() => {
    wsClient.on('typing_event', (newEvent) => {
      if (newEvent.is_typing) {
        setTypingUser(newEvent.user_ip);
        setShowNotification(true);
        playNotificationSound();
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    });
    return () => {
      wsClient.off('typing_event', () => {});
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
      🎯 TYPING DETECTED - User {typingUser} is typing
    </div>
  );
};

export default TypingDetector;
