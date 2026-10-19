# 成果展示書 (Walkthrough)：波士頓房價多元線性迴歸探索與即時預測儀表板 (08-boston-housing-explorer)

> 關聯任務：[REQUIREMENT.md](./REQUIREMENT.md) | [PLAN.md](./PLAN.md) | [TASKS.md](./TASKS.md)

## 1. 執行成果總結 (Summary)
本任務已全數實作並驗證完成！成功將 `boston-housing-with-linear-regression.ipynb` 現代化 scikit-learn Pipeline（零資料洩漏、ColumnTransformer 標準化、5-Fold 交叉驗證、複雜度折衷分析、殘差診斷與無標籤真實推論）完整轉化為高效能、高質感的 Web 互動儀表板：
1. **GitHub Pages 雙專案互通架構**：於 `docs/boston.html` 建立專屬波士頓房價探索頁面，並在 `docs/index.html` (50-Startups) 與新頁面頂部導覽列無縫雙向切換。
2. **多模型架構評估**：支援 4 大經典架構（全特徵 13、領域關鍵 5 特徵、房價核心 3 要素、單房間數 rm）即時切換，連動 5 大指標卡片與 OLS 迴歸方程式。
3. **特徵複雜度權衡**：呈現 $k=1 \sim 13$ 循序加入特徵之 RMSE 與 $R^2$ 雙折線圖，高亮標註 $k=5$ 最佳拐點（Sweet Spot）。
4. **即時波士頓房價預測試算器**：
   - 預設展開 5 大核心特徵（rm, lstat, ptratio, tax, crim），手風琴支援展開其餘 8 項進階特徵。
   - 雙向滑動數值輸入框同步連動與邊界 Clamp 防呆。
   - 提供 4 組典型社區情境按鈕（郊區豪宅、都會核心、基準平均、工業老區）。
   - 依據當前選取之模型，動態將未納入之特徵卡「反灰停用」並標示狀態。
   - 即時雙尺度顯示預測住宅價格中位數（$k 千美元 / $USD 美元）與特徵邊際貢獻度拆解長條圖。
5. **資料診斷與批次推論**：雙分頁切換呈現 67 筆獨立測試集殘差診斷表（可排序）與 173 筆真實未標籤樣本批次預測結果。

---

## 2. 所做的變更清單 (Changes Made)

### `[NEW]` 核心功能與資料模組
- **`src/ai_infosec_dic2/boston-housing-linearregression/export_boston_data.py`**：
  - 封裝 scikit-learn Pipeline 與 OLS 運算邏輯，精確計算訓練集/測試集指標、4 大模型原始尺度係數、k 階複雜度數據、67 筆殘差診斷與 173 筆批次預測。
  - 自動導出具備完整結構的靜態資料檔 `docs/boston-data.js`。
- **`docs/boston-data.js`**：
  - 封裝 `window.BOSTON_DATA`，包含 KPI、4 組模型架構、k=1~13 複雜度序列、13 特徵統計邊界、4 組典型情境預設、67 筆測試殘差與 173 筆未標籤推論數據。
- **`docs/boston.html`**：
  - 波士頓房價專業探索儀表板 HTML 頁面，具備極致暗黑玻璃視覺（Deep Slate Glassmorphism）、雙專案切換列、Hero KPI 區、架構指標切換區、複雜度走勢圖區、即時預測試算器與診斷分頁表。
- **`docs/boston-app.js`**：
  - 純 Vanilla JavaScript 控制器，負責 Chart.js 全域深色主題、雙軸走勢圖、4 組架構切換連動、雙向輸入綁定與 Clamp、模型動態反灰停用狀態管理、即時微秒級預測運算與診斷表排序。
- **`tests/test_boston_prediction.py`**：
  - 撰寫 6 組單元測試，驗證資料完整性、4 大模型指標、情境邊界合法性、前端 OLS 公式與 Python Pipeline 預測值誤差精確度。

### `[MODIFY]` 既有元件擴充
- **`docs/index.html`**：
  - 於頂部導覽列新增 `.project-nav-switcher` 雙專案切換膠囊，提供「🏢 50 Startups」與「🏡 Boston Housing」無縫跳轉。
- **`docs/style.css`**：
  - 擴充專案切換膠囊樣式、13 特徵手風琴展開動畫、特徵卡停用反灰過渡、雙尺度貨幣徽章、表格分頁標籤與 Sweet Spot 徽章樣式。

---

## 3. 測試與驗證項目 (Testing & Verification)

