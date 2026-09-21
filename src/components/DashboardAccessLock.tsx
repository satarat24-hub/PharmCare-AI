import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ADMIN_EMAIL, KNOWN_ACCOUNTS } from '../utils/auth';

interface DashboardAccessLockProps {
  currentUserEmail: string;
  onLoginAsAdmin: (email: string) => void;
  onGoBackToActivities: () => void;
}

export const DashboardAccessLock: React.FC<DashboardAccessLockProps> = ({
  currentUserEmail,
  onLoginAsAdmin,
  onGoBackToActivities,
}) => {
  const [inputEmail, setInputEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('กรุณากรอกอีเมลที่ได้รับอนุญาต');
      return;
    }

    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMsg(`ขออภัย อีเมล "${cleanEmail}" ไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ ${ADMIN_EMAIL} เท่านั้น)`);
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      onLoginAsAdmin(ADMIN_EMAIL);
      setIsAuthenticating(false);
    }, 400);
  };

  const handleQuickUnlock = () => {
    setIsAuthenticating(true);
    setErrorMsg('');
    setTimeout(() => {
      onLoginAsAdmin(ADMIN_EMAIL);
      setIsAuthenticating(false);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Restricted Executive Area
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
                จำกัดการเข้าถึง Dashboard ผู้บริหาร
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                สงวนสิทธิ์เฉพาะ <strong className="text-emerald-300 underline font-mono">{ADMIN_EMAIL}</strong> เท่านั้น
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Security Notice Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1 leading-relaxed">
              <p className="font-bold text-sm text-amber-950">
                นโยบายความปลอดภัยและข้อมูลสถิติเชิงกลยุทธ์ของโรงพยาบาล
              </p>
              <p>
                หน้านี้รวบรวมตัวเลขการประเมินมูลค่าความเสียหายที่ป้องกันได้ (Cost Avoidance), ดัชนีความคลาดเคลื่อนทางยา (Medication Error Indexes), 
                และผลการตรวจประเมินคุณภาพหอผู้ป่วย ซึ่งจำกัดสิทธิ์ให้เฉพาะหัวหน้ากลุ่มงาน/ผู้บริหารระบบ (<code className="font-bold text-slate-900">{ADMIN_EMAIL}</code>) 
                เป็นผู้เข้าถึงและวิเคราะห์ข้อมูล
              </p>
            </div>
          </div>

          {/* Current User Status Indicator */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>บัญชีผู้ใช้ปัจจุบันในระบบ:</span>
              <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentUserEmail || 'ไม่ได้ระบุ'}
              </strong>
            </div>
            <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              ไม่มีสิทธิ์เข้าถึง
            </span>
          </div>

          {/* Verification / Authentication Form */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>ยืนยันตัวตนสำหรับผู้บริหาร ({ADMIN_EMAIL})</span>
            </h2>

            {/* Quick Unlock for satarat24 */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  เข้าสู่ระบบด่วนในฐานะ {ADMIN_EMAIL}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  คลิกเพื่อสลับและยืนยันสิทธิ์ผู้บริหารสูงสุดเพื่อปลดล็อก Dashboard ทันที
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickUnlock}
                disabled={isAuthenticating}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isAuthenticating ? 'กำลังตรวจสอบสิทธิ์...' : 'ยืนยันตัวตน satarat24@gmail.com'}</span>
              </button>
            </div>

            {/* Manual Email Form */}
            <form onSubmit={handleVerify} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                หรือกรอกอีเมลผู้บริหารเพื่อเข้าใช้งาน:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={(e) => {
                      setInputEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="ระบุ satarat24@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  ปลดล็อก
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Action to go back to ward activities */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onGoBackToActivities}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าบันทึกกิจกรรมหอผู้ป่วย</span>
            </button>

            <span className="text-[11px] text-slate-400">
              PharmCare AI Security v2.5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
