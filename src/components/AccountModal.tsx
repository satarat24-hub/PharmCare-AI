import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Lock, 
  Check, 
  Mail, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ADMIN_EMAIL, KNOWN_ACCOUNTS, isAdminEmail } from '../utils/auth';

interface AccountModalProps {
  currentUserEmail: string;
  onSelectEmail: (email: string) => void;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  currentUserEmail,
  onSelectEmail,
  onClose,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setError('กรุณาระบุรูปแบบอีเมลที่ถูกต้อง เช่น satarat24@gmail.com');
      return;
    }
    onSelectEmail(clean);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                จัดการบัญชีผู้ใช้งาน
              </h3>
              <p className="text-xs text-slate-500">
                สิทธิ์การเข้าถึง Dashboard และการแจ้งเตือนอีเมล
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            บัญชีที่กำลังใช้งานปัจจุบัน:
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-slate-900">
              {currentUserEmail}
            </span>
            {isAdminEmail(currentUserEmail) ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                ผู้บริหารสูงสุด
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                <User className="w-3 h-3" />
                เภสัชกรหอผู้ป่วย
              </span>
            )}
          </div>
        </div>

        {/* Security Directive Notice */}
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            ตามข้อกำหนด: หน้า <strong>Dashboard ผู้บริหาร</strong> จำกัดการเข้าถึงเฉพาะ <strong className="font-mono text-slate-900">{ADMIN_EMAIL}</strong> เท่านั้น และทุกครั้งที่มีการ Add ข้อมูล ระบบจะส่งอีเมลแจ้งเตือนมายังอีเมลนี้
          </span>
        </div>

        {/* Quick Select Accounts */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            เลือกสลับบัญชีเพื่อทดสอบระบบ (Quick Switch):
          </label>
          <div className="space-y-1.5">
            {KNOWN_ACCOUNTS.map((acc) => {
              const isSelected = acc.email.toLowerCase() === currentUserEmail.toLowerCase();
              const isAdmin = acc.role === 'ADMIN';

              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    onSelectEmail(acc.email);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {acc.email}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {acc.name} ({acc.department})
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Email Input */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            หรือระบุอีเมลอื่นที่ต้องการ:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={customEmail}
              onChange={(e) => {
                setCustomEmail(e.target.value);
                setError('');
              }}
              placeholder="user@hospital.org"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              สลับบัญชี
            </button>
          </div>
          {error && (
            <p className="text-[11px] text-rose-600 font-medium">{error}</p>
          )}
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
