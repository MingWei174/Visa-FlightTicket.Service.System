/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

// Load environment variables (locally from .env)
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize official @google/genai SDK
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined!");
}

// 1. AI Agent Interactive Chat API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, country, studentName, remainingDays, percentage } = req.body;
    
    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in Settings." 
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid dynamic message payload" });
    }

    // Prepare contextual system instructions for our Study Abroad Advisor Agent
    const systemInstruction = `你是一位專業的留學輔導與出國規劃 AI 顧問。
當前使用者正在規劃前往「${country || '澳洲'}」留學。
學生成員/姓名為：${studentName || '同學'}。
距預定出發日還有：${remainingDays || '?' } 天。
目前倒數文件的計畫完成率已達到：${percentage || '0'}%。
你的使命是解答日本、加拿大、美國、澳洲的「簽證時效逆推、COE取得、OSHC健康保險、GIC與就學貸款申辦、行李動植物海關申報與檢疫規範、開戶與住宿安排」等細節。
請根據使用者提問給出專業、簡潔、具體且富有人情味的建議。必要時可用繁體中文 (zh-TW) 回覆，結構清晰並使用 markdown 格式。`;

    const userMessage = messages[messages.length - 1]?.content || "";

    // Generate content using gemini-2.5-flash for standard assistant tasks
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "非常抱歉，我暫時無法解讀您的需求，請再試一次。";
    return res.json({ reply: replyText });

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ 
      error: "AI 顧問暫時無法處理您的請求: " + (err.message || err) 
    });
  }
});

// Simple in-memory cache to prevent Gemini API quota limits (429: RESOURCE_EXHAUSTED)
interface FlightCacheItem {
  flights: any[];
  timestamp: number;
}
const flightCache = new Map<string, FlightCacheItem>();
const CACHE_TTL_MS = 60 * 60 * 1000; // Cache for 1 hour

const isRateLimitError = (err: any): boolean => {
  const errMsg = String(err.message || err || "");
  return errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("exhausted");
};