### 3.1 自動化單元測試 (pytest)
```bash
& 'C:\Users\amath701\anaconda3\python.exe' -m pytest tests/ -v
```
**執行結果**：
```text
============================= test session starts =============================
platform win32 -- Python 3.11.7, pytest-7.4.0, pluggy-1.0.0
collected 10 items

tests/test_boston_prediction.py::test_boston_data_keys PASSED            [ 10%]
tests/test_boston_prediction.py::test_feature_ranges_and_presets PASSED  [ 20%]
tests/test_boston_prediction.py::test_architectures_consistency PASSED   [ 30%]
tests/test_boston_prediction.py::test_prediction_formula_math PASSED     [ 40%]
tests/test_boston_prediction.py::test_complexity_series_trend PASSED     [ 50%]
tests/test_boston_prediction.py::test_unlabeled_predictions_count PASSED [ 60%]
tests/test_prediction_logic.py::test_data_js_coefficients_match_sklearn PASSED [ 70%]
tests/test_prediction_logic.py::test_historical_benchmark PASSED         [ 80%]
tests/test_prediction_logic.py::test_html_predictor_elements_exist PASSED [ 90%]
tests/test_prediction_logic.py::test_prediction_formula_calculation PASSED [100%]

====================== 10 passed, 110 warnings in 1.10s =======================
```

### 3.2 靜態 JavaScript 語法檢查 (Node.js)
```bash
node --check docs/boston-data.js
node --check docs/boston-app.js
node --check docs/app.js
node --check docs/data.js
```
**執行結果**：100% 語法無誤通過，無任何 SyntaxError。

---

## 4. 驗證成果與功能架構 (Feature Highlights)

### 4.1 雙專案頂部導覽切換 (Navigation Bar)
- 在任何頁面頂部，使用者均可透過發光膠囊開關在「🏢 50 Startups」與「🏡 Boston Housing」之間流暢切換，保持統一的極致深色品牌調性。

### 4.2 4 大模型架構與 5 大指標連動 (Architecture Switcher)
- **全特徵基準 (13 特徵)**：測試集 $R^2 = 0.7261$，RMSE = $4,928.60。
- **領域關鍵 5 特徵 (rm, lstat, ptratio, tax, crim)**：測試集 $R^2 = 0.6775$，RMSE = $5,348.87（保留 93% 解釋力）。
- **房價核心 3 要素 (rm, lstat, ptratio)**：測試集 $R^2 = 0.6387$。
- **單一房間數 (rm)**：測試集 $R^2 = 0.4835$。
- 點擊按鈕時，5 大指標卡、方程式代碼高亮與預測器輸入卡反灰遮罩即時同步連動。

### 4.3 即時預測試算器與 4 組典型情境 (Live Predictor)
- **郊區優質學區豪宅 (High-end Suburb)**：預設高房間數 (7.6)、低犯罪率 (0.08)、優質學區師生比 (14.5)，即時預估房價約 $38.5k+。
- **都會核心高密度住宅 (Urban Metro)**：預設低中心距離 (2.2)、高路網指數 (8)、老牌商業區，即時預估房價約 $22.8k。
- **波士頓歷史基準社區 (Regional Baseline)**：套用全體訓練集特徵均值，即時預估房價精準對齊基準 $22.5k。
- **工業周邊平價社區 (Industrial Working-class)**：預設高貧窮率 (21.0%)、高師生比 (20.2)，即時預估房價約 $13.5k。
- **Clamp 防呆與防禦價格**：支援上下限輸入修正，若出現負向極端計算值自動截斷為 $5.0k ($5,000 USD)。

---

## 5. 驗收準則達成核對 (Acceptance Checklist)
- [x] 1. 成功建立 `docs/boston.html`、`docs/boston-data.js` 與 `docs/boston-app.js`，且在 GitHub Pages 靜態環境可直接流暢運行。
- [x] 2. `docs/index.html` 與 `docs/boston.html` 頂部導覽列具備雙向切換按鈕，可無縫相互導航。
- [x] 3. 提供 4 大模型架構切換，切換時 5 大統計指標卡、迴歸方程式與係數即時連動。
- [x] 4. 提供 k=1~13 特徵數複雜度切換，動態更新 RMSE 與 R² 走勢圖，並高亮最佳特徵數平衡點。
- [x] 5. 即時預測試算器支援滑桿與文字框雙向連動、Clamp 防呆、4 組典型情境預設按鈕，並能依當前模型反灰停用未選取特徵。
- [x] 6. 殘差診斷表完整呈現 67 筆測試集預測與狀態診斷，並支援切換至 173 筆無標籤測試集預測預覽。
- [x] 7. 自動化測試全數通過（含推論數學正確性、數據完整性驗證），無控制台錯誤。
