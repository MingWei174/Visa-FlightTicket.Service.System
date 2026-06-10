# AI 協作開發歷程紀錄 (AI Collaboration Log)

**專案名稱**：留學機票與學生簽證智慧服務系統
**開發環境**：本機端 Gemini (Antigravity IDE)
**備註**：因在 antigravity 中的 本機端 Gemini 無法直接產生對話分享連結，故將開發過程中的關鍵 Prompt 與 AI 協作歷程整理於此，供助教與老師參閱。

---

## 階段一：專案架構重構與 Firebase 資料庫導入

**🧑‍💻 學生 Prompt：**
> 「我需要將目前的單機版 React 專案，改成有真實後端資料庫的架構。請幫我導入 Firebase Firestore，並實作即時存檔機制。當學生修改國家、學校或出航日，系統要立刻寫入資料庫，重新整理後不能跑掉。」

**🤖 AI 回應與協作重點：**
1. **設定 Firebase：** 協助建立 `firebase.ts`，並使用 `doc`, `setDoc`, `getDoc` 實作資料的讀寫。
2. **狀態管理重構：** 將原本寫死在 `localStorage` 的邏輯移除，改為透過 Firebase `uid` 綁定學生資料。
3. **自動存檔機制：** 在 `StudentOnboardingForm` 與設定面板中加入非同步存檔邏輯，確保每次欄位變動都能即時同步至雲端。

---

## 階段二：雙視角介面 (學生端 vs 顧問端) 與情境切換 Bug 修正

**🧑‍💻 學生 Prompt：**
> 「我每次登入管理員帳號要切到我建的學生視角時，都要填一次註冊資料。另外，我在後台點選某一位要去澳洲的學生，切到『顧問政策研究 A.I. 助手』時，AI 還是以為我要去日本（讀取到管理員自己的資料），造成資料衝突。」

**🤖 AI 回應與協作重點：**
1. **修復重複註冊問題：** 修改 `App.tsx` 中的權限判斷，將「讀取學生資料」的機制改為全體適用，讓管理員切換視角時也能直接讀取已建檔的進度。
2. **解決狀態衝突 (State Conflict)：** 發現 `AIAgent` 元件錯誤地讀取了 `globalCountry`（管理員自身的國家）。AI 協助重構了 `AdvisorDashboard`，透過 `initialActiveStudent` 傳遞目前**被選取的學生**狀態，並讓 Header 與 AI 助手動態訂閱該學生的目的地與出航日，成功分離了「管理員自身設定」與「目前查閱的學生進度」。

---

## 階段三：串接外部 API (維基百科與名校探索)

**🧑‍💻 學生 Prompt：**
> 「關於姊妹校的圖片跟介紹，請不要每間都寫一樣，幫我串接維基百科 API 抓取真實的圖片與介紹。另外，全球探索框點擊畫面其他地方要能收起來。」

**🤖 AI 回應與協作重點：**
1. **實作 Wikipedia API：** 在 `UniversityService.ts` 中加入 `fetch('https://zh.wikipedia.org/api/rest_v1/page/summary/...')`。若中文維基無資料，則自動 fallback 到英文維基。
2. **處理 UI 互動：** 利用 React 的 `useEffect` 監聽滑鼠點擊事件 (Outside Click)，解決了下拉選單無法收起的問題。
3. **優化圖片顯示：** 當維基百科缺少圖片時，加入 `picsum.photos` 與 `unsplash` 作為預設的 Fallback 圖片，確保畫面版面不會破裂。

---

## 階段四：GitHub Pages 部屬與 Mixed Content 除錯

**🧑‍💻 學生 Prompt：**
> 「為何部屬到 github 後產出網址，點進去卻是一片白畫面？後來解決白畫面後，又發現本地端可以看的到其他名校，而部署到 github 上卻顯示『查無相符的大學』？」

**🤖 AI 回應與協作重點：**
1. **解決白屏問題 (Vite Base Path)：** AI 診斷出 Vite 打包時缺少了 `base` 路徑。協助在 `vite.config.ts` 中加入 `base: '/Visa-FlightTicket.Service.System/'`。
2. **自動化 CI/CD 部屬：** 指導並撰寫了 GitHub Actions 腳本 (`.github/workflows/deploy.yml`) 以及 `gh-pages` 部署套件的配置，讓學生只需下達 `npm run deploy` 即可自動發布。
3. **解決 Mixed Content 安全性阻擋：** AI 分析出 Hipolabs 測試 API 僅支援 `HTTP`，而 GitHub Pages 強制使用 `HTTPS`，導致 API 被瀏覽器阻擋。AI 協助引入了 `corsproxy.io` 中繼代理伺服器，將 HTTP 請求包裝為 HTTPS，完美解決了線上版無法搜尋名校的 Bug。

---

## 總結

透過這次與 AI 的深度協作，專案不僅成功從單機版升級為具備真實資料庫的雲端系統，更在解決**「React 狀態管理衝突」**與**「前端網頁部屬 (CORS / Mixed Content)」**等真實世界常見的工程問題上，獲得了極大的學習成效。AI 在此過程中扮演了資深工程師的角色，引導並解釋每一行程式碼背後的邏輯。