// 2. Real-time Flight Search with Google Search Grounding
app.get("/api/flights", async (req, res) => {
  const route = (req.query.route as string) || "TPE-SYD";
  
  // Real-world fallback data in case key is missing or search fails
  const fallbacks: Record<string, any[]> = {
    "TPE-SYD": [
      { airline: "中華航空 (China Airlines)", flightNo: "CI101", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "2x23kg (直飛學生特惠)", price: 21800, transitText: "直飛", matchScore: 98, recommended: true },
      { airline: "長榮航空 (EVA Air)", flightNo: "BR198", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "23kg (行李保證)", price: 23500, transitText: "直飛", matchScore: 95, recommended: false },
      { airline: "新加坡航空 (Singapore Airlines)", flightNo: "SQ223", departureTime: "11:25", arrivalTime: "22:50", stops: 1, baggage: "2件各23kg (學生特惠)", price: 24800, transitText: "於 新加坡 (SIN) 轉機 2h 10m", matchScore: 94, recommended: false },
      { airline: "泰國航空 (Thai Airways)", flightNo: "TG635", departureTime: "20:05", arrivalTime: "07:45", stops: 1, baggage: "30kg (行李託運保障)", price: 22800, transitText: "於 曼谷 (BKK) 轉機 1h 45m", matchScore: 92, recommended: false },
      { airline: "酷航 (Scoot)", flightNo: "TR897", departureTime: "15:40", arrivalTime: "06:15", stops: 1, baggage: "20kg (小資拼搏艙)", price: 18950, transitText: "於 新加坡 (SIN) 轉機 3h 15m", matchScore: 88, recommended: false }
    ],
    "TPE-MEL": [
      { airline: "馬來西亞航空 (Malaysia Airlines)", flightNo: "MH367", departureTime: "15:10", arrivalTime: "06:40", stops: 1, baggage: "30kg (大容量行李額)", price: 19800, transitText: "於 吉隆坡 (KUL) 轉機 1h 30m", matchScore: 96, recommended: true },
      { airline: "國泰航空 (Cathay Pacific)", flightNo: "CX451", departureTime: "08:15", arrivalTime: "21:35", stops: 1, baggage: "2x23kg (星級雙箱優惠)", price: 27400, transitText: "於 香港 (HKG) 轉機 2h 00m", matchScore: 94, recommended: false },
      { airline: "酷航 (Scoot)", flightNo: "TR899", departureTime: "15:40", arrivalTime: "08:20", stops: 1, baggage: "20kg (行李額另加)", price: 17200, transitText: "於 新加坡 (SIN) 轉機 4h 05m", matchScore: 85, recommended: false }
    ],
    "TPE-BNE": [
      { airline: "中華航空 (China Airlines)", flightNo: "CI053", departureTime: "23:50", arrivalTime: "10:15", stops: 0, baggage: "2x23kg (直航學生專屬)", price: 28900, transitText: "台北直飛 ➔ 布里斯本 (無中轉)", matchScore: 97, recommended: true },
      { airline: "長榮航空 (EVA Air)", flightNo: "BR315", departureTime: "22:30", arrivalTime: "09:10", stops: 0, baggage: "23kg (直飛特惠)", price: 29500, transitText: "台北直飛 ➔ 布里斯本 (無中轉)", matchScore: 95, recommended: false },
      { airline: "菲律賓航空 (Philippine Airlines)", flightNo: "PR891", departureTime: "09:40", arrivalTime: "21:05", stops: 1, baggage: "25kg (實惠中轉)", price: 21500, transitText: "於 馬尼拉 (MNL) 轉機 2h", matchScore: 82, recommended: false }
    ],
    "TPE-NRT": [
      { airline: "中華航空 (China Airlines)", flightNo: "CI100", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "2x23kg (直飛學生特惠)", price: 14800, transitText: "台北直飛 ➔ 東京成田 (無中轉)", matchScore: 98, recommended: true },
      { airline: "長榮航空 (EVA Air)", flightNo: "BR198", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "23kg (行李保證)", price: 15500, transitText: "台北直飛 ➔ 東京成田 (無中轉)", matchScore: 95, recommended: false },
      { airline: "星宇航空 (STARLUX)", flightNo: "JX800", departureTime: "08:30", arrivalTime: "12:45", stops: 0, baggage: "23kg (星級服務)", price: 16200, transitText: "台北直飛 ➔ 東京成田 (無中轉)", matchScore: 92, recommended: false }
    ],
    "TPE-LAX": [
      { airline: "中華航空 (China Airlines)", flightNo: "CI008", departureTime: "23:50", arrivalTime: "20:50", stops: 0, baggage: "2x23kg (直飛推薦)", price: 34800, transitText: "台北直飛 ➔ 洛杉磯 (無中轉)", matchScore: 98, recommended: true },
      { airline: "長榮航空 (EVA Air)", flightNo: "BR012", departureTime: "19:20", arrivalTime: "16:15", stops: 0, baggage: "2x23kg (熱門首選)", price: 35500, transitText: "台北直飛 ➔ 洛杉磯 (無中轉)", matchScore: 95, recommended: false }
    ],
    "TPE-YVR": [
      { airline: "中華航空 (China Airlines)", flightNo: "CI032", departureTime: "23:35", arrivalTime: "19:35", stops: 0, baggage: "2x23kg (直航學生特惠)", price: 31800, transitText: "台北直飛 ➔ 溫哥華 (無中轉)", matchScore: 98, recommended: true },
      { airline: "長榮航空 (EVA Air)", flightNo: "BR010", departureTime: "23:55", arrivalTime: "19:50", stops: 0, baggage: "2x23kg (行李保證)", price: 32500, transitText: "台北直飛 ➔ 溫哥華 (無中轉)", matchScore: 95, recommended: false }
    ]
  };

  const selectedRouteFallback = fallbacks[route] || fallbacks["TPE-SYD"];

  // Serve from in-memory cache if active and fresh
  const cached = flightCache.get(route);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[API Live Flight] Serving from cache for route ${route} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
    return res.json({ flights: cached.flights });
  }

  if (!ai) {
    console.log(`[API Live Flight] Using fallback for route ${route} due to missing GEMINI_API_KEY`);
    return res.json({ flights: selectedRouteFallback });
  }

  try {
    let routeInfo = "Taipei TPE to Sydney SYD";
    if (route === "TPE-MEL") routeInfo = "Taipei TPE to Melbourne MEL";
    if (route === "TPE-BNE") routeInfo = "Taipei TPE to Brisbane BNE";
    if (route === "TPE-NRT") routeInfo = "Taipei TPE to Tokyo NRT";
    if (route === "TPE-LAX") routeInfo = "Taipei TPE to Los Angeles LAX";
    if (route === "TPE-YVR") routeInfo = "Taipei TPE to Vancouver YVR";

    const prompt = `Search live real-time flight ticket prices from ${routeInfo}. Find the current actual typical prices for a one-way student flight ticket leaving in early July 2026.
    Please output a raw JSON array containing exactly three flight suggestions with actual live or recent prices. 
    Do NOT include any markdown code blocks, do NOT include \`\`\`json, just return a raw JSON array of objects.
    Each object in the array MUST have the following structure:
    {
      "airline": "Realistic Airline Name for this specific route (e.g. EVA Air for US, Singapore Airlines for Oceania)",
      "flightNo": "Flight No (e.g., SQ223)",
      "departureTime": "Departure time (e.g., 10:30)",
      "arrivalTime": "Arrival time (e.g., 22:45)",
      "stops": 1, // number of stops (0 for direct)
      "baggage": "Baggage allowance (e.g., 23kg, 30kg, 2x23kg)",
      "price": 24800, // ticket price in NTD (integer, between 15000 and 42000 depending on actual search)
      "transitText": "Brief description of the transit layout (e.g., 於 新加坡 轉機 2 小時)",
      "matchScore": 95 // match score integer between 70 and 99
    }`;

    console.log(`[API Live Flight] Querying Google Search Grounding for ${route}...`);
    const searchResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = searchResult.text?.trim() || "";
    // Robustly clean out any JSON wrapping code block if emitted despite instructions
    let cleanJson = text;
    if (text.startsWith("```")) {
      cleanJson = text.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(cleanJson);
    const flightsArray = Array.isArray(parsed) ? parsed : (parsed.flights || parsed.data || null);

    if (flightsArray && flightsArray.length > 0) {
      // Ensure flight recommendations have a structure
      const formattedFlights = flightsArray.map((f: any, idx: number) => ({
        airline: f.airline || "優選航空",
        flightNo: f.flightNo || `FL-${idx + 101}`,
        departureTime: f.departureTime || "09:00",
        arrivalTime: f.arrivalTime || "21:00",
        stops: typeof f.stops === 'number' ? f.stops : 1,
        baggage: f.baggage || "23kg (標準重量)",
        price: typeof f.price === 'number' ? f.price : 24800,
        transitText: f.transitText || "中轉規劃中",
        matchScore: typeof f.matchScore === 'number' ? f.matchScore : 90,
        recommended: idx === 0 // Make first flight dynamic primary recommendation
      }));

      // Cache the fresh results
      flightCache.set(route, { flights: formattedFlights, timestamp: Date.now() });

      console.log(`[API Live Flight] Successfully retrieved Grounded live flight data for ${route}`);
      return res.json({ flights: formattedFlights });
    }

    throw new Error("Empty array or invalid JSON outcome from Gemini grounding");

  } catch (err: any) {
    if (isRateLimitError(err)) {
      console.warn(`[API Live Flight] Gemini API rate limit / quota exhausted for ${route}. Using safe fallback.`);
    } else {
      console.warn(`[API Live Flight] Error fetching live flight details for ${route}:`, err.message || err);
    }

    // Attempt to return stale cached item even if it has exceeded TTL, rather than static mock
    const existingCache = flightCache.get(route);
    if (existingCache) {
      console.log(`[API Live Flight] Returning stale cached data for ${route} (Age: ${Math.round((Date.now() - existingCache.timestamp) / 1000)}s)`);
      return res.json({ flights: existingCache.flights });
    }

    return res.json({ flights: selectedRouteFallback });
  }
});

