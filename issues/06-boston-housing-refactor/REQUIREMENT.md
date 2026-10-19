# 需求規格書：Boston Housing 線性迴歸筆記本現代化重構 (06-boston-housing-refactor)

## 1. 背景與目標 (Background & Goals)
- **核心痛點**：現有的 `boston-housing-with-linear-regression.ipynb` 存在 Kaggle 寫死路徑依賴（`../input/`）、未進行特徵標準化、無 Pipeline 封裝、缺乏交叉驗證與特徵複雜度評估，且未執行保存輸出。
- **改動目標**：全面參照 `50-startups-linearregression.ipynb` 的架構標準與機器學習最佳實踐，為波士頓房價資料集建立零資料洩漏、高內聚 scikit-learn Pipeline、5-Fold 交叉驗證、特徵複雜度權衡與完整診斷的現代化分析筆記本。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  1. **路徑與環境健全化**：採用動態路徑載入同目錄之 `boston_train.csv` 與 `boston_test.csv`，設定繁體中文字型與負號正常顯示。
  2. **探索性資料分析 (EDA)**：欄位摘要、缺失值與重複值檢驗、多變數相關係數熱圖（Heatmap）及關鍵特徵（如 `rm`、`lstat`）與 `medv` 的散佈關係圖。
  3. **零資料洩漏切分**：移除 `ID` 欄位後，以 80/20 比例劃分訓練集與獨立測試集（固定 `random_state=42`）。
  4. **現代化 Pipeline 與目標封裝**：使用 `ColumnTransformer` 將 12 個連續特徵進行 `StandardScaler` 標準化、二元特徵 `chas` 保留 (passthrough)；使用 `TransformedTargetRegressor` 封裝目標變數 `medv` 並自動反轉。
  5. **三層級多模型比較與 5-Fold 交叉驗證**：評估「全特徵模型 (13 特徵)」、「關鍵特徵模型 (如 `rm`, `lstat`, `ptratio` 等)」與「單一房間數模型 (`rm`)」之 CV RMSE 與 $R^2$。
  6. **特徵子集複雜度分析**：依相關性由 1 至 13 個特徵逐步加入，繪製特徵數 vs 測試集 RMSE 與 $R^2$ 曲線圖，分析模型複雜度與泛化誤差邊際效應。
  7. **殘差診斷與泛化評估**：視覺化殘差散佈圖、常態分佈直方圖/KDE、QQ 圖，並在獨立測試集計算 MAE、MSE、RMSE 與 $R^2$。
  8. **端到端無標籤推論展示**：使用訓練完備的 Pipeline 對 `boston_test.csv` (173 筆) 進行批次預測，檢視預測房價分佈並提供範例輸出。
  9. **完整執行與輸出內嵌**：在交付前執行所有 Notebook 單元格，確保各 Cell 內嵌完整的 DataFrame、指標表格與圖表。
- **排除項目 (Out of Scope)**：
  - 非線性迴歸（如多項式迴歸、RandomForest、XGBoost）。
  - 線上 Web 儀表板資料擴充（本次專注於 Notebook 本身之重構與交付）。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
- **架構選型**：採納 50-Startups 的完整十章節結構，兼具教學可讀性與工程嚴謹性。
- **資料運用策略**：以 `boston_train.csv` 進行內部 80/20 切分與 5-Fold CV 評估；`boston_test.csv` 則作為無標籤真實推論範例，充分展現 Pipeline 的端到端預測能力。
- **前處理分流設計**：考量 `chas` 為 0/1 虛擬變數，使用 `ColumnTransformer` 將數值特徵標準化與二元特徵 passthrough 分流處理；目標變數標準化交由 `TransformedTargetRegressor` 處理以維持輸出千美元單位之直觀解讀。
- **特徵複雜度分析**：實作 1~13 特徵走勢圖，讓使用者能直觀觀察特徵數量增加對模型過擬合與泛化能力的影響。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **檔案路徑跨平台相容性**：使用 `pathlib.Path` 解析當前筆記本路徑，無論從專案根目錄或子目錄啟動均能正確讀取 CSV。
- **ID 欄位隔離**：確保 `ID` 不進入特徵訓練矩陣，但在 `boston_test.csv` 預測時保留 `ID` 以對齊預測結果。
- **圖表中文相容性**：設定 `Microsoft JhengHei`, `SimHei`, `sans-serif`，避免中文標題出現亂碼或方形缺字。

## 5. 非功能性需求 (Non-Functional Requirements)
- **程式碼可讀性**：所有程式碼遵從 PEP 8 規範，並附帶繁體中文 Markdown 說明與分析結論。
- **執行穩定性**：所有 Cell 能一鍵順暢執行完畢無報錯（Exit Code 0），全流程耗時小於 30 秒。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：[boston-housing-with-linear-regression.ipynb](file:///c:/Users/amath701/Downloads/AI-InfoSec-DIC2/src/ai_infosec_dic2/boston-housing-linearregression/boston-housing-with-linear-regression.ipynb) 成功導入 `ColumnTransformer`、`StandardScaler` 與 `TransformedTargetRegressor` 封裝。
- [ ] 驗收條件 2：完成全特徵、關鍵特徵、單一特徵之 5-Fold 交叉驗證比較表格。
- [ ] 驗收條件 3：完成 1 至 13 個特徵之複雜度分析圖表（特徵數 vs RMSE 與 $R^2$）。
- [ ] 驗收條件 4：完成殘差常態性與等變異性診斷視覺化，並在獨立測試集產出完整評估指標。
- [ ] 驗收條件 5：成功對 `boston_test.csv` 進行端到端批次預測展示。
- [ ] 驗收條件 6：筆記本所有單元格均經由核心實際執行完畢，內嵌豐富圖表與輸出結果。
