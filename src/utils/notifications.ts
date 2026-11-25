/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReminderSetting {
  id: string;
  title: string;
  time: string; // HH:MM
  enabled: boolean;
  message: string;
}

// App 100% Vergine: nessun promemoria pre-impostato
export const DEFAULT_REMINDERS: ReminderSetting[] = [];

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendPushNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon.svg',
      });
    } catch {
      // Fallback silent
    }
  }
}
