import { WardActivityRecord, WardStorageAudit, SpecialDeviceGuide } from '../types';

export const INITIAL_WARD_ACTIVITIES: WardActivityRecord[] = [
  {
    id: 'ACT-202609-001',
    timestamp: '2026-09-20T09:15:00.000Z',
    date: '2026-09-20',
    hn: '5842109',
    patientName: 'นายสมชาย วัฒนากุล',
    age: 68,
    gender: 'ชาย',
    ward: 'FL5',
    bed: '04',
    pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
    activityType: 'DOSE_ADJUSTMENT',
    drugsInvolved: ['Meropenem', 'Vancomycin'],
    drpCategory: 'C1.1 ขนาดยาสูงเกินไปตาม CrCl',
    medErrorStage: 'Prescribing',
    medErrorSeverity: 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)',
    description: 'ผู้ป่วย Sepsis มี eGFR ลดลงจาก 52 เหลือ 24 mL/min/1.73m² (Scr 2.4 mg/dL) ได้รับคำสั่งเดิม Meropenem 1g q 8h IV',
    recommendation: 'แนะนำปรับลดขนาดยา Meropenem เป็น 500 mg q 12h IV ตามระดับ eGFR และขอส่ง TDM Vancomycin trough level ก่อน dose ที่ 4',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'แพทย์ปรับคำสั่งใช้ยาตามคำแนะนำ ป้องกันภาวะ neurotoxicity และประหยัดค่ายา',
    costAvoidanceEstimate: 3600,
    notes: 'ติดตาม Scr ซ้ำในอีก 48 ชม.',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-002',
    timestamp: '2026-09-20T10:30:00.000Z',
    date: '2026-09-20',
    hn: '6109843',
    patientName: 'นางปราณี วงศ์สวัสดิ์',
    age: 74,
    gender: 'หญิง',
    ward: 'FL6',
    bed: '12',
    pharmacistName: 'ภญ. นภัสสร สิทธิโชค',
    activityType: 'DRP_INTERVENTION',
    drugsInvolved: ['Clopidogrel', 'Omeprazole'],
    drpCategory: 'C3.1 ปฏิกิริยาระหว่างยา (Drug Interaction)',
    medErrorStage: 'Prescribing',
    medErrorSeverity: 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)',
    description: 'ผู้ป่วย Post-PCI ได้รับ Clopidogrel 75 mg OD ร่วมกับ Omeprazole 20 mg OD ซึ่ง Omeprazole ยับยั้ง CYP2C19 ลดการเปลี่ยน Clopidogrel เป็น active metabolite เสี่ยงต่อ stent thrombosis',
    recommendation: 'เสนอเปลี่ยน PPI เป็น Pantoprazole 40 mg OD oral ซึ่งมี CYP2C19 inhibition น้อยกว่ามาก หรือพิจารณา H2-blocker',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'แพทย์เปลี่ยนเป็น Pantoprazole 40 mg OD ผู้ป่วยได้รับยาต้านเกล็ดเลือดอย่างมีประสิทธิภาพปลอดภัย',
    costAvoidanceEstimate: 12500,
    notes: 'บันทึกในแฟ้มประวัติผู้ป่วยเรียบร้อย',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-002B',
    timestamp: '2026-09-20T11:00:00.000Z',
    date: '2026-09-20',
    hn: '6401924',
    patientName: 'นายประสิทธิ์ บุญมี',
    age: 62,
    gender: 'ชาย',
    ward: 'FL7',
    bed: '08',
    pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
    activityType: 'MED_ERROR_PREVENTION',
    drugsInvolved: ['Cefazolin', 'Ceftriaxone'],
    drpCategory: 'C1.4 ยาซ้ำซ้อน (Duplicate Therapy)',
    medErrorStage: 'Transcribing',
    medErrorSeverity: 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)',
    description: 'พยาบาลคัดลอกคำสั่งยาซ้ำ โดยยังมี Cefazolin IV prophylaxis ค้างอยู่ในระบบขณะที่แพทย์สั่งเพิ่ม Ceftriaxone 2g IV OD สำหรับ intra-abdominal infection',
    recommendation: 'แจ้งพยาบาลและแพทย์ขอยกเลิกคำสั่ง Cefazolin ที่ค้างอยู่เพื่อป้องกันการได้รับยาปฏิชีวนะซ้ำซ้อน',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'ยกเลิกคำสั่งยาก่อนการจัดยาและบริหารยา ป้องกันผู้ป่วยได้รับยาซ้ำซ้อนและลดความเสี่ยงแพ้ยา',
    costAvoidanceEstimate: 1800,
    notes: 'ประสานงานกับพยาบาลหัวหน้าเวร FL7',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-003',
    timestamp: '2026-09-19T14:20:00.000Z',
    date: '2026-09-19',
    hn: '5923187',
    patientName: 'นางมาลี เจริญสุข',
    age: 58,
    gender: 'หญิง',
    ward: 'FL5',
    bed: '03',
    pharmacistName: 'ภญ. พัชรี เลิศปัญญา',
    activityType: 'SPECIAL_TECHNIQUE',
    drugsInvolved: ['Seretide Evohaler (Salmeterol/Fluticasone)', 'Berodual MDI'],
    description: 'ผู้ป่วย Asthma with acute exacerbation เตรียมกลับบ้าน ทดสอบพ่นยาพบว่ากดยาไม่สัมพันธ์กับการสูด และไม่ได้กลั้นหายใจ 10 วินาที รวมถึงไม่เคยบ้วนปากหลังพ่น',
    recommendation: 'สอนเทคนิค 7 ขั้นตอนการใช้ MDI ร่วมกับ Aerochamber Spacer สาธิตและให้ผู้ป่วย Teach-back จนถูกต้อง 100% พร้อมย้ำการบ้วนปากป้องกันเชื้อราในช่องปาก',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'ผู้ป่วยสามารถปฏิบัติได้อย่างถูกต้อง ครบถ้วน ได้ยินเสียงคลิกหายใจสม่ำเสมอ ลดโอกาส Re-admission',
    costAvoidanceEstimate: 8500,
    notes: 'ส่งมอบ spacer ฟรีตามโครงการ Asthma clinic',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-004',
    timestamp: '2026-09-19T15:45:00.000Z',
    date: '2026-09-19',
    hn: '6318902',
    patientName: 'นายอนุชา ศรีวิชัย',
    age: 54,
    gender: 'ชาย',
    ward: 'ICU2',
    bed: 'ICU2-02',
    pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
    activityType: 'STORAGE_HAD_AUDIT',
    drugsInvolved: ['Norepinephrine (4mg/4mL)', 'Potassium Chloride Injection (20mEq/10mL)'],
    drpCategory: 'ความเสี่ยง High Alert Drug (HAD) Storage',
    medErrorStage: 'Dispensing',
    medErrorSeverity: 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)',
    description: 'พบยา Norepinephrine ampoule และ KCl injection วางปนอยู่ในตะกร้ายาฉุกเฉินทั่วไปที่ไม่มีป้ายสีแดงเตือน HAD และไม่มีกุญแจล็อค',
    recommendation: 'ประสานพยาบาล ICU2 ย้ายยาเข้ากล่อง High Alert Drugs เฉพาะ มีแถบสีส้ม-แดงชัดเจน และทำ Double Check checklist ก่อนบริหารยา',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'จัดเก็บถูกต้องตามมาตรฐาน JCI / HA Medication Safety ลดความเสี่ยง Fatal medication error',
    costAvoidanceEstimate: 45000,
    notes: 'รายงานหัวหน้าหอผู้ป่วย ICU2 รับทราบและแก้ไขทันที',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-005',
    timestamp: '2026-09-18T11:10:00.000Z',
    date: '2026-09-18',
    hn: '5731904',
    patientName: 'นางสาวกานดา มณีรัตน์',
    age: 49,
    gender: 'หญิง',
    ward: 'FL6',
    bed: '18',
    pharmacistName: 'ภญ. นภัสสร สิทธิโชค',
    activityType: 'DISCHARGE_COUNSELING',
    drugsInvolved: ['Warfarin 3 mg', 'Amiodarone 200 mg'],
    drpCategory: 'C3.1 ปฏิกิริยาระหว่างยาและติดตามค่า INR',
    description: 'ผู้ป่วย Atrial Fibrillation discharge พร้อม Warfarin และเพิ่งเริ่มยา Amiodarone ก่อนกลับบ้าน ซึ่ง Amiodarone จะเพิ่มระดับ Warfarin อย่างมีนัยสำคัญ',
    recommendation: 'Reconcile ยา discharge แนะนำแพทย์นัดตรวจ INR ภายใน 5-7 วัน ให้ความรู้เรื่องอาหารวิตามินเค สัญญาณเลือดออกผิดปกติ และมอบสมุดประจำตัวผู้ใช้ยา Warfarin',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'ผู้ป่วยและญาติเข้าใจวิธีการกินยา สัญลักษณ์เตือนเลือดออก และมาตามนัดตรวจ INR ปลอดภัย',
    costAvoidanceEstimate: 15000,
    notes: 'ส่งต่อข้อมูลให้คลินิกวาร์ฟาริน (Anticoagulation Clinic)',
    syncedToGoogleSheet: true
  },
  {
    id: 'ACT-202609-006',
    timestamp: '2026-09-18T09:40:00.000Z',
    date: '2026-09-18',
    hn: '6543211',
    patientName: 'นายสิทธิชัย ยอดงาม',
    age: 46,
    gender: 'ชาย',
    ward: 'FL7',
    bed: '05',
    pharmacistName: 'ภญ. พัชรี เลิศปัญญา',
    activityType: 'DOSE_ADJUSTMENT',
    drugsInvolved: ['Amoxicillin/Clavulanate oral'],
    drpCategory: 'C1.2 ขนาดยาต่ำเกินไป (Underdose)',
    medErrorStage: 'Prescribing',
    medErrorSeverity: 'B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)',
    description: 'ผู้ป่วย Post-op infection ได้รับคำสั่งยา Augmentin ต่ำกว่ามาตรฐานการรักษา',
    recommendation: 'แนะนำปรับขนาดยาเพื่อให้ได้ขนาดยารักษาที่เพียงพอและป้องกันการดื้อยา',
    physicianAcceptance: 'Accepted',
    clinicalOutcome: 'แพทย์ปรับคำสั่งยาตามคำแนะนำ อาการติดเชื้อทุเลาลง',
    costAvoidanceEstimate: 2400,
    notes: 'บันทึกข้อมูลเรียบร้อย',
    syncedToGoogleSheet: true
  }
];

