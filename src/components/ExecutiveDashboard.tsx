import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Building2, 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Mail,
  Bell,
  X,
  CheckCircle2,
  Lock,
  Send
} from 'lucide-react';
import { WardActivityRecord, WardStorageAudit } from '../types';
import { HOSPITAL_WARDS } from '../data/initialData';
import { ADMIN_EMAIL } from '../utils/auth';
import { getStoredNotificationLogs, dispatchAdminNotification, EmailNotificationLog } from '../utils/notificationService';

interface ExecutiveDashboardProps {
  activities: WardActivityRecord[];
  storageAudits: WardStorageAudit[];
  onOpenGoogleSheetTab: () => void;
  currentUserEmail?: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  activities,
  storageAudits,
  onOpenGoogleSheetTab,
  currentUserEmail = ADMIN_EMAIL,
}) => {
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifLogs, setNotifLogs] = useState<EmailNotificationLog[]>([]);
  const [isSendingTestNotif, setIsSendingTestNotif] = useState(false);
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotifLogs(getStoredNotificationLogs());
  }, [showNotifModal]);

  const handleSendTestNotification = async () => {
    setIsSendingTestNotif(true);
    setTestAlertMessage(null);
    try {
      const mockRecord = {
        hn: 'TEST-999999',
        patientName: 'ทดสอบระบบแจ้งเตือนอีเมล (Test Alert)',
        ward: 'หอผู้ป่วยอายุรกรรม',
        bed: '01',
        activityType: 'DOSE_ADJUSTMENT',
        drugsInvolved: ['Meropenem 1g q 8h -> 500mg q 12h (CrCl 24 mL/min)'],
        description: 'ทดสอบการส่งอีเมลแจ้งเตือนอัตโนมัติมายัง satarat24@gmail.com ตามนโยบายการเฝ้าระวังผู้ป่วย',
        recommendation: 'ระบบส่งอีเมลแจ้งเตือนทำงานได้สมบูรณ์',
        physicianAcceptance: 'Accepted',
        costAvoidanceEstimate: 4500,
        pharmacistName: 'ภก. ธนกร พึ่งสุข (BCPS)',
      };

      const result = await dispatchAdminNotification('NEW_ACTIVITY', mockRecord);
      setNotifLogs(getStoredNotificationLogs());
      setTestAlertMessage('ส่งอีเมลแจ้งเตือนทดสอบไปยัง satarat24@gmail.com สำเร็จเรียบร้อยแล้ว!');
    } catch (err: any) {
      setTestAlertMessage('เกิดข้อผิดพลาดในการส่งอีเมลทดสอบ: ' + (err.message || ''));
    } finally {
      setIsSendingTestNotif(false);
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchWard = selectedWard === 'all' || act.ward === selectedWard;
      if (!matchWard) return false;
      if (selectedDateFilter === 'all') return true;
      if (selectedDateFilter === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return act.date === todayStr;
      }
      if (selectedDateFilter === 'week') {
        const d = new Date(act.timestamp);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      return true;
    });
  }, [activities, selectedWard, selectedDateFilter]);

  // Calculations for Executive KPIs
  const totalInterventions = filteredActivities.length;

  const acceptedCount = filteredActivities.filter(a => a.physicianAcceptance === 'Accepted').length;
  const modifiedCount = filteredActivities.filter(a => a.physicianAcceptance === 'Modified').length;
  const rejectedCount = filteredActivities.filter(a => a.physicianAcceptance === 'Rejected').length;
  const pendingCount = filteredActivities.filter(a => a.physicianAcceptance === 'Pending').length;

  const totalDecided = acceptedCount + modifiedCount + rejectedCount;
  const acceptanceRate = totalDecided > 0 
    ? Math.round(((acceptedCount + modifiedCount) / totalDecided) * 1000) / 10 
    : 100;

  // Medication Errors Prevented (Near-Misses)
  const nearMissErrors = filteredActivities.filter(a => 
    a.activityType === 'MED_ERROR_PREVENTION' || 
    (a.medErrorSeverity && a.medErrorSeverity.includes('Near Miss'))
  );
  const totalNearMissCount = nearMissErrors.length;

  // Total Cost Avoidance
  const totalCostAvoidance = filteredActivities.reduce((acc, curr) => acc + (curr.costAvoidanceEstimate || 0), 0);

  // Storage Compliance Rate
  const totalAudits = storageAudits.length;
  const passedAudits = storageAudits.filter(a => a.status === 'ผ่านเกณฑ์ 100%').length;
  const storageComplianceRate = totalAudits > 0 
    ? Math.round((passedAudits / totalAudits) * 1000) / 10 
    : 100;

  // Discharge Counseling Count
  const dischargeCounselingCount = filteredActivities.filter(a => a.activityType === 'DISCHARGE_COUNSELING').length;

  // Special Device Count
  const specialDeviceCount = filteredActivities.filter(a => a.activityType === 'SPECIAL_TECHNIQUE').length;

  // DRP Breakdown
  const drpCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredActivities.forEach(a => {
      if (a.drpCategory) {
        // extract short label
        const short = a.drpCategory.split(' ')[0] + ' ' + a.drpCategory.split(' ')[1];
        counts[short] = (counts[short] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredActivities]);

  // Ward Breakdown
  const wardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredActivities.forEach(a => {
      counts[a.ward] = (counts[a.ward] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredActivities]);

  // Med Error Stage Breakdown
  const errorStageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Prescribing: 0,
      Transcribing: 0,
      Dispensing: 0,
      Administration: 0,
    };
    filteredActivities.forEach(a => {
      if (a.medErrorStage && counts[a.medErrorStage] !== undefined) {
        counts[a.medErrorStage]++;
      }
    });
    return counts;
  }, [filteredActivities]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Executive Clinical Dashboard
            </h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Real-Time
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            สรุปผลการดำเนินงานเภสัชกรรมบริบาล ความปลอดภัยด้านยา (Medication Safety) และการลดค่าใช้จ่าย
          </p>
        </div>

        {/* Filters and Print */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {/* Ward filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              id="filter-dashboard-ward"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกหอผู้ป่วย (Hospital Wide)</option>
              {HOSPITAL_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Time filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              id="filter-dashboard-date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">ข้อมูลทั้งหมด (All Time)</option>
              <option value="today">วันนี้ (Today)</option>
              <option value="week">7 วันล่าสุด (Past 7 Days)</option>
            </select>
          </div>

          {/* Print Report */}
          <button
            id="btn-print-executive-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงานผู้บริหาร</span>
          </button>

          {/* Google Sheet Direct Link */}
          <button
            id="btn-dash-to-sheets"
            onClick={onOpenGoogleSheetTab}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheet</span>
          </button>
        </div>
      </div>

      {/* Admin Privilege & Real-time Notification Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-4 rounded-2xl border border-slate-700/50 shadow-md text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                สิทธิ์ผู้บริหารสูงสุด (Restricted Admin):
              </span>
              <span className="font-mono text-xs font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                {ADMIN_EMAIL}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Authorized Executive
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              เปิดใช้งานการแจ้งเตือนอัตโนมัติ: ทุกครั้งที่มีการ Add ข้อมูลบนหอผู้ป่วย ระบบจะส่งอีเมลแจ้งเตือนมายัง <strong className="text-white font-mono">{ADMIN_EMAIL}</strong> ทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>ประวัติแจ้งเตือนเมล ({notifLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={isSendingTestNotif}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="ทดสอบส่งอีเมลแจ้งเตือนจำลองมายัง satarat24@gmail.com"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTestNotif ? 'กำลังส่ง...' : 'ทดสอบส่งเมล'}</span>
          </button>
        </div>
      </div>

      {testAlertMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testAlertMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestAlertMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top 4 Primary Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Interventions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              กิจกรรมบริบาลทั้งหมด
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalInterventions}
            </span>
            <span className="text-xs text-slate-500 font-medium">ครั้ง</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">ตอบรับแล้ว: {acceptedCount} ครั้ง</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> ปกป้องผู้ป่วย
            </span>
          </div>
        </div>

        {/* KPI 2: Physician Acceptance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              อัตราการยอมรับของแพทย์
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {acceptanceRate}%
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              เป้าหมาย &gt;90%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>ยอมรับ: {acceptedCount}</span>
            <span>ปรับปรุง: {modifiedCount}</span>
            <span>ปฏิเสธ: {rejectedCount}</span>
          </div>
        </div>

        {/* KPI 3: Near-Miss Errors Prevented */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ดักจับความคลาดเคลื่อน (Near-Miss)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {totalNearMissCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">เหตุการณ์ก่อนถึงตัวผู้ป่วย</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Prescribing: {errorStageCounts.Prescribing}</span>
            <span>Transcribing: {errorStageCounts.Transcribing}</span>
            <span>Dispensing: {errorStageCounts.Dispensing}</span>
          </div>
        </div>

        {/* KPI 4: Cost Avoidance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              มูลค่าความปลอดภัย &amp; ประหยัดงบ
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">
              ฿{totalCostAvoidance.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>ลดวันนอน &amp; ป้องกัน ADR รุนแรง</span>
            <span className="text-purple-600 font-medium">Cost Avoidance</span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">ความถูกต้องจัดเก็บยา &amp; ตู้เย็น 2-8°C</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{storageComplianceRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">ผ่านเกณฑ์ {passedAudits} จาก {totalAudits} หอผู้ป่วย</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">บริบาลส่งมอบยาก่อน Discharge</p>
            <p className="text-2xl font-bold mt-1 text-teal-400">{dischargeCounselingCount} ราย</p>
            <p className="text-xs text-slate-400 mt-0.5">Reconciliation &amp; Home Med Plan ครบถ้วน</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl text-teal-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">สอนเทคนิคพิเศษ (Inhaler / Insulin)</p>
            <p className="text-2xl font-bold mt-1 text-sky-400">{specialDeviceCount} ครั้ง</p>
            <p className="text-xs text-slate-400 mt-0.5">Teach-back ประเมินผล 100% ถูกต้อง</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl text-sky-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: DRP Breakdown (PCNE) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                ปัญหาจากการใช้ยา (DRP Categories)
              </h2>
              <p className="text-xs text-slate-500">จำแนกตามมาตรฐาน PCNE classification</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
              Top Categories
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {drpCounts.length > 0 ? (
              drpCounts.map(([name, count]) => {
                const pct = Math.round((count / totalInterventions) * 100) || 0;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate pr-2">{name}</span>
                      <span className="font-semibold text-slate-900">{count} ราย ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-sm text-slate-400">ไม่มีข้อมูล DRP ในตัวกรองปัจจุบัน</p>
            )}
          </div>
        </div>

        {/* Chart 2: Interventions by Ward */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                การให้บริการแยกตามหอผู้ป่วย (Ward Breakdown)
              </h2>
              <p className="text-xs text-slate-500">ปริมาณงานบริบาลเภสัชกรรมเชิงรุกในแต่ละ Ward</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
              Wards
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {wardCounts.length > 0 ? (
              wardCounts.map(([wardName, count]) => {
                const maxCount = wardCounts[0][1] || 1;
                const barWidth = Math.round((count / maxCount) * 100);
                return (
                  <div key={wardName} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{wardName}</span>
                      <span className="font-semibold text-slate-900">{count} ครั้ง</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(barWidth, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-sm text-slate-400">ไม่มีข้อมูล Ward ในตัวกรอง</p>
            )}
          </div>
        </div>
      </div>

      {/* Medication Safety & Error Interception Pipeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              ห่วงโซ่การดักจับความคลาดเคลื่อนทางยา (Medication Error Interception)
            </h2>
            <p className="text-xs text-slate-500">
              จุดที่เภสัชกรตรวจพบและยับยั้งก่อนถึงตัวผู้ป่วย (Prescribing, Transcribing, Dispensing, Administration)
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
            ระบบป้องกันความเสี่ยง (Safety Net)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">1. สั่งใช้ยา (Prescribing)</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-2">{errorStageCounts.Prescribing}</p>
            <p className="text-xs text-slate-500 mt-1">ปรับขนาดยา / DRP / ยาตีกัน</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">2. คัดลอกคำสั่ง (Transcribing)</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-2">{errorStageCounts.Transcribing}</p>
            <p className="text-xs text-slate-500 mt-1">คำสั่งยาตกหล่น / ซ้ำซ้อน</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">3. จัดจ่ายยา (Dispensing)</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-2">{errorStageCounts.Dispensing}</p>
            <p className="text-xs text-slate-500 mt-1">ยา LASA / ฉลากยา / ยา HAD</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase">4. บริหารยา (Administration)</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-2">{errorStageCounts.Administration}</p>
            <p className="text-xs text-slate-500 mt-1">วิธีบริหาร / สอนเทคนิคพิเศษ</p>
          </div>
        </div>
      </div>

      {/* Executive Brief & Clinical Insights Box */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-bold">
            บทสรุปเชิงบริหารสำหรับผู้อำนวยการและหัวหน้ากลุ่มงาน (Executive Summary)
          </h3>
        </div>
        <div className="mt-3 text-sm text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong>ประสิทธิภาพการบริบาล:</strong> เภสัชกรประจำหอผู้ป่วยได้ร่วมดูแลรักษาผู้ป่วยใน ให้บริการบริบาลเภสัชกรรมเชิงรุกรวม{' '}
            <span className="text-emerald-400 font-bold">{totalInterventions} ครั้ง</span> โดยมีอัตราการยอมรับคำแนะนำของแพทย์สูงถึง{' '}
            <span className="text-emerald-400 font-bold">{acceptanceRate}%</span> ซึ่งสะท้อนถึงความเชื่อมั่นและการทำงานเป็นทีมสหสาขาวิชาชีพที่เข้มแข็ง
          </p>
          <p>
            • <strong>ความปลอดภัยผู้ป่วย (Patient Safety):</strong> สามารถดักจับความคลาดเคลื่อนทางยาในระดับ Near-Miss ได้ถึง{' '}
            <span className="text-amber-400 font-bold">{totalNearMissCount} เหตุการณ์</span> โดยเฉพาะในขั้นตอนการสั่งใช้ยา (Prescribing) การปรับขนาดยาปฏิชีวนะตามการทำงานของไต และการป้องกันอันตรกิริยาระหว่างยา (Drug-Drug Interactions)
          </p>
          <p>
            • <strong>ความคุ้มค่าทางเศรษฐศาสตร์สาธารณสุข:</strong> กิจกรรมบริบาลสามารถป้องกันภาวะแทรกซ้อน การนอนโรงพยาบาลซ้ำ และลดค่าใช้จ่ายทางยาคิดเป็นมูลค่ารวมประมาณ{' '}
            <span className="text-emerald-400 font-bold">฿{totalCostAvoidance.toLocaleString()} บาท</span>
          </p>
          <p>
            • <strong>มาตรฐานการจัดเก็บยา &amp; HAD:</strong> การตรวจสอบตู้เย็นควบคุมอุณหภูมิ 2-8°C และยาความเสี่ยงสูง (High Alert Drugs) บนหอผู้ป่วยผ่านเกณฑ์{' '}
            <span className="text-teal-300 font-bold">{storageComplianceRate}%</span> ตามมาตรฐาน HA/JCI
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>ระบบประมวลผลข้อมูลแบบ Real-time เชื่อมโยงฐานข้อมูลหอผู้ป่วยและ Google Sheet</span>
          <span>กลุ่มงานเภสัชกรรม โรงพยาบาล</span>
        </div>
      </div>

      {/* Email Notifications History Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    ประวัติการแจ้งเตือนอีเมลอัตโนมัติ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ผู้รับ: <span className="font-mono font-bold text-emerald-700">{ADMIN_EMAIL}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 text-xs text-slate-600 bg-slate-50 rounded-xl px-4 mt-3 border border-slate-200">
              🔔 <strong>นโยบาย Real-time Alert:</strong> ทุกครั้งที่มีการบันทึกกิจกรรมบริบาลใหม่ (DRP, Dose Adjustment, Near-Miss) หรือผลตรวจตู้เย็น &amp; HAD ระบบจะทำการ Dispatch การแจ้งเตือนมายังกล่องจดหมายของ <strong>{ADMIN_EMAIL}</strong> ทันที
            </div>

            {/* List of Notification Logs */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
              {notifLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <span>ยังไม่มีประวัติการส่งแจ้งเตือนในเซสชันนี้</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    เมื่อมีการเพิ่มกิจกรรมบนหอผู้ป่วย ข้อมูลจะปรากฏที่นี่โดยอัตโนมัติ
                  </p>
                </div>
              ) : (
                notifLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-emerald-300 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.type === 'NEW_ACTIVITY' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.type === 'NEW_ACTIVITY' ? 'กิจกรรมบริบาล' : 'ตรวจตู้เย็น/HAD'}
                        </span>
                        <span className="font-bold text-slate-900">{log.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {log.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400">
                      <span>ส่งไปยัง: <code className="text-slate-700 font-bold">{log.recipient}</code></span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.deliveryChannels.join(' • ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">
                รวมทั้งหมด <strong>{notifLogs.length}</strong> รายการ
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={isSendingTestNotif}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTestNotif ? 'กำลังส่ง...' : 'ส่งเมลทดสอบอีกครั้ง'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
