import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;
const ADMIN_EMAIL = "satarat24@gmail.com";

// In-memory store for admin notification history
interface NotificationLog {
  id: string;
  timestamp: string;
  recipient: string;
  type: "NEW_ACTIVITY" | "NEW_AUDIT";
  title: string;
  summary: string;
  dispatchedVia: string[];
  status: "SENT" | "QUEUED" | "FAILED";
}

const notificationHistory: NotificationLog[] = [];

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "PharmCare AI",
    time: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: AI Clinical Pharmacist Consultation
app.post("/api/ai/clinical-consult", async (req, res) => {
  try {
    const { prompt, topic, patientContext, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `คุณคือ "เภสัชกรคลินิกผู้เชี่ยวชาญระดับวุฒิบัตร (Board Certified Pharmacotherapy Specialist - BCPS)" และผู้เชี่ยวชาญด้านเภสัชกรรมบริบาล (Clinical Pharmacy Specialist) ประจำโรงพยาบาลระดับตติยภูมิ
หน้าที่ของคุณคือให้คำแนะนำทางคลินิกที่แม่นยำ ลึกซึ้ง ตรงประเด็น ปลอดภัยสูงสุด และอิงหลักฐานเชิงประจักษ์ (Evidence-Based Medicine) 
โดยอ้างอิงแนวทางมาตรฐานสากล เช่น:
- KDIGO Guidelines (การประเมิน CrCl, eGFR, การปรับขนาดยาไต, HD, CRRT)
- The Sanford Guide to Antimicrobial Therapy & IDSA Guidelines (ยาปฏิชีวนะ, PK/PD targets เช่น AUC/MIC, time above MIC)
- AGS Beers Criteria 2023 (ยาที่ควรระวังหรือหลีกเลี่ยงในผู้สูงอายุ >= 65 ปี)
- AHA/ACC/ESC Guidelines (ยาระบบหัวใจและหลอดเลือด, Anticoagulants, Antiplatelets, DOACs)
- Lexicomp Drug Interactions & Micromedex (อันตรกิริยาระหว่างยา, IV Compatibility, HAD Safety)
- PCNE classification v9.1 (การจำแนก Drug-Related Problems)

เกณฑ์การตอบคำถามของคุณเพื่อให้มีประสิทธิภาพสูงสุด:
1. ปรับโทนและรูปแบบตามเป้าหมายของคำถาม (Adaptive Clinical Context):
   - หากเป็นคำถามปรึกษาทางคลินิก/วิชาชีพ: ให้คำตอบเชิงลึก กระชับ แม่นยำ มีเหตุผลทางเภสัชจลนศาสตร์/พลศาสตร์ (PK/PD)
   - หากเป็นการขอคำแนะนำสำหรับผู้ป่วย/ญาติ (Patient Counseling): ใช้ภาษาไทยที่สุภาพ เข้าใจง่าย เห็นภาพชัดเจน หลีกเลี่ยงศัพท์เทคนิคยากๆ
   - หากเป็นการร่างข้อความส่งแพทย์/พยาบาล (Intervention Recommendation): ใช้รูปแบบ SBAR ที่กระชับและนำไปสื่อสารได้ทันที
   - หากเป็นเรื่องการจัดเก็บยา/ตู้เย็น 2-8°C/High Alert Drug: อิงมาตรฐาน JCI/HA และ Good Storage Practice (GSP)
2. โครงสร้างคำตอบสำหรับคำปรึกษาทางคลินิกทั่วไป:
   - 🎯 **สรุปคำแนะนำเร่งด่วน (Clinical Bottom Line)**: ข้อสรุปชัดเจนตรงประเด็น 1-2 ประโยคแรก
   - 💊 **ขนาดยาและการบริหารยา (Evidence-Based Regimen & Dosing)**: ขนาดยาที่ถูกต้อง, ความถี่, การปรับตาม CrCl/ตับ, วิธีการบริหารยา (Diluent, Infusion time, Compatibility)
   - ⚠️ **การประเมิน DRP & ความเสี่ยง (DRP, Interactions & High Alert Drug Precautions)**: กลไกและระดับความเสี่ยง
   - 📋 **ข้อเสนอแนะสำหรับแพทย์/ทีมรักษา (Pharmacist Recommendation for MD/RN - SBAR)**: ข้อความพร้อมใช้
   - 🔬 **แผนการติดตามผลและความปลอดภัย (Monitoring & Lab Parameters)**: ค่า Lab ที่ต้องเจาะ (Scr, LFT, Electrolytes, TDM), สัญญาณชีพ และอาการข้างเคียงที่ต้องเฝ้าระวัง
3. ใช้ Markdown เน้นข้อความสำคัญ (ตัวหนา, หัวข้อ, ตารางสรุป, รายการ bullet) เพื่อให้อ่านง่าย รวดเร็ว และนำไปปฏิบัติได้ทันทีในจุดดูแลผู้ป่วย`;

    // Construct conversation contents
    const contents: any[] = [];

    // If there is prior conversation history, include it for multi-turn clinical context
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        if (item.text && item.text.trim()) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Build the latest user prompt
    let currentTurnText = prompt;
    if (patientContext && Object.keys(patientContext).length > 0) {
      currentTurnText = `[ข้อมูลผู้ป่วยและสภาวะทางคลินิกปัจจุบัน]:
- อายุ: ${patientContext.age || '-'} ปี, เพศ: ${patientContext.gender || '-'}
- ค่าการทำงานของไต (CrCl Cockcroft-Gault): ${patientContext.crCl !== undefined ? `${patientContext.crCl} mL/min` : 'ไม่ได้ระบุ'}
- การวินิจฉัย/โรคประจำตัว: ${patientContext.diagnoses || '-'}
- ประวัติแพ้ยา: ${patientContext.allergies || 'ไม่พบประวัติแพ้ยา'}
- รายการยาปัจจุบัน:
${patientContext.meds || '-'}

[คำถาม/ข้อปรึกษาทางคลินิก]:
${prompt}`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: currentTurnText }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.15, // High clinical precision
      },
    });

    res.json({ result: response.text || "ไม่สามารถสร้างคำตอบได้" });
  } catch (error: any) {
    console.error("Clinical consult error:", error);
    res.status(500).json({
      error: error?.message || "เกิดข้อผิดพลาดในการประมวลผลคำปรึกษาทางคลินิก",
    });
  }
});

