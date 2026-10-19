# 需求規格書：統一筆記本 Import 語句至首格

## 1. 背景與目標 (Background & Goals)
- **核心問題**：現有 Jupyter Notebooks 中的 `import` 語句分散於多個不同儲存格（例如 50-startups 中的 `pathlib` 與 `statsmodels.api`，boston-housing 中的 `sklearn` 等），導致依賴管理混亂且不易於環境配置與前置檢查。
- **改動目標**：統一把所有筆記本內的 `import` 語句匯整至各筆記本的第一個 Code 儲存格，遵循 PEP 8 規範排序與去重，提升程式碼品質與閱讀一致性。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  - `src/ai_infosec_dic2/50-startup-linearregression/50-startups-linearregression.ipynb`
  - `src/ai_infosec_dic2/boston-housing-linearregression/boston-housing-with-linear-regression.ipynb`
  - 移出後續儲存格中的所有 import 語句並合併至首個 Code 儲存格。
  - 後續儲存格若因移出 import 而變為全空，則直接刪除該儲存格。
  - 首個 Code 儲存格按 PEP 8 規範（標準函式庫在先、第三方套件在後、按字母排序、去重）整理，IPython 魔術指令（如 `%matplotlib inline`）置於儲存格末尾。
- **排除項目 (Out of Scope)**：
  - 不變動筆記本頂部的說明用 Markdown 標題區塊。
  - 不變更資料集讀取邏輯、迴歸模型演算法或計算結果。
  - 不變動非 `.ipynb` 之 Python 原始碼或設定檔。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
- **範圍覆蓋**：經訪談確認涵蓋專案內所有筆記本（包含 `50-startups` 與 `boston-housing`）。
- **第一格定位**：保留最上方的標題與介紹 Markdown，將 import 集中於筆記本的「第一個 Code 儲存格」（例如 `# 匯入套件` 下方），兼顧閱讀體驗與程式結構。
- **空白儲存格處置**：移出 import 後若儲存格無剩餘程式碼（如 boston-housing 的 Cell 22），直接刪除該儲存格以維持簡潔。
- **排序與整理規範**：遵循 PEP 8 規範依類別與字母排序，去重複引用，魔術指令置於底端。
- **主題資料夾命名**：採用 `issues/01-consolidate-notebook-imports` 作為本次跨筆記本重構之主題目錄。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
- **混合型儲存格**：儲存格同時包含 import 與執行程式碼（如 50-startups Cell 5 的 `Path` 與資料載入、Cell 129 的 `sm` 與繪圖；boston-housing Cell 27 的 `metrics` 與指標計算），僅精確抽離 import 行，完整保留其餘程式邏輯與註解。
- **純 import 儲存格**：抽離後若僅剩空白行或無內容，安全自 `cells` 陣列中移除，避免產生無效執行序。
- **魔術指令相容性**：`%matplotlib inline` 為 IPython 核心語法，應保留於首個 Code 儲存格末端，不與標準 Python import 混雜排序。
- **Notebook JSON 格式**：確保更新後的 `.ipynb` 檔案仍維持合法 JSON 格式與 nbformat 規範。

## 5. 非功能性需求 (Non-Functional Requirements)
- **相容性**：需在 Python 3.13+ 與既有虛擬環境（`uv` 依賴）下正常解析與執行。
- **一致性**：兩份筆記本均套用相同之匯入排版規範與風格。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 1. `50-startups-linearregression.ipynb` 與 `boston-housing-with-linear-regression.ipynb` 中所有 `import` 與 `from ... import ...` 語句均集中於各自的第一個 Code 儲存格。
- [ ] 2. 兩份筆記本之後續所有儲存格中皆無殘留任何 import 語句。
- [ ] 3. 第一個 Code 儲存格符合 PEP 8 排序（標準函式庫 ➔ 第三方套件，去重複），魔術指令放置於末尾。
- [ ] 4. 因移出 import 而變為空白之儲存格已全數刪除，筆記本無多餘空白儲存格。
- [ ] 5. 兩份筆記本的 JSON 格式合法無毀損，能正常載入解析。
