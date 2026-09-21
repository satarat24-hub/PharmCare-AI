/**
 * Authentication and Role-Based Access Control for PharmCare AI
 * Specific rule: Dashboard access is restricted solely to satarat24@gmail.com
 */

export const ADMIN_EMAIL = 'satarat24@gmail.com';
export const STORAGE_KEY_USER_EMAIL = 'pharmcare_current_user_email';

export interface UserProfile {
  email: string;
  name: string;
  role: 'ADMIN' | 'PHARMACIST' | 'GUEST';
  department: string;
}

export const KNOWN_ACCOUNTS: UserProfile[] = [
  {
    email: 'satarat24@gmail.com',
    name: 'ภญ./ภก. satarat24 (Chief Clinical Pharmacist)',
    role: 'ADMIN',
    department: 'กลุ่มงานเภสัชกรรม / ผู้บริหารระดับสูง',
  },
  {
    email: 'ward.med@hospital.org',
    name: 'ภก. ธนกร พึ่งสุข (BCPS Med IPD)',
    role: 'PHARMACIST',
    department: 'หอผู้ป่วยอายุรกรรม',
  },
  {
    email: 'ward.surg@hospital.org',
    name: 'ภญ. พัชราภรณ์ วงศ์สวัสดิ์ (Surg IPD)',
    role: 'PHARMACIST',
    department: 'หอผู้ป่วยศัลยกรรม',
  },
  {
    email: 'staff.general@hospital.org',
    name: 'เภสัชกรประจำวอร์ดทั่วไป',
    role: 'PHARMACIST',
    department: 'กลุ่มงานเภสัชกรรมบริบาล',
  },
];

/**
 * Returns current signed-in email from localStorage.
 * Defaults to satarat24@gmail.com to maintain seamless access for the app owner.
 */
export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return ADMIN_EMAIL;
  const stored = localStorage.getItem(STORAGE_KEY_USER_EMAIL);
  if (stored && stored.trim()) {
    return stored.trim();
  }
  // Default to the admin email so satarat24 has access by default
  return ADMIN_EMAIL;
}

/**
 * Persists current signed-in email
 */
export function setCurrentUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USER_EMAIL, email.trim().toLowerCase());
}

/**
 * Checks if an email has exclusive admin access to Executive Dashboard
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
