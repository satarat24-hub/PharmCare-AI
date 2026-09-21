import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  BookOpen, 
  CheckCircle, 
  AlertOctagon, 
  ThermometerSnowflake, 
  Sparkles, 
  PlusCircle, 
  CheckSquare, 
  Square, 
  Pill,
  Send,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { SPECIAL_DEVICE_GUIDES, HOSPITAL_WARDS } from '../data/initialData';
import { SpecialDeviceGuide, WardActivityRecord } from '../types';

interface SpecialTechniqueCounselingProps {
  onAddActivity: (record: WardActivityRecord) => void;
}

export const SpecialTechniqueCounseling: React.FC<SpecialTechniqueCounselingProps> = ({
  onAddActivity,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<SpecialDeviceGuide>(SPECIAL_DEVICE_GUIDES[0]);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Patient counseling logging modal state
  const [patientHN, setPatientHN] = useState('6301248');
  const [patientName, setPatientName] = useState('นางสมจิต มีพร้อม');
  const [patientWard, setPatientWard] = useState(HOSPITAL_WARDS[0]);
  const [teachBackScore, setTeachBackScore] = useState<'100% ถูกต้องครบถ้วน' | '80% ต้องกระตุ้นซ้ำ' | 'ต้องสอนญาติเพิ่มเติม'>('100% ถูกต้องครบถ้วน');

  // AI Patient-friendly explainer generator
  const [patientCondition, setPatientCondition] = useState('ผู้ป่วยสูงอายุ 74 ปี มือสั่นเล็กน้อย มีญาติช่วยดูแล');
  const [aiPatientGuide, setAiPatientGuide] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const toggleCheckStep = (idx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleDeviceChange = (dev: SpecialDeviceGuide) => {
    setSelectedDevice(dev);
    setCheckedSteps({});
    setAiPatientGuide(null);
  };

  const handleGeneratePatientGuide = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/clinical-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `ช่วยเขียนคำอธิบายการใช้ยาเทคนิคพิเศษ "${selectedDevice.nameTh} (${selectedDevice.nameEn})" 
เป็นภาษาชาวบ้านที่สุภาพ เข้าใจง่าย เห็นภาพชัดเจน ไม่ใช้ศัพท์แพทย์ยากๆ 
สำหรับผู้ป่วยและญาติบริบท: "${patientCondition}"
โดยเน้น:
1. 3 ขั้นตอนหลักที่ห้ามทำผิด
2. วิธีการเก็บรักษาที่บ้าน
3. ข้อควรระวังและผลข้างเคียงสำคัญ`,
        }),
      });
      const data = await res.json();
      setAiPatientGuide(data.result);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการสร้างคำแนะนำสำหรับผู้ป่วย');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleLogCounselingActivity = () => {
    const newRecord: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn: patientHN,
      patientName: patientName,
      age: 70,
      gender: 'หญิง',
      ward: patientWard,
      bed: '08',
      pharmacistName: 'ภญ. พัชรี เลิศปัญญา',
      activityType: 'SPECIAL_TECHNIQUE',
      drugsInvolved: [selectedDevice.nameEn],
      description: `ให้คำปรึกษาและสาธิตการใช้ยาเทคนิคพิเศษ ${selectedDevice.nameTh} (${selectedDevice.nameEn}) ประเมิน Teach-back: ${teachBackScore}`,
      recommendation: 'สอนเทคนิคทีละขั้นตอน มอบแผ่นพับสาธิต และให้ผู้ป่วยและญาติฝึกปฏิบัติจริงจนทำได้ถูกต้อง',
      physicianAcceptance: 'Accepted',
      clinicalOutcome: 'ผู้ป่วยสามารถใช้ยาเทคนิคพิเศษได้อย่างถูกต้อง มั่นใจ ลดความเสี่ยงยาไม่เข้าปอดหรือภาวะแทรกซ้อน',
      costAvoidanceEstimate: 3500,
      notes: `ประเมิน Teach-back: ${teachBackScore}`,
      syncedToGoogleSheet: false,
    };

    onAddActivity(newRecord);
    alert(`บันทึกกิจกรรมการสอนใช้ยาเทคนิคพิเศษสำหรับ ${patientName} (HN: ${patientHN}) ลงในระบบหอผู้ป่วยเรียบร้อย!`);
  };

  const completedStepsCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalSteps = selectedDevice.keySteps.length;
  const progressPct = Math.round((completedStepsCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            คู่มือการใช้ยาเทคนิคพิเศษ &amp; ประเมินทักษะผู้ป่วย (Special Device Counseling)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          มาตรฐานขั้นตอนการใช้ยาพ่น Inhalers (MDI/DPI), ปากกาอินซูลิน, ยาหยอดตา, ยาอมใต้ลิ้น และแผ่นแปะผิวหนัง พร้อมระบบบันทึกการประเมิน Teach-Back
        </p>
      </div>

      {/* Device Selector Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {SPECIAL_DEVICE_GUIDES.map((dev) => (
          <button
            key={dev.id}
            onClick={() => handleDeviceChange(dev)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedDevice.id === dev.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {dev.nameTh.split('(')[0]}
          </button>
        ))}
      </div>

      {/* Main Content Split: Left (Guide & Checklist) vs Right (Patient Teach-Back & AI Explainer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Step Checklist & Safety Tips (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  {selectedDevice.category}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedDevice.nameTh}</h2>
                <p className="text-xs text-slate-500 font-mono">{selectedDevice.nameEn}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">ความครบถ้วน</span>
                <span className="font-extrabold text-sm text-teal-600 font-mono">
                  {completedStepsCount} / {totalSteps} ขั้นตอน ({progressPct}%)
                </span>
              </div>
            </div>

            {/* Indications */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <span className="font-bold text-slate-900">ข้อบ่งใช้และตัวอย่างยา: </span>
              {selectedDevice.indications}
            </div>

            {/* Key Steps Checklist */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>ขั้นตอนการใช้งานมาตรฐาน (Clinical Steps):</span>
                <span className="text-[11px] font-normal text-slate-500">ติ๊กถูกเมื่อสอนหรือประเมินผู้ป่วย</span>
              </h3>

              <div className="space-y-2">
                {selectedDevice.keySteps.map((step, idx) => {
                  const isChecked = !!checkedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckStep(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs sm:text-sm ${
                        isChecked
                          ? 'bg-teal-50/60 border-teal-200 text-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-teal-600 shrink-0">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                      <span className={isChecked ? 'font-medium' : ''}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Safety Tips & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  เทคนิคสำคัญเพื่อประสิทธิภาพสูงสุด
                </span>
                <ul className="space-y-1 text-emerald-950 list-disc list-inside">
                  {selectedDevice.criticalTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  ข้อผิดพลาดที่พบบ่อย (Common Pitfalls)
                </span>
                <ul className="space-y-1 text-rose-950 list-disc list-inside">
                  {selectedDevice.commonMistakes.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Storage & Maintenance */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-xs text-blue-950">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                การจัดเก็บและการดูแลรักษาความสะอาด:
              </div>
              <p>• <strong>การจัดเก็บ:</strong> {selectedDevice.storageRules}</p>
              <p>• <strong>การทำความสะอาด:</strong> {selectedDevice.cleanAndMaintenance}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Teach-Back Logging & AI Patient Explainer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Log to Ward Activities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              บันทึกการสอนเทคนิคพิเศษลงหอผู้ป่วย
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">HN ผู้ป่วย</label>
                <input
                  type="text"
                  value={patientHN}
                  onChange={(e) => setPatientHN(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ชื่อผู้ป่วย</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">หอผู้ป่วย</label>
                <select
                  value={patientWard}
                  onChange={(e) => setPatientWard(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                >
                  {HOSPITAL_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ผลการประเมิน Teach-Back</label>
                <select
                  value={teachBackScore}
                  onChange={(e) => setTeachBackScore(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="100% ถูกต้องครบถ้วน">100% สาธิตกลับถูกต้องครบถ้วน</option>
                  <option value="80% ต้องกระตุ้นซ้ำ">80% ต้องกระตุ้นเตือนบางขั้นตอน</option>
                  <option value="ต้องสอนญาติเพิ่มเติม">ต้องสอนญาติ/ผู้ดูแลเพิ่มเติม</option>
                </select>
              </div>

              <button
                onClick={handleLogCounselingActivity}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>บันทึกการสอนเทคนิคพิเศษลง Ward Log</span>
              </button>
            </div>
          </div>

          {/* AI Patient Explainer Generator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                AI แปลงเป็นภาษาชาวบ้านสำหรับสอนผู้ป่วย
              </h3>
            </div>

            <div className="text-xs space-y-2">
              <label className="block text-slate-600 font-medium">
                บริบทผู้ป่วย (เช่น ผู้สูงอายุ, มือสั่น, ตาพร่า, เด็ก):
              </label>
              <input
                type="text"
                value={patientCondition}
                onChange={(e) => setPatientCondition(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
              />

              <button
                onClick={handleGeneratePatientGuide}
                disabled={isAiGenerating}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI กำลังจัดทำคู่มือภาษาชาวบ้าน...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>สร้างคำแนะนำภาษาชาวบ้านเฉพาะบุคคล</span>
                  </>
                )}
              </button>
            </div>

            {aiPatientGuide && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-2 leading-relaxed max-h-72 overflow-y-auto">
                <div className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> คำแนะนำสำหรับมอบให้ผู้ป่วยและญาติ:
                </div>
                <div className="markdown-content">
                  <Markdown>{aiPatientGuide}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
