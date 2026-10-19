---
description: 成果審查與驗收流程。驗證所有 TASKS.md 任務均已打勾，執行端到端與自動化測試（含瀏覽器驗證），產出 WALKTHROUGH.md 成果展示書並結案。
---

# Review 成果審查與結案工作流程

本工作流程是整個任務開發循環的最終品質把關與驗收結案階段。在所有實作任務完成後，嚴格審查程式碼品質、對齊需求規格書 (`REQUIREMENT.md`)、執行全面自動化測試與瀏覽器端到端操作驗證，並產出權威的成果展示書 (`WALKTHROUGH.md`)。

## 執行步驟 (Workflow Steps)

### 步驟 1：前置門檻檢查 (Prerequisite Gate)
在展開審查之前，必須嚴格驗證實作任務是否已全數完成：
1. **檢查主題資料夾**：確認專案根目錄下目標 `issues/<topic-folder>/` 是否存在。
2. **檢查核心三產出物**：
   - `issues/<topic-folder>/REQUIREMENT.md`（需求規格書）
   - `issues/<topic-folder>/PLAN.md`（實作架構計畫）
   - `issues/<topic-folder>/TASKS.md`（待辦任務清單）
3. **任務全數完成驗證（核心門檻）**：
   - 檢查 `TASKS.md` 中**是否所有任務皆已打勾標記為完成** (`- [x]`)。
   - **若仍存在未打勾的任務 (`- [ ]`)**：
     - **強制拒絕執行審查**。
     - 明確向開發者回報未完成任務清單。
     - 明確引導：「尚有待辦任務未完成，請先執行 `/proceed` 推進實作並驗證打勾後，再執行 `/review`。」

### 步驟 2：程式碼品質與規格審查 (Code & Specification Audit)
門檻通過後，進行整體代碼變更審查：
1. **規格對齊審查**：
   - 逐一比對 `REQUIREMENT.md` 的功能範圍、非功能需求與驗收準則 (Acceptance Criteria)。
   - 確認所有承諾交付的項目均已落實，無遺漏邊界條件與例外處理機制。
2. **變更差異審查 (Diff Review)**：
   - 檢視 Git 變更清單，確保僅修改計畫範圍內的檔案，無未預期的副作用、除錯用臨時程式碼或殘留註解。
   - 檢查程式碼風格、命名規範與型別定義。
   - 檢查是否有全域路徑，如有，請修正為相對路徑。

### 步驟 3：全方位驗證與端到端測試 (Comprehensive Verification)
1. **全套自動化測試**：
   - 執行專案完整測試套件（如 `pytest`、`npm test`、`ruff check` 等）。
   - 確保所有測試案例 100% 通過，且建置/編譯過程無警告或錯誤。
2. **前端 UI / 互動驗證（若涉及 Web 畫面）**：
   - **調用 `browser_subagent` 進行端到端動態操作**：
     - 啟動瀏覽器巡訪本地服務頁面。
     - 模擬使用者真實操作路徑（如點選下拉選單、觸發運算、切換視角、驗證載入狀態與解除遮罩）。
   - **截圖與錄影保存**：
     - 自動擷取操作成功後的關鍵 UI 畫面截圖。
     - 保存瀏覽器操作錄影（WebP 格式）至 Artifact 目錄，作為客觀驗收佐證。

### 步驟 4：產出成果展示書 (`WALKTHROUGH.md`)
驗證通過後，於主題資料夾建立或更新 `issues/<topic-folder>/WALKTHROUGH.md`。

文件規範與結構如下：

```markdown
# 成果展示書 (Walkthrough)：[任務/主題名稱]

> 關聯任務：[REQUIREMENT.md](./REQUIREMENT.md) | [PLAN.md](./PLAN.md) | [TASKS.md](./TASKS.md)

## 1. 執行成果總結 (Summary)
簡述本次 Issue 已全數實作並驗證完成，總結達成的核心功能與業務價值。

## 2. 所做的變更清單 (Changes Made)
詳細條列本次建立與異動的檔案及關鍵改動：
- `[NEW] path/to/file`：說明新增的模組與職責
- `[MODIFY] path/to/file`：說明調整的核心邏輯與影響範圍
- `[DELETE] path/to/file`：移除的冗餘項目

## 3. 測試與驗證項目 (Testing & Verification)
列出實際執行的驗證指令與執行結果：
- **自動化測試指令與輸出**：
  ```bash
  pytest tests/...
  # 測試通過摘要，如 5 passed in 0.42s
  ```
- **手動/端到端驗收項目**：列出驗收的情境與實測結果。

## 4. 驗證成果與操作演示 (Visual & Flow Demos)
嵌入實際驗證過程中的螢幕截圖或操作錄影，以視覺化方式呈現 UI 變更與操作流程：
- 關鍵功能截圖：`![功能驗收截圖](file:///path/to/screenshot.png)`
- 操作錄影展示：`![操作錄影](file:///path/to/recording.webp)`
- 必須將截圖與影片放置於 `issues/<topic-folder>/` 目錄下，並使用相對路徑引用。

## 5. 驗收準則達成核對 (Acceptance Checklist)
對照 REQUIREMENT.md 的驗收條件逐一確認：
- [x] 驗收條件 1：已驗證通過說明
- [x] 驗收條件 2：已驗證通過說明
```

### 步驟 5：結案呈報與引導持續整合 (Final Handoff to /ci)
- 向開發者呈報審查通過通知與 `issues/<topic-folder>/WALKTHROUGH.md` 連結。
- 總結本次改動對系統帶來的價值，確認驗收標準 100% 達成。
- **推進持續整合**：引導開發者執行 `/ci`，將本次 Issue 的程式碼與所有產出物安全提交並推送 (Push) 至 Git 遠端儲存庫。
