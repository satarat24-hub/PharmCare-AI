import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { WardActivityLogger } from './components/WardActivityLogger';
import { ClinicalAIExpert } from './components/ClinicalAIExpert';
import { SpecialTechniqueCounseling } from './components/SpecialTechniqueCounseling';
import { StorageAndHadAudit } from './components/StorageAndHadAudit';
import { DischargeCare } from './components/DischargeCare';
import { GoogleSheetSync } from './components/GoogleSheetSync';
import { DashboardAccessLock } from './components/DashboardAccessLock';
import { AccountModal } from './components/AccountModal';

import { WardActivityRecord, WardStorageAudit, ActiveTab } from './types';
import { 
  getStoredActivities, 
  saveActivities, 
  getStoredAudits, 
  saveAudits, 
  getSheetWebhookUrl, 
  saveSheetWebhookUrl 
} from './utils/storage';
import { 
  ADMIN_EMAIL, 
  getCurrentUserEmail, 
  setCurrentUserEmail, 
  isAdminEmail 
} from './utils/auth';
import { dispatchAdminNotification } from './utils/notificationService';
import { Mail, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activities, setActivities] = useState<WardActivityRecord[]>([]);
  const [audits, setAudits] = useState<WardStorageAudit[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmailState] = useState<string>(ADMIN_EMAIL);
  const [notificationToast, setNotificationToast] = useState<{
    title: string;
    recipient: string;
  } | null>(null);

  // Initialize data from local storage on mount
  useEffect(() => {
    const storedActivities = getStoredActivities();
    setActivities(storedActivities);

    const storedAudits = getStoredAudits();
    setAudits(storedAudits);

    const storedUrl = getSheetWebhookUrl();
    if (storedUrl) {
      setWebhookUrl(storedUrl);
    }

    const initialUserEmail = getCurrentUserEmail();
    setCurrentUserEmailState(initialUserEmail);
  }, []);

  const handleSwitchAccount = (newEmail: string) => {
    setCurrentUserEmail(newEmail);
    setCurrentUserEmailState(newEmail);
  };

  // Handlers for activities
  const handleAddActivity = async (newRecord: WardActivityRecord) => {
    const updated = [newRecord, ...activities];
    setActivities(updated);
    saveActivities(updated);

    // Automatic email notification dispatch to satarat24@gmail.com
    try {
      await dispatchAdminNotification('NEW_ACTIVITY', newRecord, webhookUrl);
      setNotificationToast({
        title: `บันทึกกิจกรรมใหม่ (${newRecord.ward})`,
        recipient: ADMIN_EMAIL,
      });
      setTimeout(() => setNotificationToast(null), 5000);
    } catch (err) {
      console.warn('Failed to send admin notification:', err);
    }
  };

  const handleUpdateActivity = (updatedRecord: WardActivityRecord) => {
    const updated = activities.map((item) => (item.id === updatedRecord.id ? updatedRecord : item));
    setActivities(updated);
    saveActivities(updated);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter((item) => item.id !== id);
    setActivities(updated);
    saveActivities(updated);
  };

  const handleDeleteAudit = (id: string) => {
    const updated = audits.filter((item) => item.id !== id);
    setAudits(updated);
    saveAudits(updated);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('pharmcare_ward_activities_v1');
    localStorage.removeItem('pharmcare_storage_audits_v1');
    const storedActivities = getStoredActivities();
    const storedAudits = getStoredAudits();
    setActivities(storedActivities);
    setAudits(storedAudits);
  };

  const handleClearAllData = () => {
    setActivities([]);
    saveActivities([]);
    setAudits([]);
    saveAudits([]);
  };

  // Handlers for audits
  const handleAddAudit = async (newAudit: WardStorageAudit) => {
    const updated = [newAudit, ...audits];
    setAudits(updated);
    saveAudits(updated);

    // Automatic email notification dispatch to satarat24@gmail.com
    try {
      await dispatchAdminNotification('NEW_AUDIT', newAudit, webhookUrl);
      setNotificationToast({
        title: `บันทึกผลตรวจตู้เย็น & HAD (${newAudit.ward})`,
        recipient: ADMIN_EMAIL,
      });
      setTimeout(() => setNotificationToast(null), 5000);
    } catch (err) {
      console.warn('Failed to send admin notification for audit:', err);
    }
  };

  // Handler for webhook URL
  const handleSaveWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    saveSheetWebhookUrl(url);
  };

  const handleMarkSynced = () => {
    const updated = activities.map((a) => ({ ...a, syncedToGoogleSheet: true }));
    setActivities(updated);
    saveActivities(updated);
  };

  const isUserAdmin = isAdminEmail(currentUserEmail);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activitiesCount={activities.length}
        onOpenNewActivityModal={() => setIsActivityModalOpen(true)}
        pendingSyncCount={activities.filter((a) => !a.syncedToGoogleSheet).length}
        sheetConfig={{ webhookUrl, sheetName: 'PharmCare_IPD_Log', autoSync: false }}
        currentUserEmail={currentUserEmail}
        onSwitchAccount={() => setIsAccountModalOpen(true)}
      />

      {/* Floating Email Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 max-w-md">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ส่งอีเมลแจ้งเตือนอัตโนมัติแล้ว</span>
            </div>
            <p className="text-slate-300 font-medium">
              {notificationToast.title}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              ผู้รับ: <strong className="text-white">{notificationToast.recipient}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main App Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          isUserAdmin ? (
            <ExecutiveDashboard
              activities={activities}
              storageAudits={audits}
              onOpenGoogleSheetTab={() => setActiveTab('google-sheet')}
              currentUserEmail={currentUserEmail}
            />
          ) : (
            <DashboardAccessLock
              currentUserEmail={currentUserEmail}
              onLoginAsAdmin={(adminEmail) => handleSwitchAccount(adminEmail)}
              onGoBackToActivities={() => setActiveTab('activities')}
            />
          )
        )}

        {activeTab === 'activities' && (
          <WardActivityLogger
            activities={activities}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onResetToDefault={handleResetToDefault}
            onClearAllData={handleClearAllData}
            isModalOpen={isActivityModalOpen}
            setIsModalOpen={setIsActivityModalOpen}
            onOpenGoogleSheetTab={() => setActiveTab('google-sheet')}
          />
        )}

        {activeTab === 'clinical-ai' && (
          <ClinicalAIExpert onAddActivity={handleAddActivity} />
        )}

        {activeTab === 'special-device' && (
          <SpecialTechniqueCounseling onAddActivity={handleAddActivity} />
        )}

        {activeTab === 'storage-had' && (
          <StorageAndHadAudit
            audits={audits}
            onAddAudit={handleAddAudit}
            onAddActivity={handleAddActivity}
            onDeleteAudit={handleDeleteAudit}
          />
        )}

        {activeTab === 'discharge' && (
          <DischargeCare onAddActivity={handleAddActivity} />
        )}

        {activeTab === 'google-sheet' && (
          <GoogleSheetSync
            activities={activities}
            audits={audits}
            webhookUrl={webhookUrl}
            onSaveWebhookUrl={handleSaveWebhookUrl}
            onMarkSynced={handleMarkSynced}
          />
        )}
      </main>

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">PharmCare AI</span> • ระบบบริบาลเภสัชกรรมคลินิกและบริหารความปลอดภัยทางยาบนหอผู้ป่วย
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>มาตรฐานความปลอดภัยยา HA / JCI</span>
            <span>•</span>
            <span>เชื่อมโยง Google Sheets Real-Time</span>
            <span>•</span>
            <span>ขับเคลื่อนด้วย Gemini 3.8-Flash</span>
          </div>
        </div>
      </footer>

      {/* Account Management & Role Switcher Modal */}
      {isAccountModalOpen && (
        <AccountModal
          currentUserEmail={currentUserEmail}
          onSelectEmail={(newEmail) => handleSwitchAccount(newEmail)}
          onClose={() => setIsAccountModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
