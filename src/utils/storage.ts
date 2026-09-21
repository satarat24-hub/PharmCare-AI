import { WardActivityRecord, WardStorageAudit, GoogleSheetConfig } from '../types';
import { INITIAL_WARD_ACTIVITIES, INITIAL_STORAGE_AUDITS, HOSPITAL_WARDS } from '../data/initialData';

const ACTIVITIES_KEY = 'pharmcare_ward_activities_v1';
const AUDITS_KEY = 'pharmcare_storage_audits_v1';
const SHEET_CONFIG_KEY = 'pharmcare_sheet_config_v1';

const LEGACY_WARD_MAP: Record<string, string> = {
  'อายุรกรรมชาย 1': 'FL5',
  'อายุรกรรมหญิง 1': 'FL5',
  'อายุรกรรมหญิง 2': 'FL6',
  'ศัลยกรรมชาย': 'FL7',
  'ศัลยกรรมหญิง': 'FL7',
  'ICU อายุรกรรม': 'ICU2',
  'ICU ศัลยกรรม': 'ICU2',
  'กุมารเวชกรรม': 'FL7',
  'สูตินรีเวชกรรม': 'FL6',
  'ออร์โธปิดิกส์': 'FL7',
  'หอผู้ป่วยพิเศษ': 'FL5',
};

function normalizeWard(ward: string): string {
  if (HOSPITAL_WARDS.includes(ward)) {
    return ward;
  }
  return LEGACY_WARD_MAP[ward] || HOSPITAL_WARDS[0];
}

export function loadStoredActivities(): WardActivityRecord[] {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    if (data) {
      const parsed: WardActivityRecord[] = JSON.parse(data);
      return parsed.map((item) => ({
        ...item,
        ward: normalizeWard(item.ward),
      }));
    }
  } catch (e) {
    console.error('Error loading stored activities', e);
  }
  // Default to initial rich mock data
  return INITIAL_WARD_ACTIVITIES;
}

export function saveStoredActivities(activities: WardActivityRecord[]) {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities', e);
  }
}

export function loadStoredAudits(): WardStorageAudit[] {
  try {
    const data = localStorage.getItem(AUDITS_KEY);
    if (data) {
      const parsed: WardStorageAudit[] = JSON.parse(data);
      return parsed.map((item) => ({
        ...item,
        ward: normalizeWard(item.ward),
      }));
    }
  } catch (e) {
    console.error('Error loading stored audits', e);
  }
  return INITIAL_STORAGE_AUDITS;
}

export function saveStoredAudits(audits: WardStorageAudit[]) {
  try {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
  } catch (e) {
    console.error('Error saving audits', e);
  }
}

export function loadGoogleSheetConfig(): GoogleSheetConfig {
  try {
    const data = localStorage.getItem(SHEET_CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading sheet config', e);
  }
  return {
    webhookUrl: '',
    sheetName: 'PharmCare_IPD_Log',
    autoSync: false,
    lastSyncTime: undefined
  };
}

export function saveGoogleSheetConfig(config: GoogleSheetConfig) {
  try {
    localStorage.setItem(SHEET_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving sheet config', e);
  }
}

// Cockcroft-Gault CrCl Calculator
export function calculateCrCl(age: number, weightKg: number, scrMgDl: number, gender: 'ชาย' | 'หญิง' | 'อื่นๆ'): number {
  if (!age || !weightKg || !scrMgDl || scrMgDl <= 0) return 0;
  // CrCl = ((140 - age) * weight) / (72 * Scr) (* 0.85 for female)
  const base = ((140 - age) * weightKg) / (72 * scrMgDl);
  const factor = gender === 'หญิง' ? 0.85 : 1.0;
  return Math.round(base * factor * 10) / 10;
}

// Export array to CSV string
export function convertActivitiesToCSV(activities: WardActivityRecord[]): string {
  const headers = [
    'ID',
    'Date',
    'HN',
    'Patient Name',
    'Age',
    'Gender',
    'Ward',
    'Bed',
    'Pharmacist',
    'Activity Type',
    'Drugs Involved',
    'DRP Category',
    'Med Error Stage',
    'Med Error Severity',
    'Description',
    'Recommendation',
    'Physician Acceptance',
    'Outcome',
    'Cost Avoidance (THB)'
  ];

  const rows = activities.map(a => [
    `"${a.id}"`,
    `"${a.date}"`,
    `"${a.hn}"`,
    `"${a.patientName.replace(/"/g, '""')}"`,
    a.age,
    `"${a.gender}"`,
    `"${a.ward}"`,
    `"${a.bed}"`,
    `"${a.pharmacistName.replace(/"/g, '""')}"`,
    `"${a.activityType}"`,
    `"${a.drugsInvolved.join(', ').replace(/"/g, '""')}"`,
    `"${(a.drpCategory || '').replace(/"/g, '""')}"`,
    `"${(a.medErrorStage || '').replace(/"/g, '""')}"`,
    `"${(a.medErrorSeverity || '').replace(/"/g, '""')}"`,
    `"${a.description.replace(/"/g, '""')}"`,
    `"${a.recommendation.replace(/"/g, '""')}"`,
    `"${a.physicianAcceptance}"`,
    `"${a.clinicalOutcome.replace(/"/g, '""')}"`,
    a.costAvoidanceEstimate
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Generate TSV for direct Google Sheet Copy-Paste
export function convertActivitiesToTSV(activities: WardActivityRecord[]): string {
  const headers = [
    'ID', 'วันที่', 'HN', 'ชื่อผู้ป่วย', 'อายุ', 'เพศ', 'หอผู้ป่วย', 'เตียง', 
    'เภสัชกร', 'ประเภทกิจกรรม', 'ยาที่เกี่ยวข้อง', 'หมวดหมู่ DRP', 
    'ขั้นตอน ME', 'ระดับความรุนแรง ME', 'รายละเอียดปัญหา', 
    'คำแนะนำของเภสัชกร', 'การยอมรับของแพทย์', 'ผลลัพธ์ทางคลินิก', 'มูลค่าความปลอดภัย (บาท)'
  ];

  const rows = activities.map(a => [
    a.id,
    a.date,
    a.hn,
    a.patientName,
    a.age,
    a.gender,
    a.ward,
    a.bed,
    a.pharmacistName,
    a.activityType,
    a.drugsInvolved.join(', '),
    a.drpCategory || '-',
    a.medErrorStage || '-',
    a.medErrorSeverity || '-',
    a.description.replace(/\n/g, ' '),
    a.recommendation.replace(/\n/g, ' '),
    a.physicianAcceptance,
    a.clinicalOutcome.replace(/\n/g, ' '),
    a.costAvoidanceEstimate
  ]);

  return [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
}

// Aliases and convenience methods
export const getStoredActivities = loadStoredActivities;
export const saveActivities = saveStoredActivities;
export const getStoredAudits = loadStoredAudits;
export const saveAudits = saveStoredAudits;

export function getSheetWebhookUrl(): string {
  return loadGoogleSheetConfig().webhookUrl || '';
}

export function saveSheetWebhookUrl(url: string) {
  const cfg = loadGoogleSheetConfig();
  cfg.webhookUrl = url;
  saveGoogleSheetConfig(cfg);
}
