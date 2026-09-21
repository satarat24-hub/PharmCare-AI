/**
 * Types for PharmCare AI - Clinical Pharmacy & Ward Management System
 */

export type Gender = 'ชาย' | 'หญิง' | 'อื่นๆ';

export type ActivityType = 
  | 'DRP_INTERVENTION'      // การค้นหาและแก้ไข DRP
  | 'DOSE_ADJUSTMENT'       // การปรับขนาดยาตามการทำงานของไต/ตับ
  | 'MED_ERROR_PREVENTION'  // ดักจับความคลาดเคลื่อนทางยา (Near-Miss)
  | 'STORAGE_HAD_AUDIT'     // ตรวจสอบการจัดเก็บยา & HAD
  | 'SPECIAL_TECHNIQUE'     // ให้คำปรึกษายาเทคนิคพิเศษ
  | 'DISCHARGE_COUNSELING'  // ส่งมอบยาและบริบาลก่อน Discharge
  | 'ADR_MONITORING';       // เฝ้าระวังผลข้างเคียง/แพ้ยา

export type PhysicianAcceptance = 'Accepted' | 'Modified' | 'Rejected' | 'Pending';

export type MedErrorStage = 'Prescribing' | 'Transcribing' | 'Dispensing' | 'Administration';

export type MedErrorSeverity = 
  | 'A: มีความเสี่ยง'
  | 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)'
  | 'C: ถึงตัวผู้ป่วยแต่ไม่เกิดอันตราย'
  | 'D: ต้องติดตามเฝ้าระวัง'
  | 'E: เกิดอันตรายชั่วคราว'
  | 'F: นอนรพ. นานขึ้น';

export interface WardActivityRecord {
  id: string;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD
  hn: string;
  patientName: string;
  age: number;
  gender: Gender;
  ward: string;
  bed: string;
  pharmacistName: string;
  activityType: ActivityType;
  drugsInvolved: string[];
  drpCategory?: string; // เช่น C1.1 ขนาดยาสูงเกินไป, C3.1 Drug interaction
  medErrorStage?: MedErrorStage;
  medErrorSeverity?: MedErrorSeverity;
  description: string;
  recommendation: string;
  physicianAcceptance: PhysicianAcceptance;
  clinicalOutcome: string;
  costAvoidanceEstimate: number; // Baht
  notes?: string;
  syncedToGoogleSheet: boolean;
}

export interface WardStorageAudit {
  id: string;
  date: string;
  ward: string;
  inspector: string;
  fridgeTempMin: number;
  fridgeTempMax: number;
  isTempPass: boolean;
  hadStoragePassed: boolean; // ติดป้ายเตือน แยกเก็บ ไม่ปะปน
  lasaStoragePassed: boolean; // แยกเก็บยา LASA
  lightSensitivePassed: boolean; // ยาไวต่อแสงใส่ซองชา/กล่องทึบ
  expiredCount: number;
  status: 'ผ่านเกณฑ์ 100%' | 'พบข้อบกพร่องแก้ไขทันที' | 'ต้องปรับปรุง';
  correctiveNotes?: string;
  syncedToGoogleSheet: boolean;
}

export interface SpecialDeviceGuide {
  id: string;
  nameTh: string;
  nameEn: string;
  category: 'Inhaler' | 'Injection' | 'Ophthalmic' | 'Sublingual' | 'Topical/Patch' | 'Other';
  indications: string;
  keySteps: string[];
  criticalTips: string[];
  commonMistakes: string[];
  storageRules: string;
  cleanAndMaintenance: string;
}

export interface GoogleSheetConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}

export interface ClinicalPatientContext {
  hn: string;
  patientName: string;
  age: number;
  gender: Gender;
  weightKg: number;
  scrMgDl: number;
  egfr?: number;
  diagnoses: string[];
  allergies: string[];
  currentMeds: {
    drugName: string;
    dose: string;
    route: string;
    frequency: string;
    indication?: string;
  }[];
}

export interface PatientMedicationScheduleItem {
  timeSlot: string; // e.g. "ก่อนอาหารเช้า", "หลังอาหารเช้า", "ก่อนนอน"
  timeHour?: string; // e.g. "07:30 น."
  timingNote?: string; // e.g. "กินก่อนอาหาร 30 นาที"
  medications: {
    tradeAndGenericName: string;
    strength?: string;
    dosage: string;
    appearance?: string; // สี รูปทรง รูปร่าง
    purpose: string; // สรรพคุณ
    specialInstruction?: string;
  }[];
}

export interface PatientMedicationPlan {
  headerTitle?: string;
  patientGreeting?: string;
  stoppedMedsNotice?: {
    name: string;
    reason: string;
  }[];
  scheduleItems: PatientMedicationScheduleItem[];
  highAlertDrugsTips?: {
    drugName: string;
    keyCaution: string;
    dosAndDonts: string;
    dietaryCaution?: string;
  }[];
  redFlagSymptoms: string[];
  homeStorageTips: string[];
  nextAppointmentNotes?: string;
  pharmacistContact?: string;
  rawText?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'activities' 
  | 'clinical-ai' 
  | 'special-device' 
  | 'storage-had' 
  | 'discharge' 
  | 'google-sheet';
