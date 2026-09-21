import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Download, 
  Copy, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronDown,
  User,
  Pill,
  Building,
  Check,
  RotateCcw
} from 'lucide-react';
import { WardActivityRecord, ActivityType, PhysicianAcceptance } from '../types';
import { HOSPITAL_WARDS, DRP_CATEGORIES } from '../data/initialData';
import { convertActivitiesToCSV, convertActivitiesToTSV } from '../utils/storage';

interface WardActivityLoggerProps {
  activities: WardActivityRecord[];
  onAddActivity: (record: WardActivityRecord) => void;
  onUpdateActivity: (record: WardActivityRecord) => void;
  onDeleteActivity: (id: string) => void;
  onResetToDefault?: () => void;
  onClearAllData?: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onOpenGoogleSheetTab: () => void;
}

export const WardActivityLogger: React.FC<WardActivityLoggerProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onResetToDefault,
  onClearAllData,
  isModalOpen,
  setIsModalOpen,
  onOpenGoogleSheetTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWard, setFilterWard] = useState<string>('all');
  const [filterAcceptance, setFilterAcceptance] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<WardActivityRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form State for new activity
  const [formHN, setFormHN] = useState('');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState<number>(60);
  const [formGender, setFormGender] = useState<'ชาย' | 'หญิง' | 'อื่นๆ'>('ชาย');
  const [formWard, setFormWard] = useState(HOSPITAL_WARDS[0]);
  const [formBed, setFormBed] = useState('01');
  const [formPharmacist, setFormPharmacist] = useState('ภก. ประจำหอผู้ป่วย');
  const [formActivityType, setFormActivityType] = useState<ActivityType>('DRP_INTERVENTION');
  const [formDrugs, setFormDrugs] = useState('');
  const [formDrpCategory, setFormDrpCategory] = useState(DRP_CATEGORIES[0]);
  const [formMedErrorStage, setFormMedErrorStage] = useState<'Prescribing' | 'Transcribing' | 'Dispensing' | 'Administration'>('Prescribing');
  const [formMedErrorSeverity, setFormMedErrorSeverity] = useState('B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)');
  const [formDescription, setFormDescription] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formAcceptance, setFormAcceptance] = useState<PhysicianAcceptance>('Accepted');
  const [formOutcome, setFormOutcome] = useState('');
  const [formCostAvoidance, setFormCostAvoidance] = useState<number>(2500);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  // Filtered List
  const filteredActivities = activities.filter((item) => {
    const matchSearch =
      item.hn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drugsInvolved.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'all' || item.activityType === filterType;
    const matchWard = filterWard === 'all' || item.ward === filterWard;
    const matchAccept = filterAcceptance === 'all' || item.physicianAcceptance === filterAcceptance;

    return matchSearch && matchType && matchWard && matchAccept;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHN || !formName || !formDescription) {
      alert('กรุณากรอกข้อมูล HN, ชื่อผู้ป่วย และรายละเอียดปัญหา');
      return;
    }

    const newRecord: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn: formHN,
      patientName: formName,
      age: Number(formAge),
      gender: formGender,
      ward: formWard,
      bed: formBed,
      pharmacistName: formPharmacist,
      activityType: formActivityType,
      drugsInvolved: formDrugs ? formDrugs.split(',').map((s) => s.trim()) : [],
      drpCategory: formDrpCategory,
      medErrorStage: formActivityType === 'MED_ERROR_PREVENTION' ? formMedErrorStage : undefined,
      medErrorSeverity: formActivityType === 'MED_ERROR_PREVENTION' ? (formMedErrorSeverity as any) : undefined,
      description: formDescription,
      recommendation: formRecommendation,
      physicianAcceptance: formAcceptance,
      clinicalOutcome: formOutcome || 'แพทย์รับทราบและปรับแผนการรักษาตามคำแนะนำ',
      costAvoidanceEstimate: Number(formCostAvoidance) || 0,
      syncedToGoogleSheet: false,
    };

    onAddActivity(newRecord);
    setIsModalOpen(false);
    // Reset form
    setFormHN('');
    setFormName('');
    setFormDrugs('');
    setFormDescription('');
    setFormRecommendation('');
    setFormOutcome('');
  };

  // AI helper inside form
  const handleAiRefine = async () => {
    if (!formDescription && !formDrugs) {
      alert('กรุณากรอกชื่อยาหรือรายละเอียดปัญหาก่อนให้ AI ช่วยเกลาข้อเสนอแนะ');
      return;
    }

    setIsAiDrafting(true);
    try {
      const res = await fetch('/api/ai/clinical-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `ช่วยเขียนคำแนะนำของเภสัชกร (Pharmacist Recommendation) สั้นๆ กระชับ ชัดเจน สำหรับสื่อสารกับแพทย์ และผลลัพธ์ทางคลินิกที่คาดหวัง จากปัญหานี้:
ยาที่เกี่ยวข้อง: ${formDrugs}
ปัญหาที่พบ: ${formDescription}
หมวด DRP: ${formDrpCategory}`,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setFormRecommendation(data.result);
        if (!formOutcome) {
          setFormOutcome('แพทย์ยอมรับคำแนะนำ ปรับเปลี่ยนแผนการรักษาเพื่อความปลอดภัยสูงสุดของผู้ป่วย');
        }
      }
    } catch (err) {
      console.error('AI drafting error:', err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Quick toggle acceptance status
  const handleToggleAcceptance = (act: WardActivityRecord) => {
    const nextStatus: Record<PhysicianAcceptance, PhysicianAcceptance> = {
      Pending: 'Accepted',
      Accepted: 'Modified',
      Modified: 'Rejected',
      Rejected: 'Pending',
    };
    const updated = { ...act, physicianAcceptance: nextStatus[act.physicianAcceptance] };
    onUpdateActivity(updated);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvData = convertActivitiesToCSV(filteredActivities);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvData], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PharmCare_Ward_Activities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy TSV for Google Sheets
  const handleCopyForGoogleSheet = () => {
    const tsvData = convertActivitiesToTSV(filteredActivities);
    navigator.clipboard.writeText(tsvData).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            บันทึกกิจกรรมบริบาลบนหอผู้ป่วย (Ward Clinical Interventions)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            บันทึกการค้นหา DRP, ปรับขนาดยา, ดักจับ Medication Error และการให้คำปรึกษาแก่ผู้ป่วยใน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Table to Google Sheet */}
          <button
            id="btn-copy-for-sheets"
            onClick={handleCopyForGoogleSheet}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              copySuccess
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="คัดลอกข้อมูลทั้งหมดเพื่อนำไปกดวาง (Ctrl+V) ลงใน Google Sheet ได้ทันที"
          >
            {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copySuccess ? 'คัดลอกลงคลิปบอร์ดแล้ว!' : 'คัดลอกเพื่อวางใน Google Sheet'}</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          {/* Reset or Clear Data */}
          {onResetToDefault && (
            <button
              id="btn-reset-default-data"
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="รีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>
          )}

          {/* New Record Button */}
          <button
            id="btn-add-activity-modal"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มกิจกรรมใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-activity"
            type="text"
            placeholder="ค้นหา HN, ชื่อผู้ป่วย, ชื่อยา, รายละเอียด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Activity Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="filter-activity-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">ประเภทกิจกรรม: ทั้งหมด</option>
            <option value="DRP_INTERVENTION">การแก้ไข DRP</option>
            <option value="DOSE_ADJUSTMENT">การปรับขนาดยา (Renal/Hepatic)</option>
            <option value="MED_ERROR_PREVENTION">ดักจับ Medication Error (Near-Miss)</option>
            <option value="SPECIAL_TECHNIQUE">สอนใช้ยาเทคนิคพิเศษ</option>
            <option value="DISCHARGE_COUNSELING">ส่งมอบยา Discharge</option>
            <option value="STORAGE_HAD_AUDIT">ตรวจจัดเก็บยา &amp; HAD</option>
          </select>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="filter-activity-ward"
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">หอผู้ป่วย: ทั้งหมด</option>
            {HOSPITAL_WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Acceptance Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="filter-activity-acceptance"
            value={filterAcceptance}
            onChange={(e) => setFilterAcceptance(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">ผลการยอมรับ: ทั้งหมด</option>
            <option value="Accepted">Accepted (ยอมรับ)</option>
            <option value="Modified">Modified (ปรับเปลี่ยน)</option>
            <option value="Rejected">Rejected (ปฏิเสธ)</option>
            <option value="Pending">Pending (รอแพทย์)</option>
          </select>
        </div>
      </div>

      {/* Activities Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">วันที่ / HN</th>
                <th className="py-3.5 px-4">ผู้ป่วย &amp; หอผู้ป่วย</th>
                <th className="py-3.5 px-4">ประเภท &amp; ยาที่เกี่ยวข้อง</th>
                <th className="py-3.5 px-4">รายละเอียดปัญหา &amp; ข้อเสนอแนะ</th>
                <th className="py-3.5 px-4 text-center">การยอมรับของแพทย์</th>
                <th className="py-3.5 px-4 text-right">ประหยัดงบ (฿)</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const acceptanceStyles = {
                    Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Modified: 'bg-blue-50 text-blue-700 border-blue-200',
                    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  };

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date & HN */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-slate-900 block font-mono text-xs">{act.hn}</span>
                        <span className="text-[11px] text-slate-500 block">{act.date}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{act.id}</span>
                      </td>

                      {/* Patient & Ward */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">{act.patientName}</div>
                        <div className="text-xs text-slate-500">
                          {act.age} ปี ({act.gender}) • เตียง {act.bed}
                        </div>
                        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                          {act.ward}
                        </span>
                      </td>

                      {/* Activity Type & Drugs */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            act.activityType === 'DOSE_ADJUSTMENT'
                              ? 'bg-blue-100 text-blue-800'
                              : act.activityType === 'DRP_INTERVENTION'
                              ? 'bg-purple-100 text-purple-800'
                              : act.activityType === 'MED_ERROR_PREVENTION'
                              ? 'bg-amber-100 text-amber-800'
                              : act.activityType === 'SPECIAL_TECHNIQUE'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {act.activityType}
                        </span>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {act.drugsInvolved.map((d, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        {act.drpCategory && (
                          <div className="text-[10px] text-purple-700 font-medium mt-1">
                            {act.drpCategory}
                          </div>
                        )}
                      </td>

                      {/* Description & Recommendation */}
                      <td className="py-3.5 px-4 align-top max-w-xs sm:max-w-md">
                        <p className="text-xs text-slate-800 font-medium line-clamp-2">
                          {act.description}
                        </p>
                        <div className="mt-1 p-1.5 bg-emerald-50/70 border border-emerald-100 rounded text-xs text-emerald-900">
                          <span className="font-semibold text-emerald-800">คำแนะนำ: </span>
                          <span className="line-clamp-2">{act.recommendation}</span>
                        </div>
                        {act.clinicalOutcome && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            ผลลัพธ์: {act.clinicalOutcome}
                          </p>
                        )}
                      </td>

                      {/* Acceptance status button */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <button
                          onClick={() => handleToggleAcceptance(act)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-transform active:scale-95 cursor-pointer ${
                            acceptanceStyles[act.physicianAcceptance]
                          }`}
                          title="คลิกเพื่อเปลี่ยนสถานะการยอมรับ"
                        >
                          {act.physicianAcceptance === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {act.physicianAcceptance === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {act.physicianAcceptance === 'Modified' && <AlertCircle className="w-3.5 h-3.5 text-blue-600" />}
                          {act.physicianAcceptance === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{act.physicianAcceptance}</span>
                        </button>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          {act.pharmacistName.split(' ')[0]}
                        </span>
                      </td>

                      {/* Cost Avoidance */}
                      <td className="py-3.5 px-4 align-top text-right font-mono font-semibold text-emerald-700">
                        ฿{(act.costAvoidanceEstimate || 0).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <button
                          type="button"
                          onClick={() => setActivityToDelete(act)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบรายการกิจกรรมตามเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-lg text-slate-900">
                  บันทึกกิจกรรมบริบาลเภสัชกรรม (Ward Intervention)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Row 1: Patient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    HN ผู้ป่วย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 5842109"
                    value={formHN}
                    onChange={(e) => setFormHN(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายสมชาย วัฒนากุล"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">อายุ (ปี)</label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">เพศ</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as any)}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Ward & Bed & Pharmacist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">หอผู้ป่วย</label>
                  <select
                    value={formWard}
                    onChange={(e) => setFormWard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {HOSPITAL_WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เตียง</label>
                  <input
                    type="text"
                    placeholder="เช่น 04"
                    value={formBed}
                    onChange={(e) => setFormBed(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">เภสัชกรผู้บันทึก</label>
                  <input
                    type="text"
                    value={formPharmacist}
                    onChange={(e) => setFormPharmacist(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Row 3: Activity Type & Drugs Involved */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ประเภทกิจกรรม</label>
                  <select
                    value={formActivityType}
                    onChange={(e) => setFormActivityType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="DRP_INTERVENTION">การแก้ไขปัญหาจากการใช้ยา (DRP)</option>
                    <option value="DOSE_ADJUSTMENT">การปรับขนาดยา (Renal/Hepatic)</option>
                    <option value="MED_ERROR_PREVENTION">ดักจับความคลาดเคลื่อนทางยา (Near-Miss)</option>
                    <option value="SPECIAL_TECHNIQUE">ให้คำปรึกษาการใช้ยาเทคนิคพิเศษ</option>
                    <option value="DISCHARGE_COUNSELING">ส่งมอบยาและบริบาลก่อน Discharge</option>
                    <option value="STORAGE_HAD_AUDIT">ตรวจสอบการจัดเก็บยา &amp; HAD บนวอร์ด</option>
                    <option value="ADR_MONITORING">เฝ้าระวังผลข้างเคียง/แพ้ยา (ADR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ยาที่เกี่ยวข้อง (คั่นด้วยจุลภาค)</label>
                  <input
                    type="text"
                    placeholder="เช่น Meropenem, Vancomycin"
                    value={formDrugs}
                    onChange={(e) => setFormDrugs(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Row 4: DRP Category or Med Error Info */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่ DRP (PCNE Classification)</label>
                <select
                  value={formDrpCategory}
                  onChange={(e) => setFormDrpCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {DRP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* If MED ERROR PREVENTED */}
              {formActivityType === 'MED_ERROR_PREVENTION' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block text-amber-900 font-semibold mb-1">ขั้นตอนที่พบ Error</label>
                    <select
                      value={formMedErrorStage}
                      onChange={(e) => setFormMedErrorStage(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white"
                    >
                      <option value="Prescribing">Prescribing (สั่งใช้ยา)</option>
                      <option value="Transcribing">Transcribing (คัดลอกคำสั่ง)</option>
                      <option value="Dispensing">Dispensing (จัดจ่ายยา)</option>
                      <option value="Administration">Administration (บริหารยา)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-amber-900 font-semibold mb-1">ระดับความรุนแรง (NCC MERP)</label>
                    <select
                      value={formMedErrorSeverity}
                      onChange={(e) => setFormMedErrorSeverity(e.target.value)}
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white"
                    >
                      <option value="B: เกิดแต่ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)">
                        B: ดักได้ก่อนถึงตัวผู้ป่วย (Near Miss)
                      </option>
                      <option value="C: ถึงตัวผู้ป่วยแต่ไม่เกิดอันตราย">C: ถึงตัวผู้ป่วยแต่ไม่เกิดอันตราย</option>
                      <option value="D: ต้องติดตามเฝ้าระวัง">D: ต้องติดตามเฝ้าระวัง</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Row 5: Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  รายละเอียดปัญหาทางคลินิก (Clinical Issue) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ผู้ป่วย CrCl 24 ml/min แพทย์สั่ง Meropenem 1g q 8h ซึ่งเกินขนาดยาตามหน้าที่ไต..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Row 6: Recommendation with AI Assistant */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    คำแนะนำของเภสัชกร (Pharmacist Recommendation)
                  </label>
                  <button
                    type="button"
                    onClick={handleAiRefine}
                    disabled={isAiDrafting}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAiDrafting ? 'AI กำลังร่างข้อเสนอแนะ...' : 'ให้ AI ช่วยเกลาข้อเสนอแนะ'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="เช่น เสนอปรับลดขนาดยาเป็น Meropenem 500 mg q 12h IV..."
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Row 7: Acceptance, Outcome, Cost Avoidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">การยอมรับของแพทย์</label>
                  <select
                    value={formAcceptance}
                    onChange={(e) => setFormAcceptance(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Accepted">Accepted (แพทย์ยอมรับ)</option>
                    <option value="Modified">Modified (ยอมรับแบบปรับปรุง)</option>
                    <option value="Rejected">Rejected (แพทย์ปฏิเสธ)</option>
                    <option value="Pending">Pending (รอติดตามผล)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ผลลัพธ์ทางคลินิก (Outcome)</label>
                  <input
                    type="text"
                    placeholder="เช่น ปรับยาแล้ว ไม่เกิดพิษต่อไต"
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ประมาณการลดค่าใช้จ่าย (บาท)</label>
                  <input
                    type="number"
                    value={formCostAvoidance}
                    onChange={(e) => setFormCostAvoidance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  บันทึกกิจกรรมลงระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-App Modal, prevents iframe window.confirm issues) */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">ยืนยันการลบรายการกิจกรรม?</h3>
                <p className="text-xs text-slate-500">รหัสรายการ: {activityToDelete.id}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-1.5 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900">ผู้ป่วย: </span>
                <span>{activityToDelete.patientName} (HN: {activityToDelete.hn})</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">หอผู้ป่วย: </span>
                <span>{activityToDelete.ward} เตียง {activityToDelete.bed}</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">ปัญหา: </span>
                <span className="line-clamp-2 text-slate-600">{activityToDelete.description}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteActivity(activityToDelete.id);
                  setActivityToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบรายการ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Mock Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">รีเซ็ตข้อมูลกิจกรรม?</h3>
                <p className="text-xs text-slate-500">คืนค่าตัวอย่างเริ่มต้นของระบบ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              การกระทำนี้จะล้างรายการปัจจุบันในเครื่องและโหลดข้อมูลตัวอย่างเริ่มต้น (Initial Mock Data) กลับคืนมา เพื่อให้พร้อมสำหรับการทดสอบและสาธิตระบบ
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {onClearAllData && (
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  ล้างข้อมูลทั้งหมดให้ว่างเปล่า
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onResetToDefault) onResetToDefault();
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>รีเซ็ตข้อมูลตัวอย่าง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
