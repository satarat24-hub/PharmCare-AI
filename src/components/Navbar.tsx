import React from 'react';
import { 
  Activity, 
  BarChart3, 
  ClipboardList, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  LogOut, 
  FileSpreadsheet, 
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Lock,
  UserCheck,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { GoogleSheetConfig } from '../types';
import { ADMIN_EMAIL, isAdminEmail } from '../utils/auth';

export type ActiveTab = 
  | 'dashboard' 
  | 'activities' 
  | 'clinical-ai' 
  | 'special-device' 
  | 'storage-had' 
  | 'discharge' 
  | 'google-sheet';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
  highlight?: boolean;
  isLocked?: boolean;
}

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activitiesCount?: number;
  pendingSyncCount?: number;
  sheetConfig?: GoogleSheetConfig;
  onOpenNewActivityModal: () => void;
  currentUserEmail: string;
  onSwitchAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activitiesCount = 0,
  pendingSyncCount = 0,
  sheetConfig,
  onOpenNewActivityModal,
  currentUserEmail,
  onSwitchAccount,
}) => {
  const isSheetConfigured = Boolean(sheetConfig?.webhookUrl);
  const isAdmin = isAdminEmail(currentUserEmail);

  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard ผู้บริหาร', 
      icon: isAdmin ? BarChart3 : Lock, 
      badge: isAdmin ? undefined : '🔒 satarat24 เท่านั้น',
      isLocked: !isAdmin 
    },
    { id: 'activities', label: 'บันทึกกิจกรรมหอผู้ป่วย', icon: ClipboardList, count: activitiesCount },
    { id: 'clinical-ai', label: 'AI ผู้เชี่ยวชาญคลินิก', icon: Sparkles, highlight: true },
    { id: 'special-device', label: 'คู่มือยาเทคนิคพิเศษ', icon: BookOpen },
    { id: 'storage-had', label: 'ตรวจจัดเก็บยา & HAD', icon: ShieldAlert },
    { id: 'discharge', label: 'ตารางยาก่อนกลับบ้าน (Discharge)', icon: LogOut },
    { id: 'google-sheet', label: 'Google Sheet', icon: FileSpreadsheet, badge: pendingSyncCount > 0 ? `${pendingSyncCount}` : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  PharmCare <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  IPD Clinical Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบผู้เชี่ยวชาญเภสัชกรรมบริบาล &amp; บันทึกกิจกรรมหอผู้ป่วยแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Right Action & Sync Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account / Admin Badge */}
            <button
              id="btn-nav-account-switcher"
              onClick={onSwitchAccount}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="คลิกเพื่อดูหรือเปลี่ยนบัญชีผู้ใช้"
            >
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline font-mono">
                {isAdmin ? 'satarat24 (Admin)' : currentUserEmail.split('@')[0]}
              </span>
              <span className="sm:hidden font-mono text-[11px]">
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </button>

            {/* Google Sheet Sync Indicator */}
            <button
              id="nav-sheet-status-btn"
              onClick={() => setActiveTab('google-sheet')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSheetConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="สถานะการเชื่อมต่อ Google Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isSheetConfigured ? 'Google Sheet เชื่อมต่อแล้ว' : 'ตั้งค่า Google Sheet'}</span>
              {isSheetConfigured ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </button>

            {/* Quick Add Ward Intervention Button */}
            <button
              id="btn-quick-add-activity"
              onClick={onOpenNewActivityModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">บันทึกกิจกรรมบริบาล</span>
              <span className="sm:hidden">บันทึก</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-100 pt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
                {'highlight' in item && item.highlight && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded-sm font-bold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
