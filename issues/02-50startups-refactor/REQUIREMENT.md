# 需求規格書：50-startups 線性迴歸筆記本之 scikit-learn Pipeline 現代化重構

## 1. 背景與目標 (Background & Goals)
- **核心痛點**：
  - 現有 `50-startups-linearregression.ipynb` 共有 161 個儲存格，結構嚴重碎片化（如單一變數繪圖各自佔用獨立儲存格、重複呼叫欄位更名與檢視語句）。
  - 資料前處理存在 Data Leakage 問題（在資料集切分 `train_test_split` 前即執行全量資料的 `StandardScaler.fit_transform`）。
  - 大量依賴 `statsmodels` 進行繁瑣的手動統計報表檢定與手動反標準化運算，缺乏現代機器學習工程導向之封裝。
  - Dummy 變數未設定 `drop_first=True`，存在多元共線性與 Dummy Variable Trap。
- **改動目標**：
  - 全面導入 scikit-learn 的 `Pipeline`、`ColumnTransformer` 與 `TransformedTargetRegressor`，打造無 Data Leakage、支援端到端自動前處理與反標籤轉換的現代化迴歸流程。
  - 大幅精簡與整併筆記本儲存格，透過子圖（subplots）與模組化區塊提升可讀性與維護性。
  - 刷新並固化筆記本執行結果，確保所有視覺化圖表與評估指標正確反映重構後的流程。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  - **資料切分與防洩漏**：嚴格在特徵工程與標準化之前執行 `train_test_split`。
  - **Pipeline 前處理**：利用 `ColumnTransformer` 對數值特徵（`R&D Spend`、`Administration`、`Marketing Spend`）進行 `StandardScaler`，對類別特徵（`State`）進行 `OneHotEncoder(drop='first', sparse_output=False)`。
  - **目標變數轉換與模型封裝**：使用 `TransformedTargetRegressor(regressor=LinearRegression(), transformer=StandardScaler())` 封裝於 Pipeline 中，實現預測自動反標準化回真實金額尺度。
  - **系統化模型比較與交叉驗證**：在訓練集上比較「全特徵 Pipeline」與「精簡特徵 Pipeline（如僅 R&D 或 R&D + Marketing）」，並透過 K-Fold Cross Validation 評估泛化性能。
  - **模型診斷與評估**：計算測試集之 $R^2$、RMSE、MAE 指標，並繪製殘差分佈圖與預測值 vs 真實值圖。
  - **端到端新樣本預測**：示範輸入原始特徵 DataFrame，直接調用 Pipeline 產出預測利潤金額。
  - **儲存格深度整併**：將過度分散的 161 個儲存格深度精簡，整併繪圖為複合子圖（subplots）。
  - **規範遵循**：遵守 PEP 8 Import 集中於首個 Code 儲存格，符合 Jupyter nbformat 規格並完整執行刷新輸出。
- **排除項目 (Out of Scope)**：
  - 移除對 `statsmodels` 傳統 OLS summary、t 檢定、p-value 報表之依賴。
  - 不拆分成專案外部獨立 `.py` 模組或 CLI 腳本，維持單一 Notebook 自成一體的完整互動性。
  - 不導入非線性演算法（如隨機森林、XGBoost 等），本次專注於線性迴歸 Pipeline 規範化。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
- **重構方向**：選擇「Pipeline 現代化」，避免手動計算標準化平均值與標準差轉換，符合現代 MLOps 與 scikit-learn 工程最佳實踐。
- **模型與診斷架構**：選擇「純 scikit-learn 化」，由 scikit-learn 評估指標與殘差圖完全取代傳統 statsmodels 統計報表，精簡代碼體積。
- **離群值與模型比較**：在訓練集內透過 Pipeline 結構系統化比較不同特徵組合模型，並加入 K-Fold 交叉驗證佐證穩定性。
- **儲存格架構**：選擇「深度整併並完整執行刷新」，擺脫原先 161 個碎片格，整合成條理分明、圖表齊全的高質感機器學習實踐指南。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **Dummy Variable Trap**：類別編碼必須設定 `drop='first'`，避免虛擬變數共線性。
- **未見過之類別值**：`OneHotEncoder` 設定 `handle_unknown='ignore'`，防止新預測資料出現未知州別時拋出異常。
- **零或負研發支出樣本（離群點）**：檢驗觀察值（如 Index 49），確認模型在訓練集的穩定度與對極值點的容忍度。
- **JSON 結構完整性**：筆記本產出需符合 nbformat v4 規範，且確保各 Cell execution outputs 正常渲染無拋錯。

## 5. 非功能性需求 (Non-Functional Requirements)
- **程式碼風格**：嚴格遵循 PEP 8，所有 `import` 集中在筆記本的第一個 Code Cell，內部不得出現零星 import。
- **執行效能與再現性**：設定明確的 `random_state=42`，整體筆記本能一鍵在數秒內無警告跑通。
- **視覺呈現美感**：繪圖採用現代 Seaborn/Matplotlib 樣式，包含圖例、標題、軸標籤與格線，杜絕無意義的重複單格出圖。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：筆記本第一個 Code 儲存格依標準庫、第三方庫規範匯集所有所需 import，後續儲存格無任何 import。
- [ ] 驗收條件 2：前處理完整封裝於 `ColumnTransformer` 與 `Pipeline`，嚴格落實 Train/Test 切分後擬合，徹底消除 Data Leakage。
- [ ] 驗收條件 3：目標變數 `Profit` 藉由 `TransformedTargetRegressor` 實現自動標準化與反轉換，測試集評估指標（$R^2$, RMSE, MAE）以原始貨幣金額為基準計算。
- [ ] 驗收條件 4：儲存格總數自 161 格大幅整併至合理的結構化篇幅（建議 30 格以內），且所有 Code Cell 均已執行完成，圖表與結果完整持久化於 `.ipynb`。
- [ ] 驗收條件 5：新資料預測範例可直接接收原始未經前處理的特徵 DataFrame 並輸出正確反轉換之預測利潤。
- [ ] 驗收條件 6：透過 `nbformat` 與 Python AST 解析檢驗，確保檔案格式無損壞且語法檢驗 100% 通過。
