# 需求規格書：50-startups 分析成果專業互動視覺化儀表板

## 1. 背景與目標 (Background & Goals)
- **核心問題與痛點**：目前 `50-startups-linearregression.ipynb` 中的模型訓練、演算法評估與特徵工程（SFS 特徵選擇、特徵數消長趨勢）僅以 Jupyter Notebook 與靜態圖片儲存於目錄中，缺乏直觀、高互動性且具現代視覺水準的線上展示介面，不利於對外分享與成果展示。
- **改動預期目標**：打造一個具極致視覺美感（深色 Glassmorphism 風格）的專業前端資料分析儀表板，全面呈現「選擇的演算法」、「特徵選擇方式」、「特徵數比較」及「特徵選擇比較」，支援滑鼠懸停、指標切換、圖表動態渲染與表格即時排序，並能直接部署於 GitHub Pages（從 `docs/` 發布）。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  1. **GitHub Pages 原生相容目錄 (`docs/`)**：採用原生 HTML5、Vanilla CSS 與 JavaScript (ES6+)，置於專案根目錄之 `docs/`（如 `docs/index.html`、`docs/style.css`、`docs/app.js`、`docs/data.js`），完美相容 GitHub Pages「Branch: main / Folder: /docs」發布機制，同時支援離線雙擊與本機伺服器開啟。
  2. **頂部核心 KPI 摘要卡**：醒目呈現最佳模型類型（如 OLS 2-Feature）、最佳測試集 $R^2$ (0.9474)、最佳 RMSE (8198.80) 與最精簡有效特徵集合。
  3. **演算法比較模組 (Algorithm Comparison)**：
     - 對比多元線性迴歸 (OLS)、Ridge (L2)、Lasso (L1) 等不同迴歸演算法之評估表現（Train/Test $R^2$、RMSE）。
     - 提供演算法表現對比長條圖與詳細評估指標卡。
  4. **特徵選擇方式比較模組 (Feature Selection Methods)**：
     - 對比循序前向選擇 (SFS)、相關係數過濾法 (Correlation Filter) 與全特徵 (All Features) 的選模表現與精準度。
     - 提供方法比較雷達圖/分組圖與特徵保留率分析。
  5. **特徵數量漸進消長分析模組 (Feature Count Sensitivity)**：
     - 呈現特徵數從 1 至 5 之動態漸進雙指標折線圖（RMSE 與 $R^2$）。
     - 具備互動 Tooltip：滑鼠懸停於各點時即時顯示當前納入的完整特徵組合清單（如 2 特徵對應 `[R&D Spend, Marketing Spend]`）。
  6. **綜合比較與可排序數據表 (Interactive Comparison Table)**：
     - 支援依欄位（特徵數、方法、演算法、RMSE、$R^2$）升降序排序。
     - 支援高亮最佳數值列，提供直覺的資料檢索體驗。
  7. **極致視覺與美感設計**：
     - 依據深色科技感主題，導入霧面毛玻璃 (Glassmorphism)、細緻漸層邊框 (Gradient Borders)、流暢微動畫 (Micro-interactions) 與 Google Fonts 現代字體。
     - 完整響應式排版 (RWD)，相容桌面高解析螢幕與筆記型電腦。
- **排除項目 (Out of Scope)**：
  - 本次不引入 Node.js / Webpack / Vite 等重量級打包工具，避免 GitHub Pages 需要複雜的 CI/CD Build 流程。
  - 本次不串接 Python 即時重新訓練後端，數據源由真實實驗成果產出之結構化靜態檔 (`data.js`) 提供。
  - 非 50-startups 的其他資料集（如波士頓房價）列為後續擴充維度，本次聚焦 50-startups。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
- **GitHub Pages 部署策略**：選擇「專案根目錄 `docs/` 直接發布」，而非自訂 Actions 構建。
  - *理由*：GitHub Pages 原生原生支援從 `main` 分支的 `/docs` 目錄作為站點根目錄，無需配置 Actions Workflow 權限即可零門檻自動上線，對靜態站點最穩定、最易維護。
- **技術棧選型**：選擇「HTML5 + Vanilla CSS + Chart.js」單頁靜態應用。
  - *理由*：無 runtime 依賴，瀏覽器直讀，百分之百掌控 CSS 動畫與深色質感。
- **資料儲存與傳遞設計**：採用獨立 `docs/data.js` 模組導出結構化數據，而非異步 fetch JSON。
  - *理由*：在 GitHub Pages 與本地以 `file://` 協議雙擊開啟時，均不會遭遇 CORS 或路徑錯誤問題。
- **圖表函式庫選擇**：採用 Chart.js (v4.x CDN)。
  - *理由*：輕量、動畫順暢、Canvas 渲染效能極佳。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **GitHub Pages 相對路徑陷阱**：
  - 所有資源引用（CSS, JS, 圖片）一律使用相對路徑（如 `./style.css`、`./images/...`），避免在自訂子路徑 Repository 部署時發生 404 資源載入失敗。
- **離線或 CDN 載入失敗降級**：
  - 在 HTML 中提供 Chart.js 載入失敗之 Fallback 偵測提示，並保持表格資料依然完整可讀。
- **螢幕解析度適應 (Responsive Breakpoints)**：
  - 支援斷點調適（< 768px 與 < 1024px），雙欄圖表彈性降維為單欄。

## 5. 非功能性需求 (Non-Functional Requirements)
- **視覺體驗與設計規範**：
  - 採用深色現代科技調色盤（Deep Slate `#0B0F19` 背景、Neon Cyan `#06B6D4`、Electric Indigo `#6366F1`、Emerald `#10B981` 點綴）。
  - 所有卡片具備微反光、模糊背景（`backdrop-filter: blur(12px)`）與優雅懸停浮動效果。
- **載入效能**：
  - 頁面初始載入時間 < 1 秒，圖表渲染與平滑進場動畫無掉幀現象。
- **相容性**：
  - 相容主流現代瀏覽器與 GitHub Pages 靜態代管規範。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：於專案 `docs/` 目錄建立 `index.html`、`style.css`、`app.js` 與 `data.js`，符合 GitHub Pages 部署規範且本機雙擊可直接預覽。
- [ ] 驗收條件 2：所有靜態資源與圖片均使用相容 GitHub Pages 的相對路徑，無任何 404 錯誤。
- [ ] 驗收條件 3：頂部 KPI 摘要卡精確呈現 50-startups 線性迴歸最佳配置數據（2 特徵組合、RMSE 8198.80、$R^2$ 0.9474）。
- [ ] 驗收條件 4：完整呈現「演算法比較」模組（含 OLS、Ridge、Lasso 之指標對照圖表）。
- [ ] 驗收條件 5：完整呈現「特徵選擇方式比較」模組（SFS vs 相關係數法 vs 全特徵之對照）。
- [ ] 驗收條件 6：完整呈現「特徵數比較」模組（1 至 5 特徵漸進折線圖，懸停精確顯示特徵子集明細）。
- [ ] 驗收條件 7：提供可點擊排序之互動數據表格，並具備深色 Glassmorphism 高級視覺質感與響應式排版。