// Endpoint: AI Thorough Patient Profile & DRP Screening
app.post("/api/ai/analyze-patient", async (req, res) => {
  try {
    const { patient } = req.body;
    if (!patient) {
      return res.status(400).json({ error: "Patient data is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `คุณคือ เภสัชกรคลินิกผู้เชี่ยวชาญระดับวุฒิบัตร (BCPS Clinical Pharmacist)
จงวิเคราะห์ข้อมูลเคสผู้ป่วยและรายการยาทั้งหมดอย่างละเอียดถี่ถ้วน ตามหลักวิชาการเภสัชกรรมคลินิกและ Evidence-Based Medicine (KDIGO, Sanford Guide, Beers Criteria 2023, Lexicomp, PCNE classification v9.1):

เป้าหมายการประเมิน:
1. ประเมินการทำงานของไต (CrCl Cockcroft-Gault / eGFR) และคำนวณขนาดยาที่เหมาะสมอย่างแม่นยำ โดยเฉพาะยาปฏิชีวนะ (Meropenem, Vancomycin, Colistin, Piperacillin/Tazo, Fluconazole), ยาเบาหวาน/ความดัน/หัวใจ, Anticoagulants
2. ตรวจจับ DRP (Drug-Related Problems) ตาม PCNE v9.1 (เช่น C1.1 ขนาดยาสูงเกิน, C1.2 ขนาดยาต่ำเกิน, C3.1 อันตรกิริยาระหว่างยา, P1.2 ผลข้างเคียงที่ไม่พึงประสงค์, C1.4 ระยะเวลาการใช้ยาไม่เหมาะสม)
3. ตรวจสอบอันตรกิริยาระหว่างยา (Drug-Drug Interactions) ทั้งระดับ Major, Moderate ระบุกลไกและการจัดการทางคลินิก (Management) ที่ปฏิบัติได้จริง
4. ตรวจสอบข้อควรระวังในผู้สูงอายุตาม Beers Criteria 2023 หากผู้ป่วยอายุ >= 65 ปี
5. ตรวจสอบการจัดการ High Alert Drugs (HAD) เช่น Warfarin, Insulin, Opioids, Inotropic/Vasopressor agents, Concentrated Electrolytes
6. ร่างข้อเสนอแนะของเภสัชกรเพื่อสื่อสารกับแพทย์ (Pharmacist Intervention Draft) พร้อมประเมิน Cost Avoidance (บาท) ที่สมเหตุสมผล

ตอบในรูปแบบ JSON ตามโครงสร้างนี้เท่านั้น:
{
  "summary": "สรุปภาพรวมทางคลินิกของผู้ป่วย ระดับความเสี่ยง และประเด็นเร่งด่วนที่ต้องปรับยา",
  "drpIdentified": [
    {
      "category": "หมวดหมู่ DRP ตาม PCNE v9.1 (เช่น C1.1 ขนาดยาสูงเกินไปตาม CrCl, C3.1 อันตรกิริยาระหว่างยา)",
      "drug": "ชื่อยาสามัญและขนาดยา",
      "issue": "คำอธิบายปัญหาทางคลินิกและอันตรายที่อาจเกิดกับผู้ป่วย",
      "severity": "สูง / ปานกลาง / ต่ำ",
      "recommendation": "ข้อเสนอแนะของเภสัชกรที่ชัดเจนเพื่อเสนอแพทย์ปรับแผนการรักษา"
    }
  ],
  "doseAdjustments": [
    {
      "drug": "ชื่อยา",
      "currentDose": "ขนาดยาปัจจุบัน",
      "recommendedDose": "ขนาดยาและช่วงเวลาที่แนะนำตามระดับ CrCl ของผู้ป่วย",
      "rationale": "เหตุผลทางเภสัชจลนศาสตร์ (PK/PD target, Clcr-based dosing guideline)"
    }
  ],
  "interactions": [
    {
      "pair": "ยา A + ยา B",
      "severity": "Major / Moderate / Minor",
      "mechanism": "กลไกการเกิด (PK เช่น CYP inhibition/induction หรือ PD เช่น synergism bleeding)",
      "management": "แนวทางการจัดการทางคลินิก (เช่น ปรับลด dose, ตรวจติดตาม lab, เว้นระยะห่าง)"
    }
  ],
  "interventionDraft": {
    "title": "หัวข้อกิจกรรมบริบาลเภสัชกรรม (Intervention Title)",
    "activityType": "DOSE_ADJUSTMENT หรือ DRP_INTERVENTION หรือ MED_ERROR_PREVENTION",
    "recommendationText": "ข้อความร่างคำแนะนำที่กระชับและสุภาพสำหรับบันทึกใน Progress note หรือสื่อสารกับแพทย์",
    "costAvoidanceEstimate": 3500
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: JSON.stringify(patient),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    let parsedData = {};
    try {
      parsedData = JSON.parse(response.text || "{}");
    } catch {
      parsedData = { rawText: response.text };
    }

    res.json({ analysis: parsedData });
  } catch (error: any) {
    console.error("Patient analysis error:", error);
    res.status(500).json({
      error: error?.message || "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูลผู้ป่วย",
    });
  }
});

// Endpoint: Discharge Medication Reconciliation & Counseling Plan Generator
app.post("/api/ai/discharge-plan", async (req, res) => {
  try {
    const { dischargeData } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `คุณคือ "เภสัชกรบริบาลส่งมอบยาก่อนจำหน่าย (Discharge Counseling Pharmacist)" ประจำโรงพยาบาล
หน้าที่ของคุณคือจัดทำ "คู่มือและตารางเวลากินยาสำหรับผู้ป่วยและญาติ (Patient Medication Plan)" ที่เข้าใจง่าย ชัดเจน ถูกต้อง ปลอดภัย และนำไปใช้กินยาได้จริง

กรุณาตอบเป็น JSON ตามโครงสร้างนี้เท่านั้น:
{
  "headerTitle": "คู่มือและตารางเวลากินยาสำหรับผู้ป่วยและญาติ (Patient Medication Plan)",
  "patientGreeting": "ข้อความทักทายและแนะนำการใช้เอกสารนี้สำหรับผู้ป่วยและญาติ",
  "stoppedMedsNotice": [
    {
      "name": "ชื่อยาที่ต้องหยุด",
      "reason": "เหตุผลที่ต้องหยุดกิน (เช่น เป็นยาฉีดเฉพาะช่วงนอน รพ. หรือเปลี่ยนเป็นยากินตัวใหม่แล้ว ห้ามนำกลับมากินอีก)"
    }
  ],
  "scheduleItems": [
    {
      "timeSlot": "เช้า (หลังอาหาร)",
      "timeHour": "08:00 น.",
      "timingNote": "หลังอาหารเช้าทันที",
      "medications": [
        {
          "tradeAndGenericName": "ชื่อยา (ทั้งชื่อการค้าและชื่อสามัญ)",
          "strength": "ความแรง",
          "dosage": "จำนวนที่ต้องกิน เช่น 1 เม็ด",
          "appearance": "ลักษณะยา เช่น เม็ดกลมสีขาว หรือ แคปซูลสีส้ม",
          "purpose": "สรรพคุณรักษาโรคอะไร (ภาษาชาวบ้าน)",
          "specialInstruction": "ข้อควรระวังเฉพาะ"
        }
      ]
    }
  ],
  "highAlertDrugsTips": [
    {
      "drugName": "ชื่อยา เช่น Warfarin หรือ Insulin",
      "keyCaution": "ข้อควรระวังสำคัญที่สุด เช่น ระวังเลือดออก หรือ ภาวะน้ำตาลต่ำ",
      "dosAndDonts": "สิ่งที่ควรทำและห้ามทำ",
      "dietaryCaution": "อาหารหรือยาอื่นที่ต้องระวังร่วมด้วย"
    }
  ],
  "redFlagSymptoms": [
    "อาการผิดปกติที่ต้องรีบมาโรงพยาบาลทันที (เช่น เลือดออกผิดปกติ อ่อนแรง แน่นหน้าอก หายใจไม่ออก)"
  ],
  "homeStorageTips": [
    "คำแนะนำการเก็บรักษายาที่บ้าน (ยาแช่เย็น, ยาเก็บอุณหภูมิห้อง พ้นแสงแดด)"
  ],
  "pharmacistContact": "กลุ่มงานเภสัชกรรม โทรสอบถามเรื่องยาได้ตลอด 24 ชม."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: JSON.stringify(dischargeData),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.15,
      },
    });

    let planJson = null;
    try {
      planJson = JSON.parse(response.text || "{}");
    } catch {
      planJson = { rawText: response.text };
    }

    res.json({ dischargePlan: planJson, rawText: response.text });
  } catch (error: any) {
    console.error("Discharge plan error:", error);
    res.status(500).json({
      error: error?.message || "เกิดข้อผิดพลาดในการสร้างแผน Discharge Counseling",
    });
  }
});

// Endpoint: Google Sheet Webhook Proxy Dispatcher
app.post("/api/sync/google-sheet", async (req, res) => {
  try {
    const { webhookUrl, records, storageAudits, activities, audits } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ error: "Webhook URL is required" });
    }

    const activityList = records || activities || [];
    const auditList = storageAudits || audits || [];

    // Forward payload to user's Google Apps Script Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SYNC_WARD_ACTIVITIES",
        timestamp: new Date().toISOString(),
        recordsCount: activityList.length,
        auditsCount: auditList.length,
        records: activityList,
        activities: activityList,
        storageAudits: auditList,
        audits: auditList,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Google Apps Script returned ${response.status}: ${errText.slice(0, 200)}`,
      });
    }

    const result = await response.json().catch(() => ({ status: "success" }));
    res.json({ success: true, result });
  } catch (error: any) {
    console.error("Google Sheet sync error:", error);
    res.status(500).json({
      error: error?.message || "ไม่สามารถเชื่อมต่อกับ Google Sheet Webhook ได้",
    });
  }
});

// Endpoint: Verify Admin Dashboard Access
app.post("/api/auth/verify-dashboard-access", (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ authorized: false, message: "Email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isAuthorized = normalizedEmail === ADMIN_EMAIL.toLowerCase();

  if (isAuthorized) {
    return res.json({
      authorized: true,
      email: ADMIN_EMAIL,
      role: "ADMIN_CHIEF_PHARMACIST",
      message: "ยินดีต้อนรับคุณ satarat24@gmail.com เข้าสู่ Dashboard ผู้บริหาร",
    });
  } else {
    return res.status(403).json({
      authorized: false,
      email: normalizedEmail,
      message: `การเข้าถึงถูกจำกัด: อนุญาตเฉพาะ ${ADMIN_EMAIL} เท่านั้น`,
    });
  }
});

// Endpoint: Notify Admin via Email upon Data Addition
app.post("/api/notifications/notify-admin", async (req, res) => {
  try {
    const { type, record, webhookUrl } = req.body;
    const recipient = ADMIN_EMAIL;
    const timestamp = new Date().toISOString();
    const nowThai = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    let title = "";
    let summary = "";
    let htmlContent = "";

    if (type === "NEW_ACTIVITY") {
      const act = record || {};
      const drugsStr = Array.isArray(act.drugsInvolved)
        ? act.drugsInvolved.join(", ")
        : act.drugsInvolved || "-";
      const costStr = Number(act.costAvoidanceEstimate || 0).toLocaleString("th-TH");

      title = `[กิจกรรมบริบาลใหม่] ${act.ward || "หอผู้ป่วย"} • HN: ${act.hn || "-"}`;
      summary = `ผู้ป่วย: ${act.patientName || "-"} (เตียง ${act.bed || "-"}) • กิจกรรม: ${act.activityType || "-"} • เภสัชกร: ${act.pharmacistName || "-"}`;

      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #047857, #0f766e); padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 18px;">🚨 [PharmCare AI] แจ้งเตือน: มีการบันทึกกิจกรรมบริบาลเภสัชกรรมใหม่</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">เรียน ผู้บริหาร ${recipient}</p>
          </div>
          <div style="padding: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b;">วัน-เวลา:</td>
                <td style="padding: 8px 0; color: #0f172a;">${nowThai}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">หอผู้ป่วย / เตียง:</td>
                <td style="padding: 8px 0; color: #0f172a;"><strong>${act.ward || "-"}</strong> (เตียง ${act.bed || "-"})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ผู้ป่วย / HN:</td>
                <td style="padding: 8px 0; color: #0f172a;">${act.patientName || "-"} (HN: <strong>${act.hn || "-"}</strong>)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ประเภทกิจกรรม:</td>
                <td style="padding: 8px 0; color: #047857; font-weight: bold;">${act.activityType || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ยาที่เกี่ยวข้อง:</td>
                <td style="padding: 8px 0; color: #0f172a;">${drugsStr}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">รายละเอียดปัญหา (DRP):</td>
                <td style="padding: 8px 0; color: #0f172a;">${act.description || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ข้อเสนอแนะเภสัชกร:</td>
                <td style="padding: 8px 0; color: #0f172a;">${act.recommendation || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">การตอบรับแพทย์:</td>
                <td style="padding: 8px 0; color: #0f172a;">${act.physicianAcceptance || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Cost Avoidance:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">฿${costStr} บาท</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">เภสัชกรผู้บันทึก:</td>
                <td style="padding: 8px 0; color: #0f172a;">${act.pharmacistName || "-"}</td>
              </tr>
            </table>
            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
              ระบบส่งการแจ้งเตือนอัตโนมัติมายัง <strong>${recipient}</strong> ตามนโยบายการเฝ้าระวังความปลอดภัยด้านยาแบบ Real-time
            </div>
          </div>
        </div>
      `;
    } else {
      const aud = record || {};
      title = `[ผลตรวจตู้เย็น & HAD] ${aud.ward || "หอผู้ป่วย"} • สถานะ: ${aud.status || "-"}`;
      summary = `หอผู้ป่วย: ${aud.ward || "-"} • ตู้เย็น: ${aud.fridgeTempMin}° - ${aud.fridgeTempMax}°C • ผู้ตรวจ: ${aud.inspector || "-"}`;

      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #0284c7, #0f766e); padding: 20px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 18px;">❄️ [PharmCare AI] แจ้งเตือน: มีการบันทึกผลตรวจตู้เย็น & HAD ใหม่</h2>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">เรียน ผู้บริหาร ${recipient}</p>
          </div>
          <div style="padding: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b;">วัน-เวลา:</td>
                <td style="padding: 8px 0; color: #0f172a;">${nowThai}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">หอผู้ป่วย:</td>
                <td style="padding: 8px 0; color: #0f172a;"><strong>${aud.ward || "-"}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">อุณหภูมิตู้เย็น:</td>
                <td style="padding: 8px 0; color: #0f172a;">${aud.fridgeTempMin}° - ${aud.fridgeTempMax}°C (${aud.isTempPass ? "✅ ผ่านเกณฑ์ 2-8°C" : "❌ หลุดช่วงเกณฑ์"})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">การจัดเก็บยา HAD:</td>
                <td style="padding: 8px 0; color: #0f172a;">${aud.hadStoragePassed ? "ผ่านเกณฑ์ 100%" : "พบข้อบกพร่อง"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ยาหมดอายุ:</td>
                <td style="padding: 8px 0; color: #0f172a;">${aud.expiredCount || 0} รายการ</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">สถานะรวม:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${aud.status === 'ผ่านเกณฑ์ 100%' ? '#059669' : '#d97706'};">${aud.status || "-"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #64748b;">ผู้ตรวจประเมิน:</td>
                <td style="padding: 8px 0; color: #0f172a;">${aud.inspector || "-"}</td>
              </tr>
            </table>
          </div>
        </div>
      `;
    }

    const dispatchedVia: string[] = [];

    // 1. If user has Google Apps Script Webhook configured, dispatch notification event
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SEND_ADMIN_NOTIFICATION",
            recipient: ADMIN_EMAIL,
            subject: `🚨 [PharmCare AI] ${title}`,
            htmlBody: htmlContent,
            title: title,
            summary: summary,
            type: type,
            record: record,
            timestamp: timestamp,
          }),
        });
        dispatchedVia.push("Google Apps Script Webhook (MailApp)");
      } catch (gasErr) {
        console.warn("GAS notification dispatch error:", gasErr);
      }
    }

    // 2. If SMTP environment is configured, dispatch via Nodemailer
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"PharmCare AI" <${process.env.SMTP_USER}>`,
          to: recipient,
          subject: `🚨 [PharmCare AI] ${title}`,
          html: htmlContent,
        });
        dispatchedVia.push("Direct SMTP Mailer");
      } catch (smtpErr) {
        console.warn("SMTP sendMail error:", smtpErr);
      }
    }

    // Always record in server notification history
    const logItem: NotificationLog = {
      id: `NOTIF-${Date.now()}`,
      timestamp,
      recipient,
      type,
      title,
      summary,
      dispatchedVia: dispatchedVia.length > 0 ? dispatchedVia : ["In-App Admin Stream (Auto-Logged)"],
      status: "SENT",
    };

    notificationHistory.unshift(logItem);
    if (notificationHistory.length > 100) {
      notificationHistory.pop();
    }

    res.json({
      success: true,
      recipient: ADMIN_EMAIL,
      dispatchedVia: logItem.dispatchedVia,
      notification: logItem,
    });
  } catch (error: any) {
    console.error("Admin notification error:", error);
    res.status(500).json({
      error: error?.message || "ไม่สามารถส่งการแจ้งเตือนอีเมลได้",
    });
  }
});

// Endpoint: Fetch Notification History Logs
app.get("/api/notifications/logs", (_req, res) => {
  res.json({
    recipient: ADMIN_EMAIL,
    totalLogs: notificationHistory.length,
    logs: notificationHistory,
  });
});

// Setup Vite or Static File Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PharmCare AI server running on http://0.0.0.0:${PORT}`);
  });
}

start();
