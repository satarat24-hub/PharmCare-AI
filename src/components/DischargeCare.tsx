import React, { useState } from 'react';
import { 
  LogOut, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Printer, 
  PlusCircle, 
  AlertTriangle, 
  Clock, 
  Pill,
  Send,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertOctagon,
  ShieldCheck,
  HeartPulse,
  PhoneCall,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { WardActivityRecord, PatientMedicationPlan } from '../types';
import { HOSPITAL_WARDS } from '../data/initialData';

interface DischargeCareProps {
  onAddActivity: (record: WardActivityRecord) => void;
}

const DEFAULT_MEDICATION_PLAN: PatientMedicationPlan = {
  headerTitle: 'คู่มือและตารางเวลากินยาสำหรับผู้ป่วยและญาติ (Patient Medication Plan)',
  patientGreeting: 'คู่มือนี้จัดทำขึ้นเฉพาะสำหรับผู้ป่วยและครอบครัว เพื่อให้รับประทานยาได้อย่างถูกต้อง ปลอดภัย และตรงเวลา หากมีข้อสงสัยสามารถโทรสอบถามกลุ่มงานเภสัชกรรมได้ตลอดเวลา',
  stoppedMedsNotice: [
    {
      name: 'Enoxaparin (ยาฉีดสลายลิ่มเลือดเข้าใต้ผิวหนัง)',
      reason: 'เป็นยาฉีดป้องกันลิ่มเลือดเฉพาะช่วงนอนโรงพยาบาล แพทย์สั่งหยุดแล้ว "ห้ามฉีดต่อเด็ดขาด"'
    },
    {
      name: 'Omeprazole 40mg ฉีดเข้าหลอดเลือดดำ',
      reason: 'เปลี่ยนเป็นยากินเรียบร้อยแล้ว'
    },
    {
      name: 'Regular Insulin sliding scale',
      reason: 'ควบคุมน้ำตาลได้คงที่แล้ว ปรับเป็นยากิน Metformin แทน'
    }
  ],
  scheduleItems: [
    {
      timeSlot: 'เช้า (หลังอาหาร)',
      timeHour: '08:00 น.',
      timingNote: 'หลังอาหารเช้าทันที ไม่ควรปล่อยให้ท้องว่าง',
      medications: [
        {
          tradeAndGenericName: 'Aspirin (แอสไพริน)',
          strength: '81 mg',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 1 ครั้ง',
          appearance: 'เม็ดเคลือบกลมเล็กสีขาว',
          purpose: 'ต้านเกล็ดเลือด ป้องกันลิ่มเลือดอุดตันในหลอดเลือดหัวใจ',
          specialInstruction: 'กลืนทั้งเม็ดพร้อมน้ำ 1 แก้ว ห้ามเคี้ยวหรือบดเม็ดยา'
        },
        {
          tradeAndGenericName: 'Cordarone (Amiodarone / อะมิโอดาโรน)',
          strength: '200 mg',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 1 ครั้ง',
          appearance: 'เม็ดกลมสีขาว มีขีดแบ่งตรงกลาง',
          purpose: 'ควบคุมจังหวะการเต้นของหัวใจให้สม่ำเสมอ',
          specialInstruction: 'ควรหลีกเลี่ยงการโดนแดดจัดโดยตรง หากออกแดดให้สวมเสื้อแขนยาว'
        },
        {
          tradeAndGenericName: 'Amlodipine (แอมโลดิพีน)',
          strength: '5 mg',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 1 ครั้ง',
          appearance: 'เม็ดกลมสีขาว ขนาดกลาง',
          purpose: 'ลดความดันโลหิต ขยายหลอดเลือด',
          specialInstruction: 'สังเกตอาการข้อเท้าบวม หากมีอาการบวมมากให้แจ้งแพทย์'
        },
        {
          tradeAndGenericName: 'Metformin (เมทฟอร์มิน)',
          strength: '500 mg',
          dosage: 'กินครั้งละ 1 เม็ด (เช้า และ เย็น)',
          appearance: 'เม็ดรีสีขาว',
          purpose: 'ควบคุมระดับน้ำตาลในเลือดสำหรับผู้ป่วยเบาหวาน',
          specialInstruction: 'กินพร้อมหรือหลังอาหารทันทีเพื่อลดอาการคลื่นไส้แน่นท้อง'
        }
      ]
    },
    {
      timeSlot: 'เย็น (หลังอาหาร)',
      timeHour: '18:00 น.',
      timingNote: 'หลังอาหารเย็นทันที',
      medications: [
        {
          tradeAndGenericName: 'Metformin (เมทฟอร์มิน)',
          strength: '500 mg',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 2 ครั้ง (เช้า-เย็น)',
          appearance: 'เม็ดรีสีขาว',
          purpose: 'ควบคุมระดับน้ำตาลในเลือด',
          specialInstruction: 'กินหลังอาหารเย็น'
        }
      ]
    },
    {
      timeSlot: 'ก่อนนอน',
      timeHour: '21:00 น.',
      timingNote: 'ก่อนนอนทุกคืนในเวลาเดิมสม่ำเสมอ',
      medications: [
        {
          tradeAndGenericName: 'Warfarin (วาร์ฟาริน / ยาละลายลิ่มเลือด)',
          strength: '3 mg (เม็ดสีฟ้า)',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน',
          appearance: 'เม็ดกลมสีฟ้า มีขีดแบ่ง',
          purpose: 'ป้องกันลิ่มเลือดอุดตันในหัวใจและสมองจากภาวะหัวใจเต้นพริ้ว (AF)',
          specialInstruction: '***ยาอันตรายสูง*** กินเวลาเดียวกันทุกคืน ห้ามปรับขนาดยาเองเด็ดขาด และรับประทานผักใบเขียวในปริมาณเท่าเดิมสม่ำเสมอทุกสัปดาห์'
        },
        {
          tradeAndGenericName: 'Lipitor (Atorvastatin / อะทอร์วาสแตติน)',
          strength: '40 mg',
          dosage: 'กินครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน',
          appearance: 'เม็ดรีเคลือบฟิล์มสีขาว',
          purpose: 'ลดไขมันในเลือดและป้องกันคราบไขมันในหลอดเลือดหัวใจปริแตก',
          specialInstruction: 'หากมีอาการปวดเมื่อยกล้ามเนื้อรุนแรงผิดปกติให้แจ้งเภสัชกรหรือแพทย์'
        }
      ]
    }
  ],
  highAlertDrugsTips: [
    {
      drugName: 'Warfarin 3mg (เม็ดสีฟ้า)',
      keyCaution: 'ระวังภาวะเลือดออกผิดปกติ เช่น เลือดกำเดาไหลไม่หยุด เลือดออกตามไรฟัน ปัสสาวะสีแดง อุจจาระสีดำเหมือนยางมะตอย หรือมีรอยฟกช้ำขนาดใหญ่ผิดปกติ',
      dosAndDonts: 'กินยาตรงเวลาทุกวัน หากลืมกินยา ให้กินทันทีที่นึกได้ในวันนั้น แต่ถ้าข้ามวันแล้วให้กินขนาดปกติของวันถัดไป ห้ามเพิ่มขนาดยาเป็น 2 เท่า',
      dietaryCaution: 'หลีกเลี่ยงการกินยาแก้ปวดกลุ่ม NSAIDs (เช่น Ibuprofen, Naproxen) ซื้อยากินเอง หรือสมุนไพร/แปะก๊วย/โสม เพราะจะทำให้เลือดออกรุนแรง'
    }
  ],
  redFlagSymptoms: [
    'มีเลือดออกผิดปกติ เช่น อาเจียนเป็นเลือด อุจจาระดำคล้ำ เลือดกำเดาไหลไม่หยุดเกิน 15 นาที',
    'แน่นหน้าอกรุนแรง เหงื่อแตก ร้าวไปกรามหรือแขนซ้าย',
    'หน้าเบี้ยว ปากเบี้ยว แขนขาอ่อนแรงข้างใดข้างหนึ่ง พูดไม่ชัด หรือตามัวกะทันหัน',
    'เหนื่อยหอบ หายใจไม่ทัน นอนราบไม่ได้ ขาบวมกดบุ๋มทั้งสองข้าง',
    'ใจสั่น หน้ามืด เป็นลม หมดสติ'
  ],
  homeStorageTips: [
    'เก็บยาทุกชนิดในซองหรือแผงเดิมที่มีฉลากระบุชื่อยาและวิธีใช้อย่างชัดเจน',
    'เก็บในที่แห้ง อุณหภูมิห้อง ไม่ถูกแสงแดดส่องโดยตรง และไม่อับชื้น (ห้ามเก็บในตู้เย็น เว้นแต่มีระบุไว้ที่ซองยา)',
    'เก็บให้พ้นมือเด็กและสัตว์เลี้ยง ห้ามเทยารวมกันในตลับเดียวโดยไม่แยกประเภท'
  ],
  pharmacistContact: 'ห้องจ่ายยาผู้ป่วยใน & งานบริบาลเภสัชกรรม โทร 02-XXX-XXXX ต่อ 4120 (ตลอด 24 ชั่วโมง)'
};

export const DischargeCare: React.FC<DischargeCareProps> = ({ onAddActivity }) => {
  const [hn, setHn] = useState('5731904');
  const [patientName, setPatientName] = useState('นางกานดา มณีรัตน์');
  const [age, setAge] = useState<number>(68);
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('หญิง');
  const [ward, setWard] = useState(HOSPITAL_WARDS[2] || 'FL6');
  const [dischargeDiagnoses, setDischargeDiagnoses] = useState('Non-ST elevation MI, Atrial Fibrillation, Type 2 DM, HT');
  
  // Transition of care fields
  const [stoppedMeds, setStoppedMeds] = useState('Enoxaparin 60mg SC q 12h, Omeprazole 40mg IV, Regular Insulin sliding scale');
  const [continuedMeds, setContinuedMeds] = useState('Metformin 500mg 1 tab bid pc, Amlodipine 5mg 1 tab OD pcเช้า');
  const [newDischargeMeds, setNewDischargeMeds] = useState(
`Warfarin 3mg 1 tab OD hs (เป้าหมาย INR 2.0-3.0)
Amiodarone 200mg 1 tab OD pcเช้า
Aspirin 81mg 1 tab OD pcเช้า
Atorvastatin 40mg 1 tab OD hs`
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState<PatientMedicationPlan>(DEFAULT_MEDICATION_PLAN);
  const [activeViewMode, setActiveViewMode] = useState<'visual-table' | 'full-plan'>('visual-table');

  const handleGenerateDischargePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/discharge-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeData: {
            hn,
            patientName,
            age,
            gender,
            ward,
            diagnoses: dischargeDiagnoses,
            stoppedMeds,
            continuedMeds,
            newDischargeMeds,
          },
        }),
      });

      const data = await res.json();
      if (data.dischargePlan && typeof data.dischargePlan === 'object') {
        setPlanData({
          ...DEFAULT_MEDICATION_PLAN,
          ...data.dischargePlan,
          rawText: data.rawText,
        });
      } else if (data.rawText) {
        setPlanData((prev) => ({
          ...prev,
          rawText: data.rawText,
        }));
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการสร้างแผนบริบาลส่งมอบยาก่อนจำหน่าย ระบบจะใช้ตารางมาตรฐาน');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogDischargeActivity = () => {
    const newRecord: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn,
      patientName,
      age,
      gender,
      ward,
      bed: '14',
      pharmacistName: 'ภญ. นภัสสร สิทธิโชค (BCPS)',
      activityType: 'DISCHARGE_COUNSELING',
      drugsInvolved: ['Warfarin 3mg', 'Amiodarone 200mg', 'Aspirin 81mg', 'Atorvastatin 40mg'],
      drpCategory: 'C3.1 Drug interaction & High Alert Counseling',
      description: `บริบาลส่งมอบยาก่อนจำหน่าย (Discharge Med Rec): หยุดยาชั่วคราวใน รพ. เรียบร้อย จัดทำคู่มือตารางเวลากินยาสำหรับผู้ป่วยและญาติ (Patient Medication Plan)`,
      recommendation: 'มอบตารางเวลากินยา แนะนำเรื่องอาหารวิตามินเค นัดตรวจ INR ใน 7 วัน และเตือน Red flag signs เลือดออกผิดปกติ',
      physicianAcceptance: 'Accepted',
      clinicalOutcome: 'ผู้ป่วยและญาติผ่านการประเมิน Teach-back มีตารางเวลากินยาชัดเจน ลดความเสี่ยงยาซ้ำซ้อนและภาวะแทรกซ้อนเลือดออก',
      costAvoidanceEstimate: 12500,
      notes: 'มอบเอกสาร Patient Medication Plan ให้ผู้ป่วยนำกลับบ้าน',
      syncedToGoogleSheet: false,
    };

    onAddActivity(newRecord);
    alert(`บันทึกกิจกรรมบริบาลส่งมอบยา Discharge และตารางยาก่อนกลับบ้านสำหรับผู้ป่วย HN ${hn} เรียบร้อย!`);
  };

  const getTimeSlotIcon = (slot: string) => {
    if (slot.includes('เช้า')) return <Sun className="w-5 h-5 text-amber-600" />;
    if (slot.includes('กลางวัน')) return <Coffee className="w-5 h-5 text-orange-600" />;
    if (slot.includes('เย็น')) return <Sunset className="w-5 h-5 text-rose-600" />;
    if (slot.includes('ก่อนนอน')) return <Moon className="w-5 h-5 text-indigo-600" />;
    return <Clock className="w-5 h-5 text-slate-600" />;
  };

  const getTimeSlotBadgeColor = (slot: string) => {
    if (slot.includes('เช้า')) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (slot.includes('กลางวัน')) return 'bg-orange-100 text-orange-900 border-orange-300';
    if (slot.includes('เย็น')) return 'bg-rose-100 text-rose-900 border-rose-300';
    if (slot.includes('ก่อนนอน')) return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <LogOut className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                คู่มือและตารางเวลากินยาสำหรับผู้ป่วยและญาติ (Patient Medication Plan)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                ทบทวนความต่อเนื่องทางยา (Transition of Care), ตัดยาชั่วคราว, สร้างตารางเวลากินยารายมื้อ และเอกสารคำแนะนำก่อนกลับบ้าน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              id="btn-print-patient-plan"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>พิมพ์คู่มือตารางยาให้ผู้ป่วย</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                ข้อมูลผู้ป่วยจำหน่ายกลับบ้าน (Discharge Profile)
              </h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                Discharge Med Rec
              </span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">HN ผู้ป่วย</label>
                <input
                  type="text"
                  value={hn}
                  onChange={(e) => setHn(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'ชาย' | 'หญิง')}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                >
                  <option value="หญิง">หญิง</option>
                  <option value="ชาย">ชาย</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">หอผู้ป่วย</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  {HOSPITAL_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">การวินิจฉัยโรคก่อนจำหน่าย (Discharge Diagnoses)</label>
              <input
                type="text"
                value={dischargeDiagnoses}
                onChange={(e) => setDischargeDiagnoses(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            {/* Stopped Meds */}
            <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-rose-900 font-bold text-xs flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  ยาที่ต้อง "หยุดเด็ดขาด" ก่อนกลับบ้าน (Stopped Inpatient Meds):
                </label>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                  ห้ามกินต่อ
                </span>
              </div>
              <input
                type="text"
                value={stoppedMeds}
                onChange={(e) => setStoppedMeds(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-rose-300 rounded-lg bg-white text-rose-950 font-medium text-xs focus:ring-2 focus:ring-rose-400"
                placeholder="เช่น Enoxaparin ฉีด, Stress ulcer IV PPI..."
              />
              <p className="text-[11px] text-rose-700 leading-tight">
                ป้องกันผู้ป่วยนำยาเก่าที่บ้านหรือยาชั่วคราวใน รพ. กลับไปกินซ้ำซ้อน
              </p>
            </div>

            {/* Continued Meds */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="block text-slate-700 font-semibold text-xs">
                ยาเดิมประจำตัวที่ต้อง "กินต่อเนื่อง" (Continued Home Meds):
              </label>
              <input
                type="text"
                value={continuedMeds}
                onChange={(e) => setContinuedMeds(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                placeholder="เช่น ยาลดความดัน ยาเบาหวานเดิม"
              />
            </div>

            {/* New Discharge Meds */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                รายการยาใหม่ที่เริ่มใช้เมื่อ Discharge (New Discharge Meds):
              </label>
              <textarea
                rows={4}
                value={newDischargeMeds}
                onChange={(e) => setNewDischargeMeds(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                placeholder="ระบุชื่อยา ขนาด วิธีใช้ และเวลา..."
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-gen-discharge-plan"
                onClick={handleGenerateDischargePlan}
                disabled={isGenerating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI กำลังประมวลผลตารางเวลากินยาเฉพาะบุคคล...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>สร้างคู่มือและตารางเวลากินยาด้วย AI</span>
                  </>
                )}
              </button>

              <button
                id="btn-log-discharge-activity"
                onClick={handleLogDischargeActivity}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>บันทึกกิจกรรมบริบาล Discharge ลง Ward Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output: Patient Medication Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
            
            {/* Document Header for Patient & Hospital */}
            <div className="border-b-2 border-emerald-600 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-sm tracking-wider uppercase">
                      โรงพยาบาล • แผนกเภสัชกรรม
                    </span>
                    <span className="text-xs text-slate-500">เอกสารสำหรับผู้ป่วยและญาติ</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {planData.headerTitle || 'คู่มือและตารางเวลากินยาสำหรับผู้ป่วยและญาติ'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {planData.patientGreeting}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[200px] text-xs space-y-1 shrink-0">
                  <div><span className="text-slate-500">HN:</span> <span className="font-mono font-bold text-slate-900">{hn}</span></div>
                  <div><span className="text-slate-500">ผู้ป่วย:</span> <span className="font-bold text-slate-900">{patientName}</span></div>
                  <div><span className="text-slate-500">อายุ:</span> <span className="font-medium text-slate-800">{age} ปี ({gender})</span></div>
                  <div><span className="text-slate-500">หอผู้ป่วย:</span> <span className="font-semibold text-emerald-700">{ward}</span></div>
                  <div><span className="text-slate-500">วันที่จำหน่าย:</span> <span className="font-medium text-slate-700">{new Date().toLocaleDateString('th-TH')}</span></div>
                </div>
              </div>

              {/* Diagnosis Alert */}
              <div className="mt-3 text-xs bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2 text-emerald-950">
                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">การวินิจฉัยโรค: </span>
                  <span>{dischargeDiagnoses}</span>
                </div>
              </div>
            </div>

            {/* Stopped Meds Alert Box */}
            {planData.stoppedMedsNotice && planData.stoppedMedsNotice.length > 0 && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2 break-inside-avoid">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>คำเตือนสำคัญ: ยาที่แพทย์สั่ง "หยุดรับประทาน" (ห้ามนำกลับมากินเด็ดขาด)</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {planData.stoppedMedsNotice.map((med, idx) => (
                    <div key={idx} className="bg-white/80 border border-rose-200 p-2.5 rounded-lg flex items-start gap-2">
                      <span className="text-rose-600 font-bold mt-0.5">✕</span>
                      <div>
                        <div className="font-bold text-rose-950 text-xs">{med.name}</div>
                        <div className="text-rose-800 text-[11px] mt-0.5">{med.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Medication Schedule Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>ตารางเวลากินยาประจำวัน (Daily Medication Schedule)</span>
                </h3>
                <span className="text-xs text-slate-500">เรียงตามช่วงเวลากินยาจริง</span>
              </div>

              <div className="space-y-4">
                {planData.scheduleItems && planData.scheduleItems.map((slot, sIdx) => (
                  <div 
                    key={sIdx} 
                    className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white break-inside-avoid"
                  >
                    {/* Time Slot Header */}
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {getTimeSlotIcon(slot.timeSlot)}
                        <span className="font-bold text-slate-900 text-sm">{slot.timeSlot}</span>
                        {slot.timeHour && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getTimeSlotBadgeColor(slot.timeSlot)}`}>
                            {slot.timeHour}
                          </span>
                        )}
                      </div>
                      {slot.timingNote && (
                        <span className="text-xs text-slate-600 font-medium italic">
                          {slot.timingNote}
                        </span>
                      )}
                    </div>

                    {/* Meds in this Slot */}
                    <div className="divide-y divide-slate-100">
                      {slot.medications.map((m, mIdx) => (
                        <div key={mIdx} className="p-3.5 hover:bg-slate-50/60 transition-colors text-xs space-y-1 break-inside-avoid">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-bold">
                                <Pill className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {m.tradeAndGenericName}
                              </span>
                              {m.strength && (
                                <span className="text-[11px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-semibold">
                                  {m.strength}
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-emerald-800 bg-emerald-50/70 border border-emerald-200 px-2.5 py-1 rounded-md text-xs sm:text-right shrink-0">
                              {m.dosage}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                            {m.appearance && (
                              <div>
                                <span className="text-slate-400">ลักษณะเม็ดยา:</span> <span className="font-medium text-slate-700">{m.appearance}</span>
                              </div>
                            )}
                            {m.purpose && (
                              <div>
                                <span className="text-slate-400">สรรพคุณ:</span> <span className="font-medium text-slate-800">{m.purpose}</span>
                              </div>
                            )}
                          </div>

                          {m.specialInstruction && (
                            <div className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200 p-2 rounded-lg mt-1 font-medium">
                              ⚠️ {m.specialInstruction}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Alert Drugs (HAD) Special Caution */}
            {planData.highAlertDrugsTips && planData.highAlertDrugsTips.length > 0 && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 break-inside-avoid">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>คำแนะนำพิเศษสำหรับยาความเสี่ยงสูง (High Alert Drugs Caution)</span>
                </div>

                <div className="space-y-3 text-xs">
                  {planData.highAlertDrugsTips.map((had, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
                      <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                        <span>{had.drugName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                          ต้องใส่ใจเป็นพิเศษ
                        </span>
                      </div>
                      <div className="text-slate-800 leading-relaxed">
                        <span className="font-bold text-amber-900">ข้อควรระวัง: </span>
                        {had.keyCaution}
                      </div>
                      <div className="text-slate-700 leading-relaxed">
                        <span className="font-bold text-emerald-800">วิธีปฏิบัติ: </span>
                        {had.dosAndDonts}
                      </div>
                      {had.dietaryCaution && (
                        <div className="text-slate-700 leading-relaxed">
                          <span className="font-bold text-rose-800">ข้อห้ามเรื่องอาหาร/ยาอื่น: </span>
                          {had.dietaryCaution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flag Symptoms (When to see doctor immediately) */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 break-inside-avoid">
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>อาการเตือนอันตรายที่ต้องรีบมาพบแพทย์ทันที (Red Flag Symptoms)</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-950">
                {planData.redFlagSymptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/70 p-2 rounded-lg border border-rose-100">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Storage Tips & Contact */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  การเก็บรักษายาที่บ้าน
                </h4>
                {planData.pharmacistContact && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium shrink-0">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{planData.pharmacistContact}</span>
                  </div>
                )}
              </div>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {planData.homeStorageTips.map((tip, idx) => (
                  <li key={idx} className="text-[11px] leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>

            {/* Signature & Verification Block */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600 break-inside-avoid">
              <div className="border border-slate-200 p-3 rounded-lg text-center space-y-3">
                <div className="text-[11px] text-slate-500">เภสัชกรผู้ส่งมอบและให้คำปรึกษา</div>
                <div className="h-8 border-b border-dashed border-slate-300 max-w-[180px] mx-auto"></div>
                <div className="font-bold text-slate-800">ภญ. นภัสสร สิทธิโชค (BCPS)</div>
                <div className="text-[10px] text-slate-400">เภสัชกรคลินิกประจำหอผู้ป่วย</div>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg text-center space-y-3">
                <div className="text-[11px] text-slate-500">ผู้ป่วย / ญาติผู้รับมอบยาและคำแนะนำ</div>
                <div className="h-8 border-b border-dashed border-slate-300 max-w-[180px] mx-auto"></div>
                <div className="font-bold text-slate-800">({patientName} / ญาติ)</div>
                <div className="text-[10px] text-emerald-700 font-medium">ผ่านการประเมิน Teach-Back เรียบร้อย</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
