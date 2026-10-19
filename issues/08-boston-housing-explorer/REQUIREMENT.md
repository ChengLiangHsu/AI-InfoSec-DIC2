# 需求規格書：波士頓房價多元線性迴歸探索與即時預測儀表板 (08-boston-housing-explorer)

## 1. 背景與目標 (Background & Goals)
- **背景**：延續 `boston-housing-with-linear-regression.ipynb` 的現代化 scikit-learn Pipeline 實踐成果（零資料洩漏、ColumnTransformer 標準化、5-Fold 交叉驗證、殘差診斷與無標籤推論），將靜態分析轉化為高互動性、現代美學的 Web 應用。
- **目標**：在 `docs/` 部署環境中新增 `boston.html`，比照 50-Startups 儀表板之高質感暗黑玻璃風格（Glassmorphism），呈現 EDA 核心洞察、k=1~13 特徵複雜度權衡曲線、4 大業務模型架構切換、即時雙向滑動預測試算器與殘差統計診斷。

## 2. 功能範圍 (Scope)

### 包含項目 (In Scope)
1. **導覽與跨頁整合 (Navigation & Routing)**：
   - 建立獨立專頁 `docs/boston.html`，共用現有 `docs/style.css` 並保持視覺風格一致。
   - 在 `docs/index.html` (50-Startups) 與 `docs/boston.html` 頂部導覽列新增相互跳轉按鈕（「🏢 50 Startups」與「🏡 Boston Housing」）。
2. **數據總覽與模型架構切換 (Hero & Architecture Switcher)**：
   - 呈現波士頓房價資料集總覽統計徽章（333 筆訓練樣本、13 項預測特徵、目標變數 `medv` 單位千美元）。
   - 支援 4 大經典架構切換：
     1. 全特徵模型 (Full Model, 13 特徵)
     2. 領域關鍵 5 特徵模型 (Key Features: rm, lstat, ptratio, tax, crim)
     3. 房價核心 3 要素模型 (Core Features: rm, lstat, ptratio)
     4. 單一房間數模型 (Single Feature: rm)
   - 即時連動頂部 5 大指標卡片（Test RMSE、R² Score、Adjusted R²、MAE、5-Fold CV R² / RMSE）。
3. **特徵複雜度與最優解分析 (Feature Complexity & Parsimony Analysis)**：
   - 依特徵與目標相關性排序（k=1 至 13）之逐步迴歸指標。
   - 互動切換 k=1~13 標籤按鈕，動態高亮最佳折衷特徵點（Optimal Sweet Spot）。
   - 雙折線圖（Chart.js / Canvas 或 SVG）：RMSE 曲線（訓練 vs 測試）與 R² 曲線，呈現複雜度與過擬合邊界。
   - 互動呈現 OLS 擬合方程式（動態代入選定特徵與係數）。
4. **即時波士頓房價預測試算器 (Live Housing Price Predictor)**：
   - 支援雙向連動之暗黑琉璃滑桿與數值輸入框。
   - 預設展開 5 大核心特徵（rm, lstat, ptratio, tax, crim），並提供「展開全部 13 項特徵」手風琴按鈕。
   - 提供 4 組典型社區情境快速預設按鈕：
     - 🌟 郊區優質學區豪宅 (High-end Suburb)
     - 🏢 都會核心高密度社區 (Urban Metro)
     - 📊 波士頓平均基準社區 (Regional Baseline)
     - 🏭 工業周邊平價老社區 (Industrial Working-class)
   - 根據當前選取的模型架構，動態將未納入該模型的特徵輸入卡「反灰停用」，並標示「Not in Model」。
   - 預測結果即時大字卡：顯示預測房價中位數（千美元與原始美元雙尺度換算），並附帶特徵邊際增量與貢獻度條形圖。