export const INITIAL_STORAGE_AUDITS: WardStorageAudit[] = [
  {
    id: 'AUD-202609-01',
    date: '2026-09-20',
    ward: 'FL5',
    inspector: 'ภก. ธนกร พึ่งสุข (BCPS)',
    fridgeTempMin: 3.2,
    fridgeTempMax: 6.8,
    isTempPass: true,
    hadStoragePassed: true,
    lasaStoragePassed: true,
    lightSensitivePassed: true,
    expiredCount: 0,
    status: 'ผ่านเกณฑ์ 100%',
    correctiveNotes: 'ตู้เย็นสะอาด บันทึกอุณหภูมิเช้า-เย็นครบถ้วน ยาอินซูลินและวัคซีนจัดเรียงเป็นระเบียบ',
    syncedToGoogleSheet: true
  },
  {
    id: 'AUD-202609-02',
    date: '2026-09-19',
    ward: 'ICU2',
    inspector: 'ภก. ธนกร พึ่งสุข (BCPS)',
    fridgeTempMin: 2.8,
    fridgeTempMax: 5.4,
    isTempPass: true,
    hadStoragePassed: true,
    lasaStoragePassed: true,
    lightSensitivePassed: true,
    expiredCount: 0,
    status: 'ผ่านเกณฑ์ 100%',
    correctiveNotes: 'กล่อง HAD กล่องสีแดงติดกุญแจครบ แถบระวัง Norepinephrine / Heparin ชัดเจน',
    syncedToGoogleSheet: true
  },
  {
    id: 'AUD-202609-03',
    date: '2026-09-18',
    ward: 'FL7',
    inspector: 'ภญ. นภัสสร สิทธิโชค',
    fridgeTempMin: 4.1,
    fridgeTempMax: 8.9, // Over 8°C!
    isTempPass: false,
    hadStoragePassed: true,
    lasaStoragePassed: false, // LASA not segregated
    lightSensitivePassed: true,
    expiredCount: 1,
    status: 'พบข้อบกพร่องแก้ไขทันที',
    correctiveNotes: 'อุณหภูมิตู้เย็นช่วงบ่ายขึ้นแตะ 8.9°C จากการเปิดตู้ทิ้งไว้ แจ้งช่างปรับอุณหภูมิ และพบ Cefazolin ปนกับ Ceftriaxone ได้ทำการแยกช่อง LASA ทันที',
    syncedToGoogleSheet: true
  },
  {
    id: 'AUD-202609-04',
    date: '2026-09-17',
    ward: 'FL6',
    inspector: 'ภญ. พัชรี เลิศปัญญา',
    fridgeTempMin: 3.5,
    fridgeTempMax: 6.2,
    isTempPass: true,
    hadStoragePassed: true,
    lasaStoragePassed: true,
    lightSensitivePassed: true,
    expiredCount: 0,
    status: 'ผ่านเกณฑ์ 100%',
    correctiveNotes: 'ปฏิบัติตามเกณฑ์มาตรฐานเรียบร้อย',
    syncedToGoogleSheet: true
  }
];

