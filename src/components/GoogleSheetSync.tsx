import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Send, 
  Code, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { WardActivityRecord, WardStorageAudit } from '../types';
import { convertActivitiesToTSV, saveSheetWebhookUrl } from '../utils/storage';

interface GoogleSheetSyncProps {
  activities: WardActivityRecord[];
  audits: WardStorageAudit[];
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  onMarkSynced: () => void;
}

export const GoogleSheetSync: React.FC<GoogleSheetSyncProps> = ({
  activities,
  audits,
  webhookUrl,
  onSaveWebhookUrl,
  onMarkSynced,
}) => {
  const [inputUrl, setInputUrl] = useState(webhookUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWebhookUrl(inputUrl);
    alert('บันทึก Google Sheet Webhook URL เรียบร้อยแล้ว!');
  };

  const handleTriggerSync = async () => {
    if (!inputUrl) {
      alert('กรุณากรอกและบันทึก Google Apps Script Webhook URL ก่อนทำการเชื่อมต่อ');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const res = await fetch('/api/sync/google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: inputUrl,
          activities,
          audits,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncStatus({ success: true, message: 'ส่งข้อมูลขึ้น Google Sheet สำเร็จเรียบร้อย!' });
        onMarkSynced();
      } else {
        setSyncStatus({ success: false, message: data.message || 'การส่งข้อมูลล้มเหลว' });
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus({ success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Webhook' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyTSV = () => {
    const tsv = convertActivitiesToTSV(activities);
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedTSV(true);
      setTimeout(() => setCopiedTSV(false), 2500);
    });
  };

  const sampleAppsScriptCode = `/**
 * ==============================================================================
 * PHARMCARE AI - CLINICAL PHARMACY & WARD ACTIVITY SYNCHRONIZER
 * Google Apps Script (GAS) Webhook Engine
 * ==============================================================================
 * วัตถุประสงค์: รับข้อมูลกิจกรรมบริบาลเภสัชกรรม (Ward Activities & DRP Interventions)
 * และผลการตรวจสอบคลังยา/ตู้เย็น 2-8°C (Storage & HAD Audits) บันทึกลง Google Sheet
 * 
 * คุณสมบัติ:
 * 1. สร้างและจัดรูปแบบ Sheet อัตโนมัติ (Ward_Activities และ Storage_Audits)
 * 2. ป้องกันข้อมูลซ้ำซ้อน (Deduplication / Upsert by ID)
 * 3. จัดสไตล์หัวตาราง (Header Colors, Freeze Row, Number Formatting)
 * 4. รองรับทั้ง GET (Health Check) และ POST (Data Ingestion)
 * 5. ปลอดภัยด้วย LockService ป้องกัน Concurrency Conflict
 * ==============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "PharmCare AI - Clinical Pharmacy Google Apps Script Engine",
    version: "2.5.0",
    message: "Webhook พร้อมรับข้อมูลจากระบบ PharmCare AI",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // รอ lock สูงสุด 30 วินาที เพื่อป้องกันบันทึกข้อมูลชนกัน
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Server is busy. Please retry later." }, 503);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "No post data received" }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. ประมวลผล Ward Activities (DRP, Dose Adjustments, Interventions)
    var activities = payload.records || payload.activities || [];
    var activitiesSaved = syncActivities(ss, activities);

    // 2. ประมวลผล Storage & HAD Audits (ตรวจตู้เย็น 2-8°C, ยาเสี่ยงสูง)
    var audits = payload.storageAudits || payload.audits || [];
    var auditsSaved = syncStorageAudits(ss, audits);

    // 3. ระบบส่งอีเมลแจ้งเตือนอัตโนมัติมายัง satarat24@gmail.com ทุกครั้งที่มีการ Add ข้อมูล
    try {
      sendAdminAlertEmail(payload);
    } catch (mailErr) {
      Logger.log("MailApp error: " + mailErr);
    }

    return createJsonResponse({
      status: "success",
      message: "Data synchronized successfully",
      activitiesProcessed: activities.length,
      activitiesSaved: activitiesSaved,
      auditsProcessed: audits.length,
      auditsSaved: auditsSaved,
      timestamp: new Date().toISOString()
    }, 200);

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString(),
      stack: error.stack
    }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ฟังก์ชันบันทึกกิจกรรมบริบาลเภสัชกรรม (Ward Activities)
 */
function syncActivities(ss, activities) {
  if (!activities || activities.length === 0) return 0;

  var sheetName = "Ward_Activities";
  var sheet = ss.getSheetByName(sheetName);

  var headers = [
    "ID", "วันที่", "เวลา", "HN", "ชื่อผู้ป่วย", "อายุ", "เพศ",
    "หอผู้ป่วย", "เตียง", "เภสัชกรผู้บันทึก", "ประเภทกิจกรรม", "ยาที่เกี่ยวข้อง",
    "หมวด DRP", "ขั้นตอนความคลาดเคลื่อน", "ระดับความรุนแรง", "รายละเอียดปัญหา",
    "ข้อเสนอแนะของเภสัชกร", "การตอบรับของแพทย์", "ผลลัพธ์ทางคลินิก",
    "มูลค่าประหยัด Cost Avoidance (บาท)", "หมายเหตุ"
  ];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    setupSheetHeader(sheet, headers, "#047857"); // สีเขียวมรกต (Emerald)
  }

  // สร้าง Index แผนที่ ID ที่มีอยู่แล้วเพื่อทำ Upsert (Update if exists, Append if new)
  var idMap = getIdRowMap(sheet);
  var savedCount = 0;

  for (var i = 0; i < activities.length; i++) {
    var r = activities[i];
    if (!r || !r.id) continue;

    var drugsStr = Array.isArray(r.drugsInvolved) ? r.drugsInvolved.join(", ") : (r.drugsInvolved || "");
    var costValue = Number(r.costAvoidanceEstimate) || 0;

    var rowData = [
      r.id,
      r.date || new Date().toISOString().slice(0, 10),
      r.timestamp || new Date().toISOString(),
      r.hn || "",
      r.patientName || "",
      r.age || "",
      r.gender || "",
      r.ward || "",
      r.bed || "",
      r.pharmacistName || "",
      r.activityType || "",
      drugsStr,
      r.drpCategory || "",
      r.medErrorStage || "",
      r.medErrorSeverity || "",
      r.description || "",
      r.recommendation || "",
      r.physicianAcceptance || "",
      r.clinicalOutcome || "",
      costValue,
      r.notes || ""
    ];

    if (idMap[r.id]) {
      // อัปเดตแถวเดิม
      var targetRow = idMap[r.id];
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // เพิ่มแถวใหม่
      sheet.appendRow(rowData);
      idMap[r.id] = sheet.getLastRow();
    }
    savedCount++;
  }

  // จัดรูปแบบคอลัมน์เงิน Cost Avoidance (Col 20)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 20, lastRow - 1, 1).setNumberFormat("#,##0.00");
  }

  return savedCount;
}

/**
 * ฟังก์ชันบันทึกการตรวจประเมินคลังยาและตู้เย็น 2-8°C (Storage Audits)
 */
function syncStorageAudits(ss, audits) {
  if (!audits || audits.length === 0) return 0;

  var sheetName = "Storage_Audits";
  var sheet = ss.getSheetByName(sheetName);

  var headers = [
    "Audit ID", "วันที่ตรวจ", "หอผู้ป่วย", "ผู้ตรวจประเมิน",
    "อุณหภูมิต่ำสุด (°C)", "อุณหภูมิสูงสุด (°C)", "เกณฑ์ตู้เย็น 2-8°C",
    "การจัดเก็บ HAD", "การจัดเก็บ LASA", "ยาไวต่อแสง",
    "จำนวนยาหมดอายุ/เสื่อมสภาพ", "สถานะรวม", "มาตรการแก้ไข/ข้อเสนอแนะ"
  ];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    setupSheetHeader(sheet, headers, "#0f766e"); // สี Teal
  }

  var idMap = getIdRowMap(sheet);
  var savedCount = 0;

  for (var i = 0; i < audits.length; i++) {
    var a = audits[i];
    if (!a || !a.id) continue;

    var rowData = [
      a.id,
      a.date || new Date().toISOString().slice(0, 10),
      a.ward || "",
      a.inspector || "",
      a.fridgeTempMin !== undefined ? a.fridgeTempMin : "",
      a.fridgeTempMax !== undefined ? a.fridgeTempMax : "",
      a.isTempPass ? "ผ่าน (2-8°C)" : "ไม่ผ่านเกณฑ์",
      a.hadStoragePassed ? "ผ่านเกณฑ์ 100%" : "พบข้อบกพร่อง",
      a.lasaStoragePassed ? "ผ่านเกณฑ์ 100%" : "พบข้อบกพร่อง",
      a.lightSensitivePassed ? "ผ่านเกณฑ์ 100%" : "พบข้อบกพร่อง",
      a.expiredCount || 0,
      a.status || "",
      a.correctiveNotes || ""
    ];

    if (idMap[a.id]) {
      var targetRow = idMap[a.id];
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      idMap[a.id] = sheet.getLastRow();
    }
    savedCount++;
  }

  return savedCount;
}

/**
 * ฟังก์ชันสร้าง Header สวยงาม พร้อม Freeze แถวแรก
 */
function setupSheetHeader(sheet, headers, headerColor) {
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setBackground(headerColor);
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * ดึง ID คอลัมน์ที่ 1 มาทำ Map สำหรับการ Upsert
 */
function getIdRowMap(sheet) {
  var map = {};
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return map;

  var idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    var id = idValues[i][0];
    if (id) {
      map[id] = i + 2; // แถวจริงใน Sheet (เริ่มจากแถว 2)
    }
  }
  return map;
}

/**
 * ฟังก์ชันส่งอีเมลแจ้งเตือนอัตโนมัติมายัง satarat24@gmail.com
 */
function sendAdminAlertEmail(payload) {
  var adminEmail = "satarat24@gmail.com";
  var tz = "Asia/Bangkok";
  var timeStr = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy HH:mm:ss");

  if (payload.action === "SEND_ADMIN_NOTIFICATION") {
    MailApp.sendEmail({
      to: adminEmail,
      subject: payload.subject || "🚨 [PharmCare AI] มีการบันทึกข้อมูลทางคลินิกใหม่",
      htmlBody: payload.htmlBody || ("<p>" + payload.title + "</p><p>" + payload.summary + "</p>")
    });
    return;
  }

  var activities = payload.records || payload.activities || [];
  if (activities.length > 0) {
    var act = activities[0];
    var subject = "🚨 [PharmCare AI] แจ้งเตือน: มีการบันทึกกิจกรรมบริบาลใหม่ (" + (act.ward || "หอผู้ป่วย") + " - HN: " + (act.hn || "-") + ")";
    var body = "เรียน ผู้บริหาร (" + adminEmail + ")\n\n" +
               "ระบบตรวจพบการบันทึกข้อมูลกิจกรรมบริบาลทางเภสัชกรรมใหม่ เวลา " + timeStr + ":\n\n" +
               "• หอผู้ป่วย: " + (act.ward || "-") + " (เตียง " + (act.bed || "-") + ")\n" +
               "• ผู้ป่วย: " + (act.patientName || "-") + " (HN: " + (act.hn || "-") + ")\n" +
               "• ประเภทกิจกรรม: " + (act.activityType || "-") + "\n" +
               "• ปัญหาทางยา (DRP): " + (act.description || "-") + "\n" +
               "• ข้อเสนอแนะ: " + (act.recommendation || "-") + "\n" +
               "• การตอบรับแพทย์: " + (act.physicianAcceptance || "-") + "\n" +
               "• Cost Avoidance: ฿" + (act.costAvoidanceEstimate || 0) + " บาท\n" +
               "• เภสัชกรผู้บันทึก: " + (act.pharmacistName || "-") + "\n\n" +
               "---\nระบบส่งแจ้งเตือนอัตโนมัติจาก PharmCare AI Clinical Suite";
    MailApp.sendEmail(adminEmail, subject, body);
  }
}

/**
 * ฟังก์ชันส่งออก JSON Response ที่ถูกต้อง
 */
function createJsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            เชื่อมโยงและส่งออกข้อมูล Google Sheets (Real-Time Cloud Synchronization)
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          ส่งข้อมูลกิจกรรมบริบาลบนหอผู้ป่วยและผลการตรวจคลังยาตรงเข้าสู่ Google Sheets แบบอัตโนมัติ หรือคัดลอกตารางไปวางได้ใน 1 วินาที
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhook Configuration & Sync (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-emerald-600" />
              การตั้งค่า Google Apps Script Webhook
            </h2>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  นำ URL ที่ได้จาก Deploy as Web App มาวางที่นี่
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  บันทึก URL
                </button>

                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing || !inputUrl}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งข้อมูลขึ้น Google Sheet...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ส่งออก {activities.length} รายการขึ้น Google Sheet ทันที</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {syncStatus && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                  syncStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {syncStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{syncStatus.message}</span>
              </div>
            )}

            {/* Quick 1-Click Copy Method */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  วิธีด่วน: คัดลอกตารางไปวางใน Google Sheet (Ctrl+V)
                </span>
                <button
                  onClick={handleCopyTSV}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copiedTSV
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {copiedTSV ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTSV ? 'คัดลอกแล้ว!' : 'คัดลอกข้อมูลทั้งหมด'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                คลิกปุ่มด้านบน จากนั้นเปิด Google Sheet แผ่นงานเปล่า แล้วกดปุ่ม <strong>Ctrl + V</strong> (หรือ Command + V) ข้อมูลจะแยกเป็นคอลัมน์ให้อย่างสวยงามทันที
              </p>
            </div>
          </div>
        </div>

        {/* Google Apps Script Code Generator (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Code className="w-4 h-4 text-slate-700" />
                โค้ด Google Apps Script (คัดลอกไปวางได้เลย)
              </h2>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? 'คัดลอกโค้ดแล้ว' : 'คัดลอกโค้ด'}</span>
              </button>
            </div>

            <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside">
              <li>เปิด Google Sheet ของท่าน &gt; เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
              <li>ลบโค้ดเดิมแล้ววางโค้ดด้านล่างนี้ลงไป &gt; กดบันทึก</li>
              <li>กด <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>รายการทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
              <li>เลือกประเภท: <strong>เว็บแอป (Web app)</strong> &gt; ผู้มีสิทธิ์เข้าถึง: <strong>ทุกคน (Anyone)</strong> &gt; กด Deploy แล้วนำ URL มาใส่ในช่องซ้ายมือ</li>
            </ol>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed scrollbar-none">
              {sampleAppsScriptCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
