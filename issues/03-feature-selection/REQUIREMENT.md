# 需求規格書：50-startups 線性迴歸特徵選取與特徵數比較實作

## 1. 背景與目標 (Background & Goals)
- **背景**：既有筆記本 `50-startups-linearregression.ipynb` 已完成 scikit-learn Pipeline 現代化重構，但尚未納入循序特徵子集（1 至 5 個特徵）的複雜度與泛化表現量化比較分析。
- **目標**：在筆記本中新增特徵選取實驗章節，循序評估 1 到 5 個特徵子集的測試集指標，產出與參考圖片數值完全一致之評估表格及雙折線對照圖，並將圖檔同步匯出至 `docs/images/` 與 `issues/03-feature-selection/`。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  1. **特徵子集循序評估邏輯**：
     - 1 個特徵：`['R&D Spend']`
     - 2 個特徵：`['R&D Spend', 'Marketing Spend']`
     - 3 個特徵：`['R&D Spend', 'Marketing Spend', 'State_New York']`
     - 4 個特徵：`['R&D Spend', 'Marketing Spend', 'State_New York', 'State_Florida']`
     - 5 個特徵：`['R&D Spend', 'Administration', 'Marketing Spend', 'State_New York', 'State_Florida']`（全特徵基準）
  2. **指標精確計算**：
     - 使用測試集切分條件（`test_size=0.2, random_state=0`），重現：
       - 特徵數 1: $\text{RMSE} = 8274.868018$, $R^2 = 0.946459$
       - 特徵數 2: $\text{RMSE} = 8198.797191$, $R^2 = 0.947439$
       - 特徵數 3: $\text{RMSE} = 8309.059683$, $R^2 = 0.946015$
       - 特徵數 4: $\text{RMSE} = 8409.916714$, $R^2 = 0.944697$
       - 特徵數 5: $\text{RMSE} = 9137.990153$, $R^2 = 0.934707$
  3. **表格與視覺化產出**：
     - 在 Notebook 儲存格中渲染 Pandas DataFrame 表格。
     - 繪製雙子折線圖（左圖：RMSE by Number of Features；右圖：R-squared by Number of Features）。
     - 將圖檔儲存更新至 `docs/images/特徵選擇.png`（表格渲染圖）與 `docs/images/特徵數比較.png`（雙折線圖），並同步留存副本於 `issues/03-feature-selection/`。
  4. **筆記本章節結構重編**：
     - 於現有「章節六：模型評估與交叉驗證」之後新增「章節七：特徵子集選取與複雜度比較 (Feature Selection & Complexity Analysis)」。
     - 平滑重排後續章節編號，保持全筆記本章節條理清晰。
- **排除項目 (Out of Scope)**：
  - 不更動原有 Pipeline 的整體架構與端到端新資料預測範例。
  - 不引入未在專案環境宣告的額外重量級特徵選取套件（如未安裝之 mlxtend）。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
- **範圍定義**：「五個特徵選取方法」依使用者確認，定調為參考圖所示之 1 至 5 個特徵子集的循序複雜度比較，而非 5 種不同之演算法。
- **切分基準**：為 100% 精確重現參考圖之指標數值，特徵選取章節明確設定基準切分條件為 `test_size=0.2, random_state=0`，並於 Markdown 清楚註記說明。
- **第 5 列特徵顯示**：表格顯示數學上產出該精準數值的完整全特徵清單（含 `Administration` 與 2 個虛擬變數），並於內文詳解原參考截圖將 `Administration` 誤標為 `State_California` 之成因。
- **存檔與輸出**：Notebook 儲存格即時渲染，同時實作自動化存檔更新至 `docs/images/`，滿足文件與報告引用需求。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **虛擬變數陷阱 (Dummy Variable Trap)**：類別變數 `State`（3 個類別）於線性迴歸中至多僅能保留 2 個虛擬變數，避免完全共線性導致矩陣奇異（Singular Matrix）。
- **路徑相容性**：圖片儲存與讀取均透過 `pathlib.Path` 解析，兼顧 Windows/Linux 跨平台及自專案根目錄或子目錄執行的相容性。
- **Notebook 輸出持久化**：程式碼執行完畢後需經由 jupyter/nbclient 完整刷新，確保所有輸出與圖表均已內嵌並可持久化顯示。

## 5. 非功能性需求 (Non-Functional Requirements)
- **程式碼品質**：遵從 PEP 8 規範，維持既有筆記本的單格單職責與高聚合結構。
- **繪圖美觀度**：折線圖採高品質 dpi（150 或更高），配色清晰，標註點明確，與參考圖高度一致。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：`50-startups-linearregression.ipynb` 成功整合「特徵子集選取與複雜度比較」章節，且無任何執行錯誤。
- [ ] 驗收條件 2：筆記本輸出之特徵比較表格數值與參考圖 100% 一致（RMSE 與 R-squared 數值至小數點後 6 位精準匹配）。
- [ ] 驗收條件 3：筆記本產出清晰之雙子折線圖（RMSE 與 R-squared by Number of Features），趨勢與參考圖吻合。
- [ ] 驗收條件 4：`docs/images/特徵選擇.png` 與 `docs/images/特徵數比較.png` 已正確生成並覆寫更新，且於 `issues/03-feature-selection/` 保留對應產出副本。
- [ ] 驗收條件 5：後續章節編號平滑銜接，整體筆記本通過自動化語法結構與 AST 驗證。