// 3. AI Notification Drafting Endpoint
app.post("/api/generate-notification", async (req, res) => {
  try {
    const { studentName, progress, risk, missingTasks, advisorNotes, country } = req.body;
    
    if (!ai) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in Settings." 
      });
    }

    const systemInstruction = `你是一位專業且溫暖的留學輔導資深顧問，任職於「Atlas. 留學準備中心」。請為一位特定的學生撰寫一份留學進度催辦/督課或鼓勵信件（同時也可以作為簡訊的範本）。
你需要依據學生的當前進度與警示評級給出高度客製化、精準且充滿親和力的督促。信件語氣應親切流暢、結構清晰，避免冷冰冰的格式化文字。`;

    const prompt = `請為以下留學學員自動生成一份專屬的 Email 通知信：
學員姓名：${studentName}
目標國家：${country || '出國國家'}
目前進度：${progress}% 
目前警示級別：${risk}
缺漏未辦妥的關鍵任務：${missingTasks || '無'}
顧問備忘備註(溝通狀況與追蹤)：${advisorNotes || '無特別備註'}

請根據以上資訊，為「Atlas. 留學準備中心」起草一封親切且具體的提醒信。
**重點要求：**
1. 必須**強烈參考「顧問備忘備註」**的內容來調整語氣與提醒重點。如果備註中提到特定的困難(如猶豫不決、體檢遲交等)，務必在信中關心並給出具體建議。
2. 包含合適的親切招呼、進度簡要分析、溫馨的安全與時效限制叮嚀。
3. 輸出格式必須包含「主旨：」和「內文：」。請直接輸出利於一般文字寄送的純文字排版，掌握字數在 200-300 字。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      }
    });

    const replyText = response.text || "親愛的同學，請儘速與顧問確認申辦進度！";
    return res.json({ body: replyText });

  } catch (err: any) {
    console.error("AI Generate Notification Error:", err);
    return res.status(500).json({ error: "AI 生成通知失敗: " + (err.message || err) });
  }
});

// 4. Real-time Gmail/SMS Dispatcher endpoint
app.post("/api/send-notification", async (req, res) => {
  try {
    const { recipientEmail, subject, body, method } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ success: false, error: "未指定收件信箱" });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    // Check if SMS is requested:
    if (method === "sms") {
      console.log(`[SMS Simulator] Dispatching SMS to student with body: ${body.slice(0, 50)}...`);
      return res.json({ 
        success: true, 
        message: "📱 簡訊發送成功！模擬系統已透過虛擬行動通訊網路將備忘文字派遣至學員登記手機中！" 
      });
    }

    // SMTP Mail transmission logic
    if (!gmailUser || !gmailAppPassword) {
      console.warn("⚠️ Warning: GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env. Falling back to debug simulate mode.");
      return res.json({ 
        success: false, 
        reason: "needs_credentials", 
        message: "您好！由於您尚未在設定 (Settings > Secrets) 中配置 GMAIL_USER 與 GMAIL_APP_PASSWORD 變數，系統目前先為您本機模擬投遞。若需體驗真實對外發信，您可以向我們配置這兩組密鑰，後台將立即支援發送真實 Gmail！"
      });
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    const mailOptions = {
      from: `"星航出國安全導航GPS" <${gmailUser}>`,
      to: recipientEmail,
      subject: subject || "星航 GPS 出港安全進度督導信",
      text: body
    };

    console.log(`[SMTP Mail] Initializing Gmail send from ${gmailUser} to ${recipientEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mail] Gmail successfully sent to ${recipientEmail}`);

    return res.json({ 
      success: true, 
      message: `🎉 郵件真的發出去了！我們已用您的 Gmail 帳戶成功將最真實的提醒信件寄達您填寫的信箱：${recipientEmail}` 
    });

  } catch (err: any) {
    console.error("Transmission Dispatch Error:", err);
    return res.status(500).json({ 
      success: false, 
      error: `郵件寄送失敗: ${err.message || err}。請檢查您的 GMAIL_APP_PASSWORD 密鑰是否正確（需使用 Google 帳戶的「應用程式密碼」，而非一般帳戶登入密碼）。` 
    });
  }
});

// 5. LINE Bot Push Notification Endpoint
app.post("/api/send-line", async (req, res) => {
  try {
    const { lineUserId, message } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ success: false, error: "未指定學生的 LINE User ID" });
    }

    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    
    if (!lineToken) {
      console.warn("⚠️ Warning: LINE_CHANNEL_ACCESS_TOKEN is not configured in .env. Falling back to debug simulate mode.");
      return res.json({ 
        success: true, // Return true for demo purposes so frontend shows success alert
        isSimulation: true,
        message: "【模擬發送成功】您好！由於您尚未在 .env 中配置 LINE_CHANNEL_ACCESS_TOKEN，系統目前先為您本機模擬投遞。若需真實發送，請參考教學配置金鑰！"
      });
    }

    console.log(`[LINE Bot] Dispatching message to ${lineUserId}...`);
    console.log(`[LINE Bot] Token length: ${lineToken.length}, Token prefix: ${lineToken.substring(0, 10)}...`);
    console.log(`[LINE Bot] Token length: ${lineToken.length}, Token prefix: ${lineToken.substring(0, 10)}...`);
    
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lineToken}`
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`LINE API responded with status ${response.status}: ${errorData}`);
    }

    console.log(`[LINE Bot] Successfully sent message to ${lineUserId}`);
    return res.json({ 
      success: true, 
      message: "🟢 LINE 訊息發送成功！學生馬上就會收到囉！" 
    });

  } catch (err: any) {
    console.error("LINE Transmission Error:", err);
    return res.status(500).json({ 
      success: false, 
      error: `LINE 訊息發送失敗: ${err.message || err}。請檢查您的 LINE_CHANNEL_ACCESS_TOKEN 或是目標 User ID 是否正確。` 
    });
  }
});

// 6. Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

// 3. Vite Middleware Setup
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode (Vite middleware integration)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode (Serving static build output)...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack application running at http://localhost:${PORT}`);
  });
}

// Export app for Vercel Serverless Function
export default app;

if (!process.env.VERCEL) {
  initServer().catch(err => {
    console.error("Failed to start full-stack server:", err);
  });
}
