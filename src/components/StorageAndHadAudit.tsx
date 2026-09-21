import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  ShieldAlert, 
  ThermometerSnowflake, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Building, 
  Check, 
  X, 
  Clock, 
  Sparkles,
  Lock,
  EyeOff,
  CalendarCheck,
  Trash2
} from 'lucide-react';
import { WardStorageAudit, WardActivityRecord } from '../types';
import { HOSPITAL_WARDS } from '../data/initialData';

interface StorageAndHadAuditProps {
  audits: WardStorageAudit[];
  onAddAudit: (audit: WardStorageAudit) => void;
  onAddActivity: (record: WardActivityRecord) => void;
  onDeleteAudit?: (id: string) => void;
}

export const StorageAndHadAudit: React.FC<StorageAndHadAuditProps> = ({
  audits,
  onAddAudit,
  onAddActivity,
  onDeleteAudit,
}) => {
  const [selectedWard, setSelectedWard] = useState(HOSPITAL_WARDS[0]);
  const [inspector, setInspector] = useState('ภก. ธนกร พึ่งสุข (BCPS)');
  const [fridgeMin, setFridgeMin] = useState<number>(3.5);
  const [fridgeMax, setFridgeMax] = useState<number>(6.5);
  const [hadChecked, setHadChecked] = useState(true);
  const [lasaChecked, setLasaChecked] = useState(true);
  const [lightChecked, setLightChecked] = useState(true);
  const [expiredCount, setExpiredCount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isAiAdvising, setIsAiAdvising] = useState(false);
  const [aiStorageAdvice, setAiStorageAdvice] = useState<string | null>(null);
  const [auditToDelete, setAuditToDelete] = useState<WardStorageAudit | null>(null);

  const isTempPass = fridgeMin >= 2.0 && fridgeMax <= 8.0;

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();

    let status: 'ผ่านเกณฑ์ 100%' | 'พบข้อบกพร่องแก้ไขทันที' | 'ต้องปรับปรุง' = 'ผ่านเกณฑ์ 100%';
    if (!isTempPass || !hadChecked || !lasaChecked || !lightChecked || expiredCount > 0) {
      status = (!isTempPass && fridgeMax > 10) || expiredCount > 2 ? 'ต้องปรับปรุง' : 'พบข้อบกพร่องแก้ไขทันที';
    }

    const newAudit: WardStorageAudit = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      ward: selectedWard,
      inspector,
      fridgeTempMin: Number(fridgeMin),
      fridgeTempMax: Number(fridgeMax),
      isTempPass,
      hadStoragePassed: hadChecked,
      lasaStoragePassed: lasaChecked,
      lightSensitivePassed: lightChecked,
      expiredCount: Number(expiredCount),
      status,
      correctiveNotes: notes || (status === 'ผ่านเกณฑ์ 100%' ? 'การจัดเก็บยาได้มาตรฐานสมบูรณ์' : 'แก้ไขข้อบกพร่องร่วมกับหัวหน้าหอผู้ป่วยเรียบร้อย'),
      syncedToGoogleSheet: false,
    };

    onAddAudit(newAudit);

    // Also log as a ward activity for unified executive dashboard reporting
    const newActivity: WardActivityRecord = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hn: 'W-AUDIT',
      patientName: `การตรวจสอบคลังยา: ${selectedWard}`,
      age: 0,
      gender: 'อื่นๆ',
      ward: selectedWard,
      bed: 'Stock',
      pharmacistName: inspector,
      activityType: 'STORAGE_HAD_AUDIT',
      drugsInvolved: ['High Alert Drugs (HAD)', 'Cold Chain Vaccines/Insulin'],
      description: `ตรวจสอบตู้เย็น Min: ${fridgeMin}°C, Max: ${fridgeMax}°C (ผ่าน: ${isTempPass ? 'ใช่' : 'ไม่'}), HAD: ${hadChecked ? 'ผ่าน' : 'ไม่ผ่าน'}, LASA: ${lasaChecked ? 'ผ่าน' : 'ไม่ผ่าน'}`,
      recommendation: notes || 'ปฏิบัติตามมาตรฐานการจัดเก็บยาความเสี่ยงสูงและการรักษาอุณหภูมิ 2-8°C อย่างเคร่งครัด',
      physicianAcceptance: 'Accepted',
      clinicalOutcome: status === 'ผ่านเกณฑ์ 100%' ? 'มาตรฐานความปลอดภัยยาบนหอผู้ป่วยระดับดีเยี่ยม' : 'แก้ไขข้อบกพร่องทันท่วงที ป้องกันยาเสื่อมสภาพ',
      costAvoidanceEstimate: status === 'ผ่านเกณฑ์ 100%' ? 5000 : 25000,
      syncedToGoogleSheet: false,
    };
    onAddActivity(newActivity);

    alert(`บันทึกผลการตรวจสอบการจัดเก็บยาของ ${selectedWard} เรียบร้อย! ข้อมูลอัปเดตลง Dashboard ทันที`);
    setNotes('');
  };

  const handleConsultAIStorage = async () => {
    setIsAiAdvising(true);
    try {
      const res = await fetch('/api/ai/clinical-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `ให้คำแนะนำมาตรฐานการจัดเก็บยาในโรงพยาบาล:
1. หากอุณหภูมิตู้เย็นยาหลุดช่วง (Temperature Excursion เช่น ขึ้นไปแตะ ${fridgeMax}°C หรือต่ำกว่า 2°C) เภสัชกรต้องมีแนวทางปฏิบัติ (Action plan) อย่างไร?
2. มาตรการควบคุม High Alert Drugs (เช่น KCl injection, Norepinephrine, Heparin) บนหอผู้ป่วยเพื่อไม่ให้เกิด Medication error ร้ายแรง
3. ยาชื่อพ้องมองคล้าย (LASA) และยาไวต่อแสง`,
        }),
      });
      const data = await res.json();
      setAiStorageAdvice(data.result);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเรียกคำแนะนำ AI');
    } finally {
      setIsAiAdvising(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-rose-100 text-rose-800 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            การตรวจสอบการจัดเก็บยา &amp; ยาความเสี่ยงสูง (Storage &amp; High Alert Drugs Audit)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          บันทึกตรวจสอบอุณหภูมิตู้เย็น 2-8°C, การแยกเก็บยาความเสี่ยงสูง (HAD), ยา LASA, ยาไวต่อแสง และยาหมดอายุบนหอผู้ป่วยตามมาตรฐาน HA / JCI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleCreateAudit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                แบบบันทึกการตรวจสอบประจำวัน/สัปดาห์
              </h2>
              <span className="text-xs text-slate-400">หอผู้ป่วย</span>
            </div>

            {/* Ward & Inspector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">หอผู้ป่วย</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  {HOSPITAL_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">เภสัชกรผู้ตรวจ</label>
                <input
                  type="text"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg font-medium"
                />
              </div>
            </div>

            {/* Refrigerator Temperature (2-8°C) */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                  อุณหภูมิตู้เย็นยา (เกณฑ์ 2.0 - 8.0 °C)
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isTempPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                  }`}
                >
                  {isTempPass ? 'อยู่ในเกณฑ์ปกติ' : 'อุณหภูมิหลุดเกณฑ์!'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-medium mb-1">อุณหภูมิต่ำสุด (Min °C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fridgeMin}
                    onChange={(e) => setFridgeMin(Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 border rounded-lg font-mono font-bold ${
                      fridgeMin < 2 ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-medium mb-1">อุณหภูมิสูงสุด (Max °C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fridgeMax}
                    onChange={(e) => setFridgeMax(Number(e.target.value))}
                    className={`w-full px-2.5 py-1.5 border rounded-lg font-mono font-bold ${
                      fridgeMax > 8 ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Quality Checklist */}
            <div className="space-y-2 pt-1">
              <label className="block text-slate-700 font-semibold text-xs">รายการตรวจสอบมาตรฐาน:</label>

              {/* HAD Check */}
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={hadChecked}
                  onChange={(e) => setHadChecked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">ยาความเสี่ยงสูง (HAD): </span>
                  <span className="text-slate-600">แยกเก็บเฉพาะ มีป้ายเตือนสีส้ม-แดงชัดเจน มีกุญแจล็อค</span>
                </div>
              </label>

              {/* LASA Check */}
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={lasaChecked}
                  onChange={(e) => setLasaChecked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">ยาชื่อพ้องมองคล้าย (LASA): </span>
                  <span className="text-slate-600">แยกช่องวาง มีป้าย Tall-Man ไม่วางติดกัน</span>
                </div>
              </label>

              {/* Light Sensitive */}
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={lightChecked}
                  onChange={(e) => setLightChecked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">ยาไวต่อแสง (Light-Sensitive): </span>
                  <span className="text-slate-600">ใส่ซองชาหรือกล่องทึบแสงมิดชิด</span>
                </div>
              </label>
            </div>

            {/* Expired Count */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                จำนวนยาหมดอายุหรือใกล้หมดอายุที่ตรวจพบ (รายการ)
              </label>
              <input
                type="number"
                value={expiredCount}
                onChange={(e) => setExpiredCount(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 border rounded-lg font-mono font-bold ${
                  expiredCount > 0 ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'
                }`}
              />
            </div>

            {/* Corrective Notes */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                ข้อเสนอแนะการแก้ไข / บันทึกเพิ่มเติม
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น แจ้งช่างปรับตู้เย็น, ย้ายช่องยา LASA..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกผลการตรวจสอบคลังยาลงระบบ</span>
            </button>
          </form>
        </div>

        {/* Audit Log Table & AI Storage Advisor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* History Audits */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">ประวัติการตรวจสอบคลังยาบนหอผู้ป่วย</h2>
              <span className="text-xs text-slate-500 font-semibold">ล่าสุด {audits.length} ครั้ง</span>
            </div>

            <div className="mt-3 space-y-3">
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{audit.ward}</span>
                      <span className="text-[11px] text-slate-500 block">วันที่: {audit.date} • ตรวจโดย: {audit.inspector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          audit.status === 'ผ่านเกณฑ์ 100%'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {audit.status}
                      </span>
                      {onDeleteAudit && (
                        <button
                          type="button"
                          onClick={() => setAuditToDelete(audit)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ลบรายงานการตรวจนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">ตู้เย็น Min-Max</span>
                      <span className={`font-mono font-bold ${audit.isTempPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {audit.fridgeTempMin}° - {audit.fridgeTempMax}°C
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">ยา HAD</span>
                      <span className={`font-semibold ${audit.hadStoragePassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {audit.hadStoragePassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">ยา LASA</span>
                      <span className={`font-semibold ${audit.lasaStoragePassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {audit.lasaStoragePassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">ยาหมดอายุ</span>
                      <span className={`font-semibold ${audit.expiredCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {audit.expiredCount} รายการ
                      </span>
                    </div>
                  </div>

                  {audit.correctiveNotes && (
                    <p className="text-slate-600 pt-1 text-[11px] italic">
                      หมายเหตุ: {audit.correctiveNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Storage Guidelines Consult */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                AI ที่ปรึกษามาตรฐานการจัดเก็บยา &amp; HAD
              </h2>
              <button
                onClick={handleConsultAIStorage}
                disabled={isAiAdvising}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold border border-emerald-200 transition-colors cursor-pointer"
              >
                {isAiAdvising ? 'กำลังดึงคู่มือมาตรฐาน...' : 'ขอแนวทางจัดการอุณหภูมิหลุดเกณฑ์ & HAD'}
              </button>
            </div>

            {aiStorageAdvice ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed max-h-72 overflow-y-auto">
                <div className="markdown-content">
                  <Markdown>{aiStorageAdvice}</Markdown>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                กดปุ่มด้านบนเพื่อขอแนวทางปฏิบัติเมื่ออุณหภูมิตู้เย็นยาหลุดช่วง (Cold-chain excursion) หรือมาตรการความปลอดภัยยา High Alert Drugs บนหอผู้ป่วย
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Audit Item */}
      {auditToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">ยืนยันการลบผลการตรวจสอบ?</h3>
                <p className="text-xs text-slate-500">รหัสรายการ: {auditToDelete.id}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-1.5 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900">หอผู้ป่วย: </span>
                <span>{auditToDelete.ward}</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">วันที่ตรวจ: </span>
                <span>{auditToDelete.date} (ผู้ตรวจ: {auditToDelete.inspector})</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">สถานะ: </span>
                <span>{auditToDelete.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAuditToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAudit) {
                    onDeleteAudit(auditToDelete.id);
                  }
                  setAuditToDelete(null);
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
    </div>
  );
};