5. **殘差診斷與推論驗證 (Diagnostics & Unlabeled Inference)**：
   - 67 筆獨立測試集診斷表：顯示 Actual medv、Predicted medv、Residual、% Error 與診斷狀態標籤（High Residual / In-Range），支援欄位排序。
   - 支援分頁切換至真實無標籤測試集（`boston_test.csv` 173 筆）之批次預測結果預覽。
6. **資料自動化導出 (Data Generation Pipeline)**：
   - 撰寫 Python 腳本 `export_boston_data.py`，精確計算訓練/測試集所有係數、指標、殘差與推論值，封裝為 `docs/boston-data.js`。

### 排除項目 (Out of Scope)
- 後端 API 服務（純靜態前端架構，無須 Python 後端運行時）。
- 使用者上傳任意 CSV 資料集之即時重新訓練功能。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
1. **多頁面 vs SPA**：採獨立專頁 `docs/boston.html`，避免單一 HTML 檔案過度肥大與邏輯耦合，同時在導覽列提供無縫切換，符合 GitHub Pages 靜態網站最佳實務。
2. **複雜度分析與模型維度**：整合「k=1~13 逐步增加」與「4 大業務假設模型」雙視角，兼顧理論模型複雜度（Occam's Razor）與實務業務情境。
3. **13 項特徵輸入體驗**：採「5 大核心預設 + 展開進階」策略，降低初始視覺負擔，搭配模型動態反灰與情境按鈕，保持簡潔直覺。
4. **診斷數據雙軌**：以 67 筆已標籤獨立測試集提供客觀殘差與離群檢驗，兼顧 173 筆真實無標籤樣本推論展示，完全對應 Notebook 之完整實踐。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
1. **數值輸入邊界 Clamp**：所有特徵滑桿與數字框均設置 `min`、`max` 與 `step`（根據真實訓練集 1% ~ 99% 分位數合理範圍），手動輸入超出範圍時自動修正並給予提示。
2. **極端輸入預測截斷**：線性迴歸在極端輸入時若計算出非合理的負數房價，前端自動 Clamp 下限至合理最低防禦價格（如 $5,000 / $5.0k），並標示警示訊息。
3. **視窗與響應式佈局相容性**：確保在平板與手機直向模式下，左右雙欄預測版面能流暢堆疊為單欄，滑桿與數值框觸控操作不跑版。

## 5. 非功能性需求 (Non-Functional Requirements)
- **視覺美學**：極致暗黑玻璃風格（Deep Slate Dark Mode、CSS Backdrop-filter、發光漸層、客製 Thumb 滑桿）。
- **效能表現**：零第三方依賴（除輕量 Chart.js CDN 用於繪圖），所有迴歸矩陣推論於前端以純 JS 微秒級即時完成。
- **可測試性與程式碼品質**：具備端到端資料與推論邏輯 Python 單元測試，且前端 JS 無語法或執行時錯誤。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 1. 成功建立 `docs/boston.html`、`docs/boston-data.js` 與 `docs/boston-app.js`，且在 GitHub Pages 靜態環境可直接流暢運行。
- [ ] 2. `docs/index.html` 與 `docs/boston.html` 頂部導覽列具備雙向切換按鈕，可無縫相互導航。
- [ ] 3. 提供 4 大模型架構切換，切換時 5 大統計指標卡、迴歸方程式與係數即時連動。
- [ ] 4. 提供 k=1~13 特徵數複雜度切換，動態更新 RMSE 與 R² 走勢圖，並高亮最佳特徵數平衡點。
- [ ] 5. 即時預測試算器支援滑桿與文字框雙向連動、Clamp 防呆、4 組典型情境預設按鈕，並能依當前模型反灰停用未選取特徵。
- [ ] 6. 殘差診斷表完整呈現 67 筆測試集預測與狀態診斷，並支援切換至 173 筆無標籤測試集預測預覽。
- [ ] 7. 自動化測試全數通過（含推論數學正確性、數據完整性驗證），無控制台錯誤。
