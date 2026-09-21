/**
 * Notification Service for PharmCare AI
 * Automatically dispatches notifications to satarat24@gmail.com whenever data is added
 */

import { ADMIN_EMAIL } from './auth';

export interface EmailNotificationLog {
  id: string;
  timestamp: string;
  recipient: string;
  type: 'NEW_ACTIVITY' | 'NEW_AUDIT';
  title: string;
  summary: string;
  status: 'DELIVERED' | 'DISPATCHED' | 'FAILED';
  deliveryChannels: string[];
}

const STORAGE_KEY_NOTIFS = 'pharmcare_notification_history_v1';

export function getStoredNotificationLogs(): EmailNotificationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotificationLog(log: EmailNotificationLog): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredNotificationLogs();
    const updated = [log, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save notification log:', err);
  }
}

/**
 * Sends notification to satarat24@gmail.com whenever a new activity or audit is added
 */
export async function dispatchAdminNotification(
  type: 'NEW_ACTIVITY' | 'NEW_AUDIT',
  record: any,
  webhookUrl?: string
): Promise<{ success: boolean; log: EmailNotificationLog }> {
  const timestamp = new Date().toISOString();
  let title = '';
  let summary = '';

  if (type === 'NEW_ACTIVITY') {
    title = `[กิจกรรมบริบาลใหม่] ${record.ward || 'หอผู้ป่วย'} • HN: ${record.hn || '-'}`;
    summary = `ผู้ป่วย: ${record.patientName || '-'} (เตียง ${record.bed || '-'}) • ${record.activityType || '-'} • DRP: ${record.drpCategory || record.description?.slice(0, 40) || '-'}`;
  } else {
    title = `[ผลตรวจตู้เย็น & HAD] ${record.ward || 'หอผู้ป่วย'} • สถานะ: ${record.status || '-'}`;
    summary = `หอผู้ป่วย: ${record.ward || '-'} • ตู้เย็น: ${record.fridgeTempMin}° - ${record.fridgeTempMax}°C (${record.isTempPass ? 'ผ่าน' : 'ไม่ผ่าน'}) • ผู้ตรวจ: ${record.inspector || '-'}`;
  }

  const deliveryChannels: string[] = ['ระบบส่งอีเมลกลาง'];

  try {
    const response = await fetch('/api/notifications/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        record,
        webhookUrl,
      }),
    });

    const data = await response.json();
    if (data.dispatchedVia && Array.isArray(data.dispatchedVia)) {
      deliveryChannels.push(...data.dispatchedVia);
    }

    const log: EmailNotificationLog = {
      id: `NOTIF-${Date.now()}`,
      timestamp,
      recipient: ADMIN_EMAIL,
      type,
      title,
      summary,
      status: 'DELIVERED',
      deliveryChannels: Array.from(new Set(deliveryChannels)),
    };

    saveNotificationLog(log);
    return { success: true, log };
  } catch (err) {
    console.warn('Notification API error, logged locally:', err);
    const log: EmailNotificationLog = {
      id: `NOTIF-${Date.now()}`,
      timestamp,
      recipient: ADMIN_EMAIL,
      type,
      title,
      summary,
      status: 'DISPATCHED',
      deliveryChannels: ['บันทึกประวัติภายใน (Local Dispatch)'],
    };
    saveNotificationLog(log);
    return { success: true, log };
  }
}
