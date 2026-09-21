import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  PlusCircle, 
  Activity, 
  ShieldAlert, 
  HelpCircle,
  RefreshCw,
  Zap,
  ArrowRight,
  Pill,
  Copy,
  Check,
  Trash2,
  BookmarkPlus,
  BookOpen,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { WardActivityRecord, ClinicalPatientContext } from '../types';
import { calculateCrCl } from '../utils/storage';
import { HOSPITAL_WARDS, DRP_CATEGORIES } from '../data/initialData';

interface ClinicalAIExpertProps {
  onAddActivity: (record: WardActivityRecord) => void;
}

export const ClinicalAIExpert: React.FC<ClinicalAIExpertProps> = ({ onAddActivity }) => {
  // Mode: 'case-analyzer' or 'clinical-qa'
  const [activeMode, setActiveMode] = useState<'case-analyzer' | 'clinical-qa'>('case-analyzer');

  // Case Analyzer State
  const [hn, setHn] = useState('6201948');
  const [patientName, setPatientName] = useState('นายประสิทธิ์ มีสุข');
  const [age, setAge] = useState<number>(72);
  const [gender, setGender] = useState<'ชาย' | 'หญิง' | 'อื่นๆ'>('ชาย');
  const [weightKg, setWeightKg] = useState<number>(55);
  const [scrMgDl, setScrMgDl] = useState<number>(2.2);
  const [ward, setWard] = useState(HOSPITAL_WARDS[0]);
  const [bed, setBed] = useState('06');
  const [diagnoses, setDiagnoses] = useState('Urosepsis, CKD stage 4, AF, HT, Dyslipidemia');
  const [allergies, setAllergies] = useState('Penicillin (Urticaria)');
  const [medsList, setMedsList] = useState(
`Meropenem 1g IV q 8h
Vancomycin 1g IV q 12h
Warfarin 3mg oral OD hs
Amiodarone 200mg oral OD
Omeprazole 40mg IV OD
Enalapril 10mg oral OD`
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Clinical Q&A State
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [includePatientContext, setIncludePatientContext] = useState<boolean>(true);
  const [qaHistory, setQaHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `สวัสดีครับ ผมคือ **AI ผู้เชี่ยวชาญด้านเภสัชกรรมบริบาล (Clinical Pharmacist AI - BCPS)** 
พร้อมสนับสนุนการบริบาลเภสัชกรรมอิงหลักฐานเชิงประจักษ์ (Evidence-Based Clinical Guidelines):

* 💊 **การปรับขนาดยาตามหน้าที่ไต/ตับ**: KDIGO 2024, Sanford Guide (Meropenem, Vancomycin, Colistin, NOACs)
* ⚠️ **การประเมิน DRP & Interactions**: PCNE classification v9.1, Lexicomp, Micromedex
* 👴 **ยาเสี่ยงในผู้สูงอายุ**: AGS Beers Criteria 2023
* 🚨 **การจัดการ High Alert Drugs (HAD)**: Norepinephrine, Concentrated Electrolytes, Warfarin, Insulins
* 🔬 **Therapeutic Drug Monitoring (TDM)**: Vancomycin AUC/MIC 400-600, Aminoglycosides
* 🫁 **เทคนิคยาพ่นและอุปกรณ์พิเศษ**: MDI, DPI, Insulin pen, Eye drops

*คุณสามารถพิมพ์คำถาม หรือเลือกจากหัวข้อยอดนิยมด้านล่างเพื่อเริ่มการวิเคราะห์ได้ทันทีครับ*`,
    },
  ]);

  // Calculator helper
  const calculatedCrCl = calculateCrCl(age, weightKg, scrMgDl, gender);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const patientPayload = {
      hn,
      patientName,
      age,
      gender,
      weightKg,
      scrMgDl,
      crCl: calculatedCrCl,
      ward,
      bed,
      diagnoses: diagnoses.split(',').map((s) => s.trim()),
      allergies: allergies.split(',').map((s) => s.trim()),
      currentMeds: medsList.split('\n').filter((l) => l.trim().length > 0),
    };

    try {
      const res = await fetch('/api/ai/analyze-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: patientPayload }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('เกิดข้อผิดพลาดในการเรียก AI วิเคราะห์เคส');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendQA = async (queryText?: string) => {
    const textToSend = queryText || qaInput;
    if (!textToSend.trim()) return;

    const newHistory = [...qaHistory, { role: 'user' as const, text: textToSend }];
    setQaHistory(newHistory);
    if (!queryText) setQaInput('');
    setQaLoading(true);

    try {
      // Build conversation history for multi-turn clinical context (exclude the initial greeting)
      const conversationHistory = newHistory.slice(1, -1).map((item) => ({
        role: item.role,
        text: item.text,
      }));

      const res = await fetch('/api/ai/clinical-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          patientContext: includePatientContext
            ? {
                hn,
                patientName,
                age,
                gender,
                crCl: calculatedCrCl,
                diagnoses,
                allergies,
                meds: medsList,
              }
            : undefined,
          history: conversationHistory,
        }),
      });

      const data = await res.json();
      setQaHistory([...newHistory, { role: 'ai' as const, text: data.result || 'ไม่สามารถประมวลผลคำตอบได้' }]);
    } catch (err) {
      console.error('QA error:', err);
      setQaHistory([
        ...newHistory,
        { role: 'ai' as const, text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ผู้เชี่ยวชาญคลินิก' },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSaveChatAsIntervention = (aiText: string) => {
    const lines = aiText.split('\n').filter((l) => l.trim().length > 0);
    const firstLine = lines[0]?.replace(/[#*🎯💊⚠️📋🔬]/g, '').trim() || 'คำปรึกษาทางเภสัชกรรมบริบาล';

    const newRecord: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn,
      patientName,
      age,
      gender,
      ward,
      bed,
      pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
      activityType: 'DRP_INTERVENTION',
      drugsInvolved: ['Clinical Pharmacotherapy Consult'],
      drpCategory: 'C1.1 คำปรึกษาขนาดยาและการบริหารยา',
      description: `คำปรึกษา AI คลินิก: ${firstLine}`,
      recommendation: aiText.length > 350 ? `${aiText.slice(0, 350)}...` : aiText,
      physicianAcceptance: 'Accepted',
      clinicalOutcome: 'แพทย์และทีมบริบาลรับทราบข้อเสนอแนะ ปรับแผนการรักษาเพื่อความปลอดภัยสูงสุด',
      costAvoidanceEstimate: 3500,
      syncedToGoogleSheet: false,
    };

    onAddActivity(newRecord);
    alert(`บันทึกคำแนะนำของ AI ลงในระบบกิจกรรมบริบาล (Ward Activity) สำหรับผู้ป่วย HN ${hn} เรียบร้อย!`);
  };

  const handleResetChat = () => {
    setQaHistory([
      {
        role: 'ai',
        text: `สวัสดีครับ ผมคือ **AI ผู้เชี่ยวชาญด้านเภสัชกรรมบริบาล (Clinical Pharmacist AI - BCPS)** 
พร้อมสนับสนุนการบริบาลเภสัชกรรมอิงหลักฐานเชิงประจักษ์ (Evidence-Based Clinical Guidelines):

* 💊 **การปรับขนาดยาตามหน้าที่ไต/ตับ**: KDIGO 2024, Sanford Guide (Meropenem, Vancomycin, Colistin, NOACs)
* ⚠️ **การประเมิน DRP & Interactions**: PCNE classification v9.1, Lexicomp, Micromedex
* 👴 **ยาเสี่ยงในผู้สูงอายุ**: AGS Beers Criteria 2023
* 🚨 **การจัดการ High Alert Drugs (HAD)**: Norepinephrine, Concentrated Electrolytes, Warfarin, Insulins
* 🔬 **Therapeutic Drug Monitoring (TDM)**: Vancomycin AUC/MIC 400-600, Aminoglycosides
* 🫁 **เทคนิคยาพ่นและอุปกรณ์พิเศษ**: MDI, DPI, Insulin pen, Eye drops

*คุณสามารถพิมพ์คำถาม หรือเลือกจากหัวข้อยอดนิยมด้านล่างเพื่อเริ่มการวิเคราะห์ได้ทันทีครับ*`,
      },
    ]);
  };

  // Convert AI analysis to Ward Activity Record
  const handleSaveAsWardIntervention = (drpItem?: any) => {
    const draft = analysisResult?.interventionDraft;
    const newRecord: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn,
      patientName,
      age,
      gender,
      ward,
      bed,
      pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
      activityType: 'DOSE_ADJUSTMENT',
      drugsInvolved: drpItem?.drug ? [drpItem.drug] : ['Meropenem', 'Warfarin'],
      drpCategory: drpItem?.category || 'C1.1 ขนาดยาสูงเกินไปตาม CrCl',
      description: drpItem ? `${drpItem.issue} (CrCl: ${calculatedCrCl} mL/min)` : draft?.title || 'ตรวจพบความเสี่ยง DRP และขนาดยาเกินหน้าที่ไต',
      recommendation: drpItem?.recommendation || draft?.recommendationText || 'แนะนำปรับลดขนาดยาตามระดับ CrCl และเฝ้าระวัง Drug Interaction',
      physicianAcceptance: 'Accepted',
      clinicalOutcome: 'แพทย์รับคำแนะนำและปรับเปลี่ยนคำสั่งใช้ยาเรียบร้อย ป้องกันพิษต่อไตและการเกิดภาวะแทรกซ้อน',
      costAvoidanceEstimate: draft?.costAvoidanceEstimate || 4500,
      syncedToGoogleSheet: false,
    };

    onAddActivity(newRecord);
    alert(`บันทึกกิจกรรมบริบาลสำหรับผู้ป่วย HN ${hn} ลงในระบบหอผู้ป่วยเรียบร้อย! ข้อมูลพร้อมนำเสนอใน Dashboard และ Google Sheet`);
  };

  const presetQueries = [
    { label: '🩺 Renal Dose Meropenem/Vancomycin', text: 'ปรับขนาดยา Meropenem และ Vancomycin ในผู้ป่วย CrCl 20-30 ml/min ตาม KDIGO & Sanford' },
    { label: '⚡ DDI Warfarin + Amiodarone', text: 'วิเคราะห์อันตรกิริยา Warfarin + Amiodarone + Omeprazole กลไกทาง PK/PD และเป้าหมายการติดตาม INR' },
    { label: '👴 AGS Beers Criteria 2023', text: 'ประเมินความเสี่ยงรายการยาในผู้สูงอายุตาม AGS Beers Criteria 2023 สำหรับเคสนี้' },
    { label: '⚠️ การบริหาร HAD IV Norepinephrine/KCl', text: 'แนวทางการบริหาร High Alert Drug: Norepinephrine, Concentrated Potassium Chloride IV และ Heparin' },
    { label: '🔬 Vancomycin TDM & AUC/MIC', text: 'เป้าหมาย Vancomycin AUC/MIC ratio 400-600 และแนวทางการเจาะ TDM trough level ที่ถูกต้อง' },
    { label: '🫁 เทคนิคพ่นยา MDI + Spacer', text: 'ขั้นตอนการใช้ยาพ่น Inhaler MDI ร่วมกับ Spacer และข้อผิดพลาดที่พบบ่อยที่ต้อง Re-check' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Clinical Pharmacist Expert (ระบบผู้เชี่ยวชาญเภสัชกรรมบริบาล)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ขับเคลื่อนด้วย Gemini 3.8-Flash เพื่อวิเคราะห์ DRP, ปรับขนาดยาไต/ตับ, ปฏิกิริยาระหว่างยา, Medication Safety และร่างข้อเสนอแนะแก่แพทย์
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMode('case-analyzer')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'case-analyzer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ตรวจเคส &amp; DRP ผู้ป่วย (Case Analyzer)
          </button>
          <button
            onClick={() => setActiveMode('clinical-qa')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'clinical-qa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ปรึกษาปัญหาทางคลินิก (Clinical Q&amp;A)
          </button>
        </div>
      </div>

      {activeMode === 'case-analyzer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Form Input Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  ข้อมูลผู้ป่วย &amp; ค่าทางห้องปฏิบัติการ
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  CrCl อัตโนมัติ
                </span>
              </div>

              {/* Patient Basic */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">HN</label>
                  <input
                    type="text"
                    value={hn}
                    onChange={(e) => setHn(e.target.value)}
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
              </div>

              {/* Ward & Bed */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">หอผู้ป่วย</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium"
                  >
                    {HOSPITAL_WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">เตียง</label>
                  <input
                    type="text"
                    value={bed}
                    onChange={(e) => setBed(e.target.value)}
                    placeholder="เช่น 04"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Age, Gender, Weight, Scr */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">เพศ</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-1 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">น้ำหนัก (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Scr (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scrMgDl}
                    onChange={(e) => setScrMgDl(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-bold text-rose-600"
                  />
                </div>
              </div>

              {/* Calculated CrCl Card */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Cockcroft-Gault CrCl:</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    {calculatedCrCl} <span className="text-xs text-slate-400">mL/min</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      calculatedCrCl < 15
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : calculatedCrCl < 30
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : calculatedCrCl < 60
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {calculatedCrCl < 15
                      ? 'Severe Renal Impairment / ESRD'
                      : calculatedCrCl < 30
                      ? 'Moderate-Severe (CrCl < 30)'
                      : calculatedCrCl < 60
                      ? 'Mild-Moderate (CrCl 30-59)'
                      : 'Normal / Mild Renal Function'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">ต้องปรับขนาดยาไต</p>
                </div>
              </div>

              {/* Diagnoses & Allergies */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">โรคประจำตัว / ข้อบ่งใช้ (Diagnoses)</label>
                  <input
                    type="text"
                    value={diagnoses}
                    onChange={(e) => setDiagnoses(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ประวัติแพ้ยา (Drug Allergies)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-rose-200 bg-rose-50/50 text-rose-800 font-semibold rounded-lg"
                  />
                </div>
              </div>

              {/* Medications List */}
              <div className="text-xs">
                <label className="block text-slate-600 font-medium mb-1">
                  รายการยาปัจจุบันของผู้ป่วย (Current Medications)
                </label>
                <textarea
                  rows={6}
                  value={medsList}
                  onChange={(e) => setMedsList(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="ใส่ชื่อยา ขนาด วิธีให้ ความถี่ บรรทัดละ 1 ตัวยา"
                />
              </div>

              {/* Submit Analysis Button */}
              <button
                id="btn-run-case-analysis"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI กำลังวิเคราะห์ DRP, ขนาดยา &amp; Drug Interactions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>เริ่มวิเคราะห์เคสผู้ป่วยด้วย AI (Run DRP Analysis)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {analysisResult ? (
              <div className="space-y-4">
                {/* Clinical Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      บทสรุปภาพรวมทางคลินิก (Clinical Evaluation)
                    </h3>
                    <span className="text-xs text-slate-400">HN: {hn}</span>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </div>

                {/* DRP Identified List */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ปัญหาจากการใช้ยาที่ตรวจพบ (DRPs Identified)
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      {analysisResult.drpIdentified?.length || 0} รายการ
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {analysisResult.drpIdentified?.map((drp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{drp.drug}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {drp.category}
                          </span>
                        </div>
                        <p className="text-slate-700">{drp.issue}</p>
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                          <span className="font-bold">ข้อเสนอแนะของเภสัชกร: </span>
                          {drp.recommendation}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleSaveAsWardIntervention(drp)}
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-semibold shadow-xs"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>บันทึกเป็นกิจกรรมบนหอผู้ป่วย</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Renal & Hepatic Dose Adjustments */}
                {analysisResult.doseAdjustments?.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Calculator className="w-4 h-4 text-teal-600" />
                      คำแนะนำการปรับขนาดยาตาม CrCl ({calculatedCrCl} mL/min)
                    </h3>
                    <div className="mt-3 space-y-2 text-xs">
                      {analysisResult.doseAdjustments.map((adj: any, idx: number) => (
                        <div key={idx} className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl">
                          <div className="flex justify-between font-bold text-teal-950">
                            <span>{adj.drug}</span>
                            <span className="text-rose-600 line-through">{adj.currentDose}</span>
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                              <ArrowRight className="w-3.5 h-3.5" /> {adj.recommendedDose}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">{adj.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug Interactions */}
                {analysisResult.interactions?.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      อันตรกิริยาระหว่างยา (Drug-Drug Interactions)
                    </h3>
                    <div className="mt-3 space-y-2 text-xs">
                      {analysisResult.interactions.map((inter: any, idx: number) => (
                        <div key={idx} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-rose-900">{inter.pair}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              {inter.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-700">กลไก: {inter.mechanism}</p>
                          <p className="mt-1 text-emerald-800 font-medium">การจัดการ: {inter.management}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click Save All */}
                <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm">พร้อมส่งต่อข้อมูลเข้าสู่รายงานหอผู้ป่วย</h4>
                    <p className="text-xs text-slate-300">
                      บันทึกกิจกรรมบริบาลเข้าสู่ Ward Log และส่งข้อมูลเข้า Google Sheet
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveAsWardIntervention()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    + บันทึกกิจกรรมบริบาลลงระบบ
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">พร้อมวิเคราะห์เคสผู้ป่วย</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  กรอกข้อมูลผู้ป่วยและรายการยาทางด้านซ้าย จากนั้นกด "เริ่มวิเคราะห์เคสผู้ป่วยด้วย AI"
                  เพื่อตรวจสอบ DRP, Renal Dose, Drug Interactions และร่างคำแนะนำสำหรับแพทย์
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Clinical Q&A Mode */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[720px]">
          {/* Top Control Bar */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">โหมดปรึกษาเภสัชกรรมบริบาล (Evidence-Based Clinical Consult)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    KDIGO • Sanford • Beers 2023
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ระบบจดจำบริบทการสนทนาต่อเนื่อง (Multi-turn Contextual Memory)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Patient Context Toggle */}
              <button
                type="button"
                onClick={() => setIncludePatientContext(!includePatientContext)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  includePatientContext
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
                title="เปิด/ปิด การส่งข้อมูลผู้ป่วยเคสปัจจุบัน (อายุ, ค่าไต, รายการยา) ไปพร้อมคำถาม"
              >
                {includePatientContext ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>แนบข้อมูลผู้ป่วย (HN {hn})</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>ถามทั่วไป (ไม่แนบประวัติผู้ป่วย)</span>
                  </>
                )}
              </button>

              {/* Reset Chat Button */}
              <button
                type="button"
                onClick={handleResetChat}
                className="text-xs text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer bg-white"
                title="ล้างประวัติการสนทนา"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างการสนทนา</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="p-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap pl-1">คำถามด่วน:</span>
            {presetQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendQA(q.text)}
                className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors shadow-2xs"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {qaHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-3xl rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white p-4 rounded-br-none font-medium shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 p-4 sm:p-5 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div className="space-y-3">
                      {/* Message Tool Bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-400 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-800 flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5" />
                            Clinical Pharmacist AI
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            BCPS Specialist
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text, i)}
                            className="px-2 py-1 hover:bg-slate-100 text-slate-600 rounded-md flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
                            title="คัดลอกคำตอบ"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">คัดลอกแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>คัดลอก</span>
                              </>
                            )}
                          </button>

                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSaveChatAsIntervention(msg.text)}
                              className="px-2 py-1 hover:bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-1 transition-colors text-[11px] font-medium cursor-pointer border border-emerald-200"
                              title="นำคำแนะนำนี้ไปบันทึกเป็นกิจกรรมบริบาลหอผู้ป่วย"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>บันทึกเป็น Intervention</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rendered Markdown Body */}
                      <div className="markdown-content text-xs sm:text-sm text-slate-800">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}

            {qaLoading && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 max-w-xl">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
                <div>
                  <p className="font-semibold">AI Clinical Pharmacist กำลังสืบค้นและวิเคราะห์...</p>
                  <p className="text-[11px] text-emerald-700">อ้างอิงแนวทาง KDIGO, Sanford Guide, Beers Criteria และฐานข้อมูลยา</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQA();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                placeholder="พิมพ์คำถามทางเภสัชกรรมบริบาล เช่น ปรับขนาดยาตาม CrCl, DRP, ยา HAD, ยาเทคนิคพิเศษ..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <button
                type="submit"
                disabled={qaLoading || !qaInput.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>ส่งคำถาม</span>
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>กด Enter เพื่อส่งคำถาม • ตอบสนองด้วยโมเดล Gemini 3.8-Flash</span>
              {includePatientContext && (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> เชื่อมข้อมูลผู้ป่วย: {patientName} (CrCl {calculatedCrCl} mL/min)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
