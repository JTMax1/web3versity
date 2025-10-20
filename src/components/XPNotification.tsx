/**
 * XP Notification Component
 *
 * Toast-style notification that appears when user earns XP.
 * Shows animated coin/star icon and XP amount.
 */

import React, { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';

interface XPNotificationProps {
  xp: number;
  onClose: () => void;
  duration?: number;
}

export function XPNotification({ xp, onClose, duration = 3000 }: XPNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Start leave animation before closing
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 300);

    // Close after duration
    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-24 right-4 z-50 transform transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(251,191,36,0.4)] flex items-center gap-3 min-w-[160px]">
        {/* Animated Icon */}
        <div className="relative">
          <Star className="w-8 h-8 fill-white text-white animate-pulse" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-200 animate-ping" />
        </div>

        {/* XP Text */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold">+{xp} XP</span>
          <span className="text-xs text-yellow-100">Experience gained!</span>
        </div>
      </div>
    </div>
  );
}

/**
 * XP Notification Manager
 *
 * Manages multiple XP notifications with stacking.
 * Use this component in your app root.
 */
interface XPNotificationManagerProps {
  notifications: Array<{ id: string; xp: number }>;
  onDismiss: (id: string) => void;
}

export function XPNotificationManager({
  notifications,
  onDismiss,
}: XPNotificationManagerProps) {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ transform: `translateY(${index * 10}px)` }}
          className="transition-transform duration-300"
        >
          <XPNotification
            xp={notification.xp}
            onClose={() => onDismiss(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}