export const SPECIAL_DEVICE_GUIDES: SpecialDeviceGuide[] = [
  {
    id: 'dev-mdi',
    nameTh: 'ยาพ่นสูดชนิดหลอดกด (Metered Dose Inhaler - MDI)',
    nameEn: 'Metered Dose Inhaler (MDI)',
    category: 'Inhaler',
    indications: 'โรคหืด (Asthma), ปอดอุดกั้นเรื้อรัง (COPD) เช่น Salbutamol (Ventolin), Seretide, Berodual',
    keySteps: [
      '1. เปิดฝาครอบกระบอกยา ตรวจดูสิ่งแปลกปลอมในปากกระบอก',
      '2. เขย่ากระบอกยาในแนวตั้ง 4-5 ครั้ง เพื่อให้ตัวยาผสมเข้ากันดี',
      '3. หายใจออกทางปากช้าๆ ให้สุด (อย่าพ่นลมหายใจเข้าไปในกระบอกยา)',
      '4. ตั้งกระบอกยาขึ้น อมปากกระบอกให้สนิทด้วยริมฝีปาก (หรือถือห่างปาก 1-2 นิ้ว) โดยไม่กัดและไม่ให้ลิ้นบังช่องพ่นยา',
      '5. เริ่มหายใจเข้าทางปากช้าๆ ลึกๆ พร้อมกับกดกระบอกยาลง 1 ครั้ง',
      '6. สูดหายใจเข้าต่อไปจนเต็มปอด จากนั้นนำกระบอกยาออกจากปาก หุบปาก และกลั้นหายใจประมาณ 10 วินาที (หรือนานเท่าที่ทำได้)',
      '7. ผ่อนลมหายใจออกช้าๆ ทางจมูกหรือปาก',
      '8. หากต้องพ่นอีก 1 puff ให้รอเว้นระยะอย่างน้อย 1 นาที แล้วทำซ้ำขั้นตอนที่ 2-7',
      '9. หากมียากลุ่มสเตียรอยด์ (Steroid) ต้องบ้วนปากและกลั้วคอด้วยน้ำสะอาดแล้วบ้วนทิ้งทุกครั้ง เพื่อป้องกันเชื้อราในปากและเสียงแหบ'
    ],
    criticalTips: [
      'ต้องกดกระบอกยาพร้อมกับการเริ่มสูดหายใจเข้า (Coordination)',
      'การกลั้นหายใจ 10 วินาทีสำคัญมากเพื่อให้ละอองยาตกสะสมลึกถึงหลอดลมฝอย',
      'หากผู้ป่วยกดพร้อมสูดไม่สัมพันธ์กัน ควรแนะนำให้ใช้ร่วมกับ Spacer (กระเปาะช่วยพ่นยา)'
    ],
    commonMistakes: [
      'ลืมเขย่าขวดยาก่อนพ่น',
      'กดพ่นยาเข้าปากโดยไม่ได้สูดหายใจเข้าพร้อมกัน หรือสูดหายใจทางจมูก',
      'ไม่กลั้นหายใจหลังสูด หรือพ่นลมหายใจออกทันที',
      'พ่นยาติดต่อกันทันทีโดยไม่เว้น 1 นาที',
      'ลืมบ้วนปากหลังพ่นยาสเตียรอยด์'
    ],
    storageRules: 'เก็บที่อุณหภูมิห้อง ไม่เกิน 30°C ไม่แช่แข็ง ห้ามเจาะกระบอกยาหรือทิ้งลงกองไฟ เก็บให้พ้นแสงแดดโดยตรง',
    cleanAndMaintenance: 'ทำความสะอาดกระบอกพลาสติกสัปดาห์ละ 1 ครั้ง โดยดึงหลอดโลหะออก ล้างกระบอกพลาสติกด้วยน้ำอุ่น แล้วผึ่งลมให้แห้งสนิท ห้ามนำหลอดโลหะแช่น้ำ'
  },
  {
    id: 'dev-accuhaler',
    nameTh: 'ยาพ่นสูดชนิดผงแห้ง แอคคูฮาเลอร์ (Accuhaler / Diskus)',
    nameEn: 'Accuhaler / Diskus (DPI)',
    category: 'Inhaler',
    indications: 'Asthma / COPD เช่น Seretide Accuhaler, Flixotide Accuhaler',
    keySteps: [
      '1. จับตัวเครื่องด้านนอกด้วยมือหนึ่ง วางนิ้วโป้งอีกมือที่ร่องเลื่อน แล้วดันร่องเลื่อนออกไปจนสุดจะได้ยินเสียง "คลิก"',
      '2. หงายเครื่องขึ้น ถือในแนวนอน ดันคันโยกไปข้างหลังจนสุด จะได้ยินเสียง "คลิก" (ยาพร้อมสูด)',
      '3. หายใจออกทางปากช้าๆ ให้สุด ห่างจากตัวเครื่อง (ห้ามเป่าลมหายใจเข้าไปในเครื่องเด็ดขาดเพราะจะทำให้ผงยาชื้นจับเป็นก้อน)',
      '4. อมปากกระบอกสูบให้สนิท สูดลมหายใจเข้าทางปาก "เร็ว แรง และลึก"',
      '5. นำเครื่องออกจากปาก กลั้นหายใจประมาณ 10 วินาที แล้วค่อยๆ ผ่อนลมหายใจออก',
      '6. ปิดเครื่องโดยเลื่อนนิ้วโป้งกลับมาที่เดิมจนปิดสนิท',
      '7. บ้วนปากและกลั้วคอด้วยน้ำสะอาดแล้วบ้วนทิ้งทุกครั้ง'
    ],
    criticalTips: [
      'เป็นยาผงแห้ง ต้องสูด "เร็ว แรง และลึก" (ต่างจาก MDI ที่ต้องสูดช้าลึก)',
      'ห้ามเป่าลมหายใจเข้าเครื่องเด็ดขาด ความชื้นจะทำลายผงยา',
      'ตรวจดูช่องนับจำนวนครั้ง (Dose counter) เมื่อเหลือเลข 0 แสดงว่ายาหมด'
    ],
    commonMistakes: [
      'ดันคันโยกเล่นหลายครั้งทำให้ยาเสียทิ้ง',
      'สูดยาช้าเกินไป ทำให้ผงยาไม่กระจายลงสู่ปอด',
      'เป่าลมหายใจใส่เครื่อง'
    ],
    storageRules: 'เก็บในที่แห้ง อุณหภูมิต่ำกว่า 30°C ห้ามเก็บในห้องน้ำหรือที่ชื้น',
    cleanAndMaintenance: 'ใช้กระดาษทิชชูแห้งเช็ดปากกระบอกสูบ ห้ามใช้น้ำล้างเด็ดขาด'
  },
  {
    id: 'dev-turbuhaler',
    nameTh: 'ยาพ่นสูดชนิดผงแห้ง เทอร์บูฮาเลอร์ (Turbuhaler)',
    nameEn: 'Turbuhaler (DPI)',
    category: 'Inhaler',
    indications: 'Asthma / COPD เช่น Symbicort, Pulmicort, Bricanyl Turbuhaler',
    keySteps: [
      '1. หมุนฝาครอบออก',
      '2. ถือเครื่องในแนวตั้ง บิดฐานหมุนไปทางด้านหนึ่งจนสุด แล้วบิดกลับมาอีกด้านจนได้ยินเสียง "คลิก"',
      '3. หายใจออกทางปากให้สุด โดยหันหน้าออกห่างจากเครื่อง',
      '4. อมปากกระบอกสูบให้สนิท สูดหายใจเข้าทางปาก "เร็ว แรง และลึก"',
      '5. นำเครื่องออกจากปาก กลั้นหายใจ 10 วินาที แล้วผ่อนลมหายใจออก',
      '6. ปิดฝาครอบเครื่องให้สนิท และบ้วนปากกลั้วคอทุกครั้ง'
    ],
    criticalTips: [
      'ต้องถือเครื่องตั้งตรงเวลาบิดโหลดหมุนยา',
      'หากได้ยินเสียงคลิกแล้ว ห้ามบิดซ้ำเพราะยาจะไม่เพิ่มแต่จะนับจำนวนครั้งลดลง'
    ],
    commonMistakes: [
      'เอียงเครื่องหรือคว่ำเครื่องขณะบิดโหลดบรรจุยา',
      'เป่าลมหายใจใส่เครื่องทำให้ผงยาชื้น'
    ],
    storageRules: 'เก็บในที่แห้ง ปิดฝาให้สนิทเสมอหลังใช้ อุณหภูมิต่ำกว่า 30°C',
    cleanAndMaintenance: 'เช็ดปากกระบอกด้วยทิชชูแห้ง ห้ามล้างน้ำเด็ดขาด'
  },
  {
    id: 'dev-insulin',
    nameTh: 'ปากกาฉีดอินซูลิน (Insulin Pen)',
    nameEn: 'Insulin Pen Device',
    category: 'Injection',
    indications: 'โรคเบาหวานชนิดที่ 1 และ 2 เช่น Mixtard, Lantus, Humalog, NovoMix, Tresiba',
    keySteps: [
      '1. ตรวจสอบชนิดยาและวันหมดอายุ (หากเป็นอินซูลินชนิดขุ่น ให้คลึงปากการะหว่างฝ่ามือ 10 ครั้ง และคว่ำหงายช้าๆ 10 ครั้งจนยาเข้ากัน)',
      '2. เช็ดจุกยางด้วยสำลีชุบแอลกอฮอล์ 70% รอให้แห้ง หมุนใส่เข็มฉีดยาใหม่ให้แน่น',
      '3. ทดสอบการไหลของยา (Priming/Air shot): ปรับหมุนปุ่มยา 2 ยูนิต หงายปลายเข็มขึ้น เคาะเบาๆ แล้วกดปุ่มฉีดยาจนเห็นหยดน้ำยาที่ปลายเข็ม',
      '4. หมุนปรับขนาดยาตามที่แพทย์สั่งให้ตรงกับขีดบอกขนาด',
      '5. เลือกตำแหน่งฉีด: หน้าท้อง (ห่างสะดือ 1-2 นิ้ว), ต้นขาด้านหน้า, สะโพก หรือต้นแขน โดยสลับตำแหน่งฉีดทุกครั้งเพื่อป้องกัน lipohypertrophy',
      '6. เช็ดผิวหนังด้วยแอลกอฮอล์รอแห้ง แทงเข็มตรง 90 องศา (หรือ 45 องศาในคนผอมมาก)',
      '7. กดปุ่มฉีดยาลงจนสุดอย่างสม่ำเสมอ ค้างเข็มไว้ใต้ผิวหนังอย่างน้อย 6-10 วินาทีก่อนดึงเข็มออก เพื่อให้ยาถูกดูดซึมหมดและไม่ไหลย้อน',
      '8. ดึงเข็มออก ใช้สำลีแห้งกดเบาๆ (ห้ามนวดถู) ถอดเข็มทิ้งในถังทิ้งของมีคม ปิดฝาปากกา'
    ],
    criticalTips: [
      'ห้ามฉีดซ้ำที่เดิมติดต่อกัน (หมุนเวียนตำแหน่งฉีดเป็นตารางหรือวงกลม)',
      'นับ 1 ถึง 10 ในใจก่อนดึงเข็มออกเสมอ',
      'ห้ามนวดคลึงบริเวณที่ฉีดเพราะจะทำให้อินซูลินดูดซึมเร็วเกินไปจนน้ำตาลตก'
    ],
    commonMistakes: [
      'ลืม Prime เข็ม 2 ยูนิต ทำให้ได้ขนาดยาไม่ครบหรือมีฟองอากาศ',
      'ดึงเข็มออกเร็วเกินไป ทำให้น้ำยาหยดย้อนออกมาที่ผิวหนัง',
      'ฉีดซ้ำตำแหน่งเดิมจนเกิดก้อนไตแข็ง',
      'เก็บปากกาที่กำลังเปิดใช้ในตู้เย็น ทำให้ฉีดแล้วเจ็บปวด'
    ],
    storageRules: 'ปากกาที่ยังไม่เปิดใช้: เก็บในตู้เย็น 2-8°C (ห้ามแช่ช่องฟรีซ) | ปากกาที่กำลังเปิดใช้: เก็บที่อุณหภูมิห้อง ไม่เกิน 30°C พ้นแสงแดด มีอายุ 28-30 วัน (บางยี่ห้อ 42-56 วัน)',
    cleanAndMaintenance: 'เปลี่ยนเข็มใหม่ทุกครั้ง ไม่ใช้เข็มซ้ำเพื่อป้องกันการอุดตัน ติดเชื้อ และเข็มทื่อ'
  },
  {
    id: 'dev-eyedrop',
    nameTh: 'ยาหยอดตาและยาป้ายตา (Eye Drops & Ointments)',
    nameEn: 'Ophthalmic Preparations',
    category: 'Ophthalmic',
    indications: 'โรคตา ต้อหิน แผลกระจกตา ติดเชื้อในตา เช่น Timolol, Latanoprost, Tobramycin, Moxifloxacin',
    keySteps: [
      '1. ล้างมือให้สะอาดด้วยสบู่และเช็ดให้แห้ง',
      '2. ดึงเปลือกตาล่างลงเบาๆ ให้เป็นกระพุ้ง เงยหน้าขึ้นมองด้านบน',
      '3. ถือขวดยาห่างจากตา 1-2 ซม. (ระวังอย่าให้ปลายหลอดสัมผัสโดนดวงตา ขนตา หรือนิ้วมือ)',
      '4. หยดยา 1 หยดลงในกระพุ้งเปลือกตาล่าง',
      '5. หลับตาเบาๆ ประมาณ 2-3 นาที (อย่ากะพริบตาถี่ๆ หรือบีบตาแน่น)',
      '6. ใช้นิ้วมือกดที่หัวตา (บริเวณท่อน้ำตา Nasolacrimal duct) เบาๆ 1-2 นาที เพื่อป้องกันยาไหลลงคอและลดการดูดซึมเข้าสู่กระแสเลือด',
      '7. หากมียาหยอดตาตัวอื่น ให้เว้นระยะห่างอย่างน้อย 5 นาที',
      '8. หากมียาป้ายตา (Ointment) ให้หยอดยาชนิดน้ำก่อน แล้วจึงป้ายยาขี้ผึ้งเป็นลำดับสุดท้าย'
    ],
    criticalTips: [
      'การกดหัวตาช่วยลดผลข้างเคียงทั่วร่างกายได้อย่างมาก (เช่น ยาลดความดันลูกตา Timolol ไม่ให้ไปกดหัวใจ)',
      'ยาหยอดตามีอายุ 30 วันหลังเปิดใช้ครั้งแรก (เขียนวันที่เปิดบนขวด)'
    ],
    commonMistakes: [
      'ปลายหลอดยาสัมผัสลูกตาทำให้ปนเปื้อนเชื้อ',
      'หยอดตาติดต่อกันทันทียาตัวที่สองจะชะล้างยาตัวแรกออกหมด',
      'บีบตาแน่นทำให้น้ำยาล้นไหลออกจากตา'
    ],
    storageRules: 'เก็บตามระบุบนฉลาก (เช่น Latanoprost ก่อนเปิดเก็บในตู้เย็น 2-8°C หลังเปิดเก็บอุณหภูมิห้องได้ 4-6 สัปดาห์) ปิดฝาให้สนิท',
    cleanAndMaintenance: 'เช็ดรอบดวงตาด้วยสำลีสะอาด'
  },
  {
    id: 'dev-sublingual',
    nameTh: 'ยาอมใต้ลิ้น ไอโซดิล / ไนโตรกลีเซอริน (Sublingual Nitroglycerin / ISDN)',
    nameEn: 'Sublingual Nitroglycerin (SL NTG)',
    category: 'Sublingual',
    indications: 'บรรเทาอาการเจ็บแน่นหน้าอกเฉียบพลันจากกล้ามเนื้อหัวใจขาดเลือด (Angina Pectoris)',
    keySteps: [
      '1. เมื่อมีอาการเจ็บแน่นหน้าอก ให้ "หยุดกิจกรรม นั่งพักทันที" (ห้ามยืนเพราะอาจหน้ามืดเป็นลมจากความดันตก)',
      '2. วางยา 1 เม็ดไว้ "ใต้ลิ้น" หรือในกระพุ้งแก้ม ปล่อยให้ยาละลายช้าๆ เอง',
      '3. ห้ามเคี้ยว ห้ามกลืนเม็ดยา และห้ามดื่มน้ำตาม',
      '4. นั่งพักสังเกตอาการ 5 นาที',
      '5. หากครบ 5 นาทียังไม่หายปวด ให้อมยาเม็ดที่ 2 ได้ 1 เม็ด',
      '6. หากผ่านไปอีก 5 นาที (รวม 10-15 นาที) ยังไม่ทุเลา หรือปวดรุนแรงขึ้น ให้รีบโทร 1669 เรียกรถพยาบาลฉุกเฉินทันที (อมเม็ดที่ 3 ระหว่างรอรถ)',
      '7. ผลข้างเคียงปกติ: ปวดศีรษะตุบๆ หน้าแดง ร้อนวูบวาบ จะหายไปเองหลังหมดฤทธิ์ยา'
    ],
    criticalTips: [
      'ห้ามใช้ร่วมกับยากลุ่มเสริมสมรรถภาพทางเพศ (PDE-5 inhibitors เช่น Sildenafil, Tadalafil) ภายใน 24-48 ชม. เด็ดขาด เพราะความดันโลหิตจะตกอย่างรุนแรงถึงแก่ชีวิตได้',
      'ยาเสื่อมสภาพง่ายมากเมื่อโดนแสงและความชื้น'
    ],
    commonMistakes: [
      'กลืนยาลงคอเหมือนยาเม็ดทั่วไปทำให้ยาไม่ออกฤทธิ์',
      'ยืนอมยาทำให้หน้ามืดล้มบาดเจ็บ',
      'เอายาใส่ตลับยาพลาสติกหรือแบ่งใส่ซอง ทำให้ยาหมดฤทธิ์เร็ว'
    ],
    storageRules: 'ต้องเก็บในขวดแก้วสีชาดั้งเดิม ปิดฝาให้แน่นสนิท พกติดตัวในกระเป๋าเสื้อ/กางเกงที่ไม่อับร้อน ห้ามแช่ตู้เย็น ห้ามทิ้งไว้ในรถ ยามีอายุ 3-6 เดือนหลังเปิดขวด',
    cleanAndMaintenance: 'ตรวจสอบวันหมดอายุสม่ำเสมอ'
  },
  {
    id: 'dev-fentanyl-patch',
    nameTh: 'แผ่นแปะบรรเทาปวดกลุ่มโอปิออยด์ (Transdermal Fentanyl Patch)',
    nameEn: 'Transdermal Patch (Fentanyl / Nitroderm)',
    category: 'Topical/Patch',
    indications: 'ควบคุมอาการปวดเรื้อรังระดับปานกลางถึงรุนแรง เช่น ผู้ป่วยมะเร็ง',
    keySteps: [
      '1. แกะแผ่นแปะเดิมออกก่อนเสมอ พับทบด้านกาวเข้าหากันแล้วทิ้งอย่างมิดชิด (หรือส่งคืนห้องยาเพื่อทำลาย)',
      '2. เลือกบริเวณผิวหนังที่เรียบ แห้ง สะอาด ไม่มีขน และไม่มีแผล เช่น หน้าอกส่วนบน หลังส่วนบน ต้นแขนด้านนอก',
      '3. หากมีขน ให้ใช้กรรไกรขลิบขนออก ห้ามใช้มีดโกนเพราะจะทำให้เกิดแผลระคายเคือง',
      '4. ล้างผิวหนังด้วยน้ำเปล่าเท่านั้น ห้ามใช้สบู่ แอลกอฮอล์ โลชั่น หรือน้ำมัน',
      '5. ลอกพลาสติกป้องกันออก แปะแผ่นยาลงบนผิวหนังทันที',
      '6. ใช้ฝ่ามือกดทับแผ่นยาให้แน่นสนิทนานอย่างน้อย 30 วินาที โดยเฉพาะบริเวณขอบแผ่น',
      '7. ล้างมือด้วยน้ำเปล่าหลังแปะยาเสร็จ ห้ามใช้สบู่ล้างมือเพราะอาจเพิ่มการดูดซึมยาเข้าผิวหนังมือ',
      '8. เปลี่ยนแผ่นใหม่ทุก 72 ชั่วโมง (3 วัน) และสลับตำแหน่งแปะใหม่ทุกครั้ง'
    ],
    criticalTips: [
      'ห้ามให้แผ่นแปะสัมผัสความร้อนโดยตรง (เช่น ถุงน้ำร้อน แผ่นประคบอุ่น ซาวน่า อาบน้ำอุ่นจัด) เพราะความร้อนจะเร่งให้ยาดูดซึมเร็วเกินไปจนเกิดภาวะกดการหายใจเสียชีวิตได้',
      'ห้ามตัดแบ่งแผ่นแปะเด็ดขาด',
      'หากมีไข้สูงต้องแจ้งแพทย์เพราะการดูดซึมยาจะเพิ่มขึ้น'
    ],
    commonMistakes: [
      'ลืมลอกแผ่นเก่าออกแล้วแปะแผ่นใหม่ทับ ทำให้ได้รับยาเกินขนาด (Overdose)',
      'ประคบกระเป๋าน้ำร้อนทับแผ่นยา',
      'ตัดแผ่นแปะยา'
    ],
    storageRules: 'เก็บในซองปิดสนิทที่อุณหภูมิห้อง พ้นมือเด็กและสัตว์เลี้ยง นับเป็นยาเสพติดให้โทษประเภท 2 ต้องเก็บมิดชิด',
    cleanAndMaintenance: 'แผ่นที่ใช้แล้วยังมีตัวยาตกค้าง ต้องพับครึ่งด้านกาวประกบกันทิ้งในถุงขยะอันตรายหรือส่งคืนโรงพยาบาล'
  }
];

