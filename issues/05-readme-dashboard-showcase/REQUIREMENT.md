# 需求規格書：README 專案說明與互動儀表板展示整合 (05-readme-dashboard-showcase)

## 1. 背景與目標 (Background & Goals)
- **背景**：專案目前已於 `docs/` 完成具備 Glassmorphism 現代科技深色美學的互動單頁資料科學儀表板（涵蓋演算法評估、特徵篩選、特徵數消長與關聯矩陣），但根目錄 `README.md` 目前為空，缺乏專案總覽、線上展示與操作指引。
- **目標**：撰寫專業、結構完整且具視覺吸引力的 `README.md`，納入 GitHub Pages 線上展示連結（含 Badges 徽章）、實體儀表板視覺預覽截圖、核心資料科學發現摘要、目錄架構與本地快速啟動說明。

## 2. 功能範圍 (Scope)

### 包含項目 (In Scope)
1. **GitHub Pages 線上展示連結與徽章**：
   - 整合 `https://chenglianghsu.github.io/AI-InfoSec-DIC2/` 線上網址。
   - 配置 Shields.io 視覺化動態徽章（Demo 狀態、Python 版本、技術棧、授權等）。
   - 提供 GitHub Pages 啟用引導說明（Settings -> Pages -> Deploy from /docs）。
2. **儀表板視覺展示 (Visual Showcase)**：
   - 使用真實瀏覽器開啟 `docs/index.html` 擷取高解析度全頁預覽截圖，儲存至 `docs/images/dashboard-preview.png`。
   - 於 `README.md` 嵌入預覽圖並配置點擊直達線上網站超連結。
3. **50-Startups 核心分析成果摘要**：
   - 演算法比較矩陣（OLS、Ridge、Lasso、ElasticNet）。
   - 循序前向選擇 (SFS) 特徵消長曲線與最佳特徵子集（2 特徵：`R&D Spend` + `Marketing Spend`，$R^2 \approx 0.9474$, RMSE $\approx 8198.80$）。
4. **專案架構與本地執行導覽**：
   - 說明 `src/`（模型與實驗程式碼）、`docs/`（前端展示儀表板）、`issues/`（工作流程紀錄）之目錄分工。
   - 提供本地預覽儀表板之靜態 HTTP 伺服器啟動指令（`python -m http.server`）與筆記本執行方式。

### 排除項目 (Out of Scope)
- 不改動 `docs/` 現有儀表板業務邏輯、樣式或核心資料檔 (`data.js`, `style.css`, `app.js`, `index.html`)。
- 不引入外部後端伺服器框架，維持純靜態與 GitHub Pages 原生相容。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
1. **README 整體範疇**：
   - 決策：建立完整專案 README，而非單純貼上連結。
   - 理由：提供 GitHub 訪客專業且具說服力的專案全貌，提升研究成果能見度。
2. **視覺截圖來源**：
   - 決策：由 Agent 自動執行瀏覽器渲染並截取真實高解析度預覽圖（存放於 `docs/images/dashboard-preview.png`）。
   - 理由：真實呈現深色毛玻璃美學設計與 Chart.js 動態渲染效果，避免空白預留位或非真實素材。
3. **線上網址呈現風格**：
   - 決策：採用標準 GitHub Pages 網址搭配 Shields.io 徽章與 Call-to-Action 區塊，並附上 Pages 啟用設定指引。
   - 理由：兼顧視覺專業感與使用者可操作性。
4. **語系與術語規範**：
   - 決策：繁體中文為主，搭配標準機器學習/統計學英文專業術語。
   - 理由：維持與既有 `issues/01~04` 規格文件的高度風格一致性。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **GitHub 圖片相對路徑相容性**：圖片路徑採用相對於 Repository 根目錄之標準路徑（`docs/images/dashboard-preview.png`），確保在 GitHub Web 介面與本地 Clone 時皆可正確載入。
- **GitHub Pages 尚未啟用的降級處理**：提供明確的 GitHub Repository Settings -> Pages 設定三步驟指引，防止外部使用者點擊 404 時不知如何啟用。
- **無網路環境/離線預覽相容**：說明本機雙擊開啟 `docs/index.html` 或使用 Python 內建 HTTP Server 的離線瀏覽方式。

## 5. 非功能性需求 (Non-Functional Requirements)
- **視覺排版美學**：遵循 GitHub Flavored Markdown 規範，善用徽章、表格、代碼區塊與引號提示，呈現專業開源專案規格。
- **精準性與一致性**：所有提及之模型指標數值（RMSE, $R^2$）必須與 `docs/data.js` 及先前分析結果 100% 精準匹配。
- **圖片最佳化**：截圖須兼顧解析度與檔案大小，避免過大圖片影響 README 載入效能。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：`docs/images/dashboard-preview.png` 成功產生，且清晰呈現深色毛玻璃儀表板全貌。
- [ ] 驗收條件 2：`README.md` 包含專案簡介、線上展示連結（含 Badges）、儀表板截圖、核心分析發現表與本地執行指引。
- [ ] 驗收條件 3：`README.md` 中的數值與 `docs/data.js` 及 `issues/04-analysis-dashboard/WALKTHROUGH.md` 100% 一致。
- [ ] 驗收條件 4：所有相對連結與圖片參照均可正確讀取，無失效或破損連結。
