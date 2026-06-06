var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_nodemailer = __toESM(require("nodemailer"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("\u26A0\uFE0F Warning: GEMINI_API_KEY environment variable is not defined!");
}
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
    const systemInstruction = `\u4F60\u662F\u4E00\u4F4D\u5C08\u696D\u7684\u7559\u5B78\u8F14\u5C0E\u8207\u51FA\u570B\u898F\u5283 AI \u9867\u554F\u3002
\u7576\u524D\u4F7F\u7528\u8005\u6B63\u5728\u898F\u5283\u524D\u5F80\u300C${country || "\u6FB3\u6D32"}\u300D\u7559\u5B78\u3002
\u5B78\u751F\u6210\u54E1/\u59D3\u540D\u70BA\uFF1A${studentName || "\u540C\u5B78"}\u3002
\u8DDD\u9810\u5B9A\u51FA\u767C\u65E5\u9084\u6709\uFF1A${remainingDays || "?"} \u5929\u3002
\u76EE\u524D\u5012\u6578\u6587\u4EF6\u7684\u8A08\u756B\u5B8C\u6210\u7387\u5DF2\u9054\u5230\uFF1A${percentage || "0"}%\u3002
\u4F60\u7684\u4F7F\u547D\u662F\u89E3\u7B54\u65E5\u672C\u3001\u52A0\u62FF\u5927\u3001\u7F8E\u570B\u3001\u6FB3\u6D32\u7684\u300C\u7C3D\u8B49\u6642\u6548\u9006\u63A8\u3001COE\u53D6\u5F97\u3001OSHC\u5065\u5EB7\u4FDD\u96AA\u3001GIC\u8207\u5C31\u5B78\u8CB8\u6B3E\u7533\u8FA6\u3001\u884C\u674E\u52D5\u690D\u7269\u6D77\u95DC\u7533\u5831\u8207\u6AA2\u75AB\u898F\u7BC4\u3001\u958B\u6236\u8207\u4F4F\u5BBF\u5B89\u6392\u300D\u7B49\u7D30\u7BC0\u3002
\u8ACB\u6839\u64DA\u4F7F\u7528\u8005\u63D0\u554F\u7D66\u51FA\u5C08\u696D\u3001\u7C21\u6F54\u3001\u5177\u9AD4\u4E14\u5BCC\u6709\u4EBA\u60C5\u5473\u7684\u5EFA\u8B70\u3002\u5FC5\u8981\u6642\u53EF\u7528\u7E41\u9AD4\u4E2D\u6587 (zh-TW) \u56DE\u8986\uFF0C\u7D50\u69CB\u6E05\u6670\u4E26\u4F7F\u7528 markdown \u683C\u5F0F\u3002`;
    const userMessage = messages[messages.length - 1]?.content || "";
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    const replyText = response.text || "\u975E\u5E38\u62B1\u6B49\uFF0C\u6211\u66AB\u6642\u7121\u6CD5\u89E3\u8B80\u60A8\u7684\u9700\u6C42\uFF0C\u8ACB\u518D\u8A66\u4E00\u6B21\u3002";
    return res.json({ reply: replyText });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: "AI \u9867\u554F\u66AB\u6642\u7121\u6CD5\u8655\u7406\u60A8\u7684\u8ACB\u6C42: " + (err.message || err)
    });
  }
});
var flightCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 60 * 60 * 1e3;
var isRateLimitError = (err) => {
  const errMsg = String(err.message || err || "");
  return errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("exhausted");
};
app.get("/api/flights", async (req, res) => {
  const route = req.query.route || "TPE-SYD";
  const fallbacks = {
    "TPE-SYD": [
      { airline: "\u4E2D\u83EF\u822A\u7A7A (China Airlines)", flightNo: "CI101", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "2x23kg (\u76F4\u98DB\u5B78\u751F\u7279\u60E0)", price: 21800, transitText: "\u76F4\u98DB", matchScore: 98, recommended: true },
      { airline: "\u9577\u69AE\u822A\u7A7A (EVA Air)", flightNo: "BR198", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "23kg (\u884C\u674E\u4FDD\u8B49)", price: 23500, transitText: "\u76F4\u98DB", matchScore: 95, recommended: false },
      { airline: "\u65B0\u52A0\u5761\u822A\u7A7A (Singapore Airlines)", flightNo: "SQ223", departureTime: "11:25", arrivalTime: "22:50", stops: 1, baggage: "2\u4EF6\u540423kg (\u5B78\u751F\u7279\u60E0)", price: 24800, transitText: "\u65BC \u65B0\u52A0\u5761 (SIN) \u8F49\u6A5F 2h 10m", matchScore: 94, recommended: false },
      { airline: "\u6CF0\u570B\u822A\u7A7A (Thai Airways)", flightNo: "TG635", departureTime: "20:05", arrivalTime: "07:45", stops: 1, baggage: "30kg (\u884C\u674E\u8A17\u904B\u4FDD\u969C)", price: 22800, transitText: "\u65BC \u66FC\u8C37 (BKK) \u8F49\u6A5F 1h 45m", matchScore: 92, recommended: false },
      { airline: "\u9177\u822A (Scoot)", flightNo: "TR897", departureTime: "15:40", arrivalTime: "06:15", stops: 1, baggage: "20kg (\u5C0F\u8CC7\u62FC\u640F\u8259)", price: 18950, transitText: "\u65BC \u65B0\u52A0\u5761 (SIN) \u8F49\u6A5F 3h 15m", matchScore: 88, recommended: false }
    ],
    "TPE-MEL": [
      { airline: "\u99AC\u4F86\u897F\u4E9E\u822A\u7A7A (Malaysia Airlines)", flightNo: "MH367", departureTime: "15:10", arrivalTime: "06:40", stops: 1, baggage: "30kg (\u5927\u5BB9\u91CF\u884C\u674E\u984D)", price: 19800, transitText: "\u65BC \u5409\u9686\u5761 (KUL) \u8F49\u6A5F 1h 30m", matchScore: 96, recommended: true },
      { airline: "\u570B\u6CF0\u822A\u7A7A (Cathay Pacific)", flightNo: "CX451", departureTime: "08:15", arrivalTime: "21:35", stops: 1, baggage: "2x23kg (\u661F\u7D1A\u96D9\u7BB1\u512A\u60E0)", price: 27400, transitText: "\u65BC \u9999\u6E2F (HKG) \u8F49\u6A5F 2h 00m", matchScore: 94, recommended: false },
      { airline: "\u9177\u822A (Scoot)", flightNo: "TR899", departureTime: "15:40", arrivalTime: "08:20", stops: 1, baggage: "20kg (\u884C\u674E\u984D\u53E6\u52A0)", price: 17200, transitText: "\u65BC \u65B0\u52A0\u5761 (SIN) \u8F49\u6A5F 4h 05m", matchScore: 85, recommended: false }
    ],
    "TPE-BNE": [
      { airline: "\u4E2D\u83EF\u822A\u7A7A (China Airlines)", flightNo: "CI053", departureTime: "23:50", arrivalTime: "10:15", stops: 0, baggage: "2x23kg (\u76F4\u822A\u5B78\u751F\u5C08\u5C6C)", price: 28900, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u5E03\u91CC\u65AF\u672C (\u7121\u4E2D\u8F49)", matchScore: 97, recommended: true },
      { airline: "\u9577\u69AE\u822A\u7A7A (EVA Air)", flightNo: "BR315", departureTime: "22:30", arrivalTime: "09:10", stops: 0, baggage: "23kg (\u76F4\u98DB\u7279\u60E0)", price: 29500, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u5E03\u91CC\u65AF\u672C (\u7121\u4E2D\u8F49)", matchScore: 95, recommended: false },
      { airline: "\u83F2\u5F8B\u8CD3\u822A\u7A7A (Philippine Airlines)", flightNo: "PR891", departureTime: "09:40", arrivalTime: "21:05", stops: 1, baggage: "25kg (\u5BE6\u60E0\u4E2D\u8F49)", price: 21500, transitText: "\u65BC \u99AC\u5C3C\u62C9 (MNL) \u8F49\u6A5F 2h", matchScore: 82, recommended: false }
    ],
    "TPE-NRT": [
      { airline: "\u4E2D\u83EF\u822A\u7A7A (China Airlines)", flightNo: "CI100", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "2x23kg (\u76F4\u98DB\u5B78\u751F\u7279\u60E0)", price: 14800, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6771\u4EAC\u6210\u7530 (\u7121\u4E2D\u8F49)", matchScore: 98, recommended: true },
      { airline: "\u9577\u69AE\u822A\u7A7A (EVA Air)", flightNo: "BR198", departureTime: "08:50", arrivalTime: "13:15", stops: 0, baggage: "23kg (\u884C\u674E\u4FDD\u8B49)", price: 15500, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6771\u4EAC\u6210\u7530 (\u7121\u4E2D\u8F49)", matchScore: 95, recommended: false },
      { airline: "\u661F\u5B87\u822A\u7A7A (STARLUX)", flightNo: "JX800", departureTime: "08:30", arrivalTime: "12:45", stops: 0, baggage: "23kg (\u661F\u7D1A\u670D\u52D9)", price: 16200, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6771\u4EAC\u6210\u7530 (\u7121\u4E2D\u8F49)", matchScore: 92, recommended: false }
    ],
    "TPE-LAX": [
      { airline: "\u4E2D\u83EF\u822A\u7A7A (China Airlines)", flightNo: "CI008", departureTime: "23:50", arrivalTime: "20:50", stops: 0, baggage: "2x23kg (\u76F4\u98DB\u63A8\u85A6)", price: 34800, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6D1B\u6749\u78EF (\u7121\u4E2D\u8F49)", matchScore: 98, recommended: true },
      { airline: "\u9577\u69AE\u822A\u7A7A (EVA Air)", flightNo: "BR012", departureTime: "19:20", arrivalTime: "16:15", stops: 0, baggage: "2x23kg (\u71B1\u9580\u9996\u9078)", price: 35500, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6D1B\u6749\u78EF (\u7121\u4E2D\u8F49)", matchScore: 95, recommended: false }
    ],
    "TPE-YVR": [
      { airline: "\u4E2D\u83EF\u822A\u7A7A (China Airlines)", flightNo: "CI032", departureTime: "23:35", arrivalTime: "19:35", stops: 0, baggage: "2x23kg (\u76F4\u822A\u5B78\u751F\u7279\u60E0)", price: 31800, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6EAB\u54E5\u83EF (\u7121\u4E2D\u8F49)", matchScore: 98, recommended: true },
      { airline: "\u9577\u69AE\u822A\u7A7A (EVA Air)", flightNo: "BR010", departureTime: "23:55", arrivalTime: "19:50", stops: 0, baggage: "2x23kg (\u884C\u674E\u4FDD\u8B49)", price: 32500, transitText: "\u53F0\u5317\u76F4\u98DB \u2794 \u6EAB\u54E5\u83EF (\u7121\u4E2D\u8F49)", matchScore: 95, recommended: false }
    ]
  };
  const selectedRouteFallback = fallbacks[route] || fallbacks["TPE-SYD"];
  const cached = flightCache.get(route);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[API Live Flight] Serving from cache for route ${route} (${Math.round((Date.now() - cached.timestamp) / 1e3)}s old)`);
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
      "transitText": "Brief description of the transit layout (e.g., \u65BC \u65B0\u52A0\u5761 \u8F49\u6A5F 2 \u5C0F\u6642)",
      "matchScore": 95 // match score integer between 70 and 99
    }`;
    console.log(`[API Live Flight] Querying Google Search Grounding for ${route}...`);
    const searchResult = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    const text = searchResult.text?.trim() || "";
    let cleanJson = text;
    if (text.startsWith("```")) {
      cleanJson = text.replace(/```json|```/g, "").trim();
    }
    const parsed = JSON.parse(cleanJson);
    const flightsArray = Array.isArray(parsed) ? parsed : parsed.flights || parsed.data || null;
    if (flightsArray && flightsArray.length > 0) {
      const formattedFlights = flightsArray.map((f, idx) => ({
        airline: f.airline || "\u512A\u9078\u822A\u7A7A",
        flightNo: f.flightNo || `FL-${idx + 101}`,
        departureTime: f.departureTime || "09:00",
        arrivalTime: f.arrivalTime || "21:00",
        stops: typeof f.stops === "number" ? f.stops : 1,
        baggage: f.baggage || "23kg (\u6A19\u6E96\u91CD\u91CF)",
        price: typeof f.price === "number" ? f.price : 24800,
        transitText: f.transitText || "\u4E2D\u8F49\u898F\u5283\u4E2D",
        matchScore: typeof f.matchScore === "number" ? f.matchScore : 90,
        recommended: idx === 0
        // Make first flight dynamic primary recommendation
      }));
      flightCache.set(route, { flights: formattedFlights, timestamp: Date.now() });
      console.log(`[API Live Flight] Successfully retrieved Grounded live flight data for ${route}`);
      return res.json({ flights: formattedFlights });
    }
    throw new Error("Empty array or invalid JSON outcome from Gemini grounding");
  } catch (err) {
    if (isRateLimitError(err)) {
      console.warn(`[API Live Flight] Gemini API rate limit / quota exhausted for ${route}. Using safe fallback.`);
    } else {
      console.warn(`[API Live Flight] Error fetching live flight details for ${route}:`, err.message || err);
    }
    const existingCache = flightCache.get(route);
    if (existingCache) {
      console.log(`[API Live Flight] Returning stale cached data for ${route} (Age: ${Math.round((Date.now() - existingCache.timestamp) / 1e3)}s)`);
      return res.json({ flights: existingCache.flights });
    }
    return res.json({ flights: selectedRouteFallback });
  }
});
app.post("/api/generate-notification", async (req, res) => {
  try {
    const { studentName, progress, risk, missingTasks, advisorNotes, country } = req.body;
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key is not configured in the backend environment. Please set GEMINI_API_KEY in Settings."
      });
    }
    const systemInstruction = `\u4F60\u662F\u4E00\u4F4D\u5C08\u696D\u4E14\u6EAB\u6696\u7684\u7559\u5B78\u8F14\u5C0E\u8CC7\u6DF1\u9867\u554F\uFF0C\u4EFB\u8077\u65BC\u300CAtlas. \u7559\u5B78\u6E96\u5099\u4E2D\u5FC3\u300D\u3002\u8ACB\u70BA\u4E00\u4F4D\u7279\u5B9A\u7684\u5B78\u751F\u64B0\u5BEB\u4E00\u4EFD\u7559\u5B78\u9032\u5EA6\u50AC\u8FA6/\u7763\u8AB2\u6216\u9F13\u52F5\u4FE1\u4EF6\uFF08\u540C\u6642\u4E5F\u53EF\u4EE5\u4F5C\u70BA\u7C21\u8A0A\u7684\u7BC4\u672C\uFF09\u3002
\u4F60\u9700\u8981\u4F9D\u64DA\u5B78\u751F\u7684\u7576\u524D\u9032\u5EA6\u8207\u8B66\u793A\u8A55\u7D1A\u7D66\u51FA\u9AD8\u5EA6\u5BA2\u88FD\u5316\u3001\u7CBE\u6E96\u4E14\u5145\u6EFF\u89AA\u548C\u529B\u7684\u7763\u4FC3\u3002\u4FE1\u4EF6\u8A9E\u6C23\u61C9\u89AA\u5207\u6D41\u66A2\u3001\u7D50\u69CB\u6E05\u6670\uFF0C\u907F\u514D\u51B7\u51B0\u51B0\u7684\u683C\u5F0F\u5316\u6587\u5B57\u3002`;
    const prompt = `\u8ACB\u70BA\u4EE5\u4E0B\u7559\u5B78\u5B78\u54E1\u81EA\u52D5\u751F\u6210\u4E00\u4EFD\u5C08\u5C6C\u7684 Email \u901A\u77E5\u4FE1\uFF1A
\u5B78\u54E1\u59D3\u540D\uFF1A${studentName}
\u76EE\u6A19\u570B\u5BB6\uFF1A${country || "\u51FA\u570B\u570B\u5BB6"}
\u76EE\u524D\u9032\u5EA6\uFF1A${progress}% 
\u76EE\u524D\u8B66\u793A\u7D1A\u5225\uFF1A${risk}
\u7F3A\u6F0F\u672A\u8FA6\u59A5\u7684\u95DC\u9375\u4EFB\u52D9\uFF1A${missingTasks || "\u7121"}
\u9867\u554F\u5099\u5FD8\u5099\u8A3B(\u6E9D\u901A\u72C0\u6CC1\u8207\u8FFD\u8E64)\uFF1A${advisorNotes || "\u7121\u7279\u5225\u5099\u8A3B"}

\u8ACB\u6839\u64DA\u4EE5\u4E0A\u8CC7\u8A0A\uFF0C\u70BA\u300CAtlas. \u7559\u5B78\u6E96\u5099\u4E2D\u5FC3\u300D\u8D77\u8349\u4E00\u5C01\u89AA\u5207\u4E14\u5177\u9AD4\u7684\u63D0\u9192\u4FE1\u3002
**\u91CD\u9EDE\u8981\u6C42\uFF1A**
1. \u5FC5\u9808**\u5F37\u70C8\u53C3\u8003\u300C\u9867\u554F\u5099\u5FD8\u5099\u8A3B\u300D**\u7684\u5167\u5BB9\u4F86\u8ABF\u6574\u8A9E\u6C23\u8207\u63D0\u9192\u91CD\u9EDE\u3002\u5982\u679C\u5099\u8A3B\u4E2D\u63D0\u5230\u7279\u5B9A\u7684\u56F0\u96E3(\u5982\u7336\u8C6B\u4E0D\u6C7A\u3001\u9AD4\u6AA2\u9072\u4EA4\u7B49)\uFF0C\u52D9\u5FC5\u5728\u4FE1\u4E2D\u95DC\u5FC3\u4E26\u7D66\u51FA\u5177\u9AD4\u5EFA\u8B70\u3002
2. \u5305\u542B\u5408\u9069\u7684\u89AA\u5207\u62DB\u547C\u3001\u9032\u5EA6\u7C21\u8981\u5206\u6790\u3001\u6EAB\u99A8\u7684\u5B89\u5168\u8207\u6642\u6548\u9650\u5236\u53EE\u5680\u3002
3. \u8F38\u51FA\u683C\u5F0F\u5FC5\u9808\u5305\u542B\u300C\u4E3B\u65E8\uFF1A\u300D\u548C\u300C\u5167\u6587\uFF1A\u300D\u3002\u8ACB\u76F4\u63A5\u8F38\u51FA\u5229\u65BC\u4E00\u822C\u6587\u5B57\u5BC4\u9001\u7684\u7D14\u6587\u5B57\u6392\u7248\uFF0C\u638C\u63E1\u5B57\u6578\u5728 200-300 \u5B57\u3002`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85
      }
    });
    const replyText = response.text || "\u89AA\u611B\u7684\u540C\u5B78\uFF0C\u8ACB\u5118\u901F\u8207\u9867\u554F\u78BA\u8A8D\u7533\u8FA6\u9032\u5EA6\uFF01";
    return res.json({ body: replyText });
  } catch (err) {
    console.error("AI Generate Notification Error:", err);
    return res.status(500).json({ error: "AI \u751F\u6210\u901A\u77E5\u5931\u6557: " + (err.message || err) });
  }
});
app.post("/api/send-notification", async (req, res) => {
  try {
    const { recipientEmail, subject, body, method } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, error: "\u672A\u6307\u5B9A\u6536\u4EF6\u4FE1\u7BB1" });
    }
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (method === "sms") {
      console.log(`[SMS Simulator] Dispatching SMS to student with body: ${body.slice(0, 50)}...`);
      return res.json({
        success: true,
        message: "\u{1F4F1} \u7C21\u8A0A\u767C\u9001\u6210\u529F\uFF01\u6A21\u64EC\u7CFB\u7D71\u5DF2\u900F\u904E\u865B\u64EC\u884C\u52D5\u901A\u8A0A\u7DB2\u8DEF\u5C07\u5099\u5FD8\u6587\u5B57\u6D3E\u9063\u81F3\u5B78\u54E1\u767B\u8A18\u624B\u6A5F\u4E2D\uFF01"
      });
    }
    if (!gmailUser || !gmailAppPassword) {
      console.warn("\u26A0\uFE0F Warning: GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env. Falling back to debug simulate mode.");
      return res.json({
        success: false,
        reason: "needs_credentials",
        message: "\u60A8\u597D\uFF01\u7531\u65BC\u60A8\u5C1A\u672A\u5728\u8A2D\u5B9A (Settings > Secrets) \u4E2D\u914D\u7F6E GMAIL_USER \u8207 GMAIL_APP_PASSWORD \u8B8A\u6578\uFF0C\u7CFB\u7D71\u76EE\u524D\u5148\u70BA\u60A8\u672C\u6A5F\u6A21\u64EC\u6295\u905E\u3002\u82E5\u9700\u9AD4\u9A57\u771F\u5BE6\u5C0D\u5916\u767C\u4FE1\uFF0C\u60A8\u53EF\u4EE5\u5411\u6211\u5011\u914D\u7F6E\u9019\u5169\u7D44\u5BC6\u9470\uFF0C\u5F8C\u53F0\u5C07\u7ACB\u5373\u652F\u63F4\u767C\u9001\u771F\u5BE6 Gmail\uFF01"
      });
    }
    const transporter = import_nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });
    const mailOptions = {
      from: `"\u661F\u822A\u51FA\u570B\u5B89\u5168\u5C0E\u822AGPS" <${gmailUser}>`,
      to: recipientEmail,
      subject: subject || "\u661F\u822A GPS \u51FA\u6E2F\u5B89\u5168\u9032\u5EA6\u7763\u5C0E\u4FE1",
      text: body
    };
    console.log(`[SMTP Mail] Initializing Gmail send from ${gmailUser} to ${recipientEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mail] Gmail successfully sent to ${recipientEmail}`);
    return res.json({
      success: true,
      message: `\u{1F389} \u90F5\u4EF6\u771F\u7684\u767C\u51FA\u53BB\u4E86\uFF01\u6211\u5011\u5DF2\u7528\u60A8\u7684 Gmail \u5E33\u6236\u6210\u529F\u5C07\u6700\u771F\u5BE6\u7684\u63D0\u9192\u4FE1\u4EF6\u5BC4\u9054\u60A8\u586B\u5BEB\u7684\u4FE1\u7BB1\uFF1A${recipientEmail}`
    });
  } catch (err) {
    console.error("Transmission Dispatch Error:", err);
    return res.status(500).json({
      success: false,
      error: `\u90F5\u4EF6\u5BC4\u9001\u5931\u6557: ${err.message || err}\u3002\u8ACB\u6AA2\u67E5\u60A8\u7684 GMAIL_APP_PASSWORD \u5BC6\u9470\u662F\u5426\u6B63\u78BA\uFF08\u9700\u4F7F\u7528 Google \u5E33\u6236\u7684\u300C\u61C9\u7528\u7A0B\u5F0F\u5BC6\u78BC\u300D\uFF0C\u800C\u975E\u4E00\u822C\u5E33\u6236\u767B\u5165\u5BC6\u78BC\uFF09\u3002`
    });
  }
});
app.post("/api/send-line", async (req, res) => {
  try {
    const { lineUserId, message } = req.body;
    if (!lineUserId) {
      return res.status(400).json({ success: false, error: "\u672A\u6307\u5B9A\u5B78\u751F\u7684 LINE User ID" });
    }
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!lineToken) {
      console.warn("\u26A0\uFE0F Warning: LINE_CHANNEL_ACCESS_TOKEN is not configured in .env. Falling back to debug simulate mode.");
      return res.json({
        success: true,
        // Return true for demo purposes so frontend shows success alert
        isSimulation: true,
        message: "\u3010\u6A21\u64EC\u767C\u9001\u6210\u529F\u3011\u60A8\u597D\uFF01\u7531\u65BC\u60A8\u5C1A\u672A\u5728 .env \u4E2D\u914D\u7F6E LINE_CHANNEL_ACCESS_TOKEN\uFF0C\u7CFB\u7D71\u76EE\u524D\u5148\u70BA\u60A8\u672C\u6A5F\u6A21\u64EC\u6295\u905E\u3002\u82E5\u9700\u771F\u5BE6\u767C\u9001\uFF0C\u8ACB\u53C3\u8003\u6559\u5B78\u914D\u7F6E\u91D1\u9470\uFF01"
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
      message: "\u{1F7E2} LINE \u8A0A\u606F\u767C\u9001\u6210\u529F\uFF01\u5B78\u751F\u99AC\u4E0A\u5C31\u6703\u6536\u5230\u56C9\uFF01"
    });
  } catch (err) {
    console.error("LINE Transmission Error:", err);
    return res.status(500).json({
      success: false,
      error: `LINE \u8A0A\u606F\u767C\u9001\u5931\u6557: ${err.message || err}\u3002\u8ACB\u6AA2\u67E5\u60A8\u7684 LINE_CHANNEL_ACCESS_TOKEN \u6216\u662F\u76EE\u6A19 User ID \u662F\u5426\u6B63\u78BA\u3002`
    });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode (Vite middleware integration)...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode (Serving static build output)...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Full-stack application running at http://localhost:${PORT}`);
  });
}
initServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