export const HOSPITAL_WARDS = [
  'ICU2',
  'FL5',
  'FL6',
  'FL7'
];

export const DRP_CATEGORIES = [
  'C1.1 ขนาดยาสูงเกินไป (Overdose)',
  'C1.2 ขนาดยาต่ำเกินไป (Underdose)',
  'C1.3 การเลือกยาไม่เหมาะสม (Inappropriate drug choice)',
  'C1.4 ได้รับยาซ้ำซ้อน (Duplicate therapy)',
  'C1.5 ระยะเวลาการใช้ยาสั้นหรือยาวเกินไป',
  'C2.1 รูปแบบยา/วิถีทางให้ยาไม่เหมาะสม (Form/Route)',
  'C3.1 ปฏิกิริยาระหว่างยา (Drug-Drug Interaction)',
  'C3.2 ปฏิกิริยาระหว่างยากับอาหาร (Drug-Food Interaction)',
  'C4.1 อาการไม่พึงประสงค์จากยา (Adverse Drug Event/ADR)',
  'C5.1 ความไม่ร่วมมือในการใช้ยาของผู้ป่วย (Non-adherence)',
  'C6.1 ข้อบ่งใช้แต่ไม่ได้รับยา (Untreated indication)',
  'C7.1 การติดตามผลการใช้ยาไม่เพียงพอ (Monitoring needed)'
];
