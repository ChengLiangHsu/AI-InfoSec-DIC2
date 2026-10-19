---
description: 持續整合與版本控制流程。驗證前置審查門檻、執行提交前檢查，並將程式碼與 issue 產出物安全提交並推送 (Push) 至 Git。
---

# CI 持續整合工作流程

本工作流程負責將通過 `/review` 審查的程式碼修改與 `issues/<topic-folder>/` 產出物進行提交前校驗，遵循規範建立版本紀錄，並將變更安全推送 (Push) 至遠端 Git 儲存庫，完成持續整合閉環。

## 執行步驟 (Workflow Steps)

### 步驟 1：前置審查門檻檢查 (Prerequisite Gate)
在執行任何 Git 提交與推送動作前，必須嚴格檢查：
1. **檢查主題資料夾與審查成果**：
   - 確認專案根目錄下目標 `issues/<topic-folder>/` 是否存在。
   - 確認 `issues/<topic-folder>/WALKTHROUGH.md` 是否已產出（確保已完整通過 `/review` 驗收）。
2. **檢查 Git 工作區狀態**：
   - 執行 `git status`，檢視當前異動檔案清單（含修改、新增與未追蹤檔案）。
   - 若無任何變更（Working tree clean），向開發者回報無需提交並終止流程。

### 步驟 2：提交前安全與品質檢查 (Pre-Commit Checks)
確保推送至遠端的代碼不會破壞構建或洩漏敏感資訊：
1. **敏感資訊與忽略清單檢查**：
   - 嚴格檢查是否有 `.env`、API 金鑰、Token、暫存檔或過大二進位檔案誤入暫存區。
   - 確保 `.gitignore` 設定正確生效。
2. **相對路徑二次核對**：
   - 檢查 `issues/<topic-folder>/` 中的文檔與截圖路徑，確保無本機絕對路徑（如 `C:/Users/...`），全數採用相對路徑。
3. **建置與測試最終確認**：
   - 快速執行輕量級檢查（如型別檢查、代碼風格檢查或單元測試），確認當前代碼處於可構建、可通過狀態。

### 步驟 3：精確暫存與提交 (Git Add & Commit)
1. **精確加入暫存區 (Stage Files)**：
   - 暫存本主題涉及的原始碼變更（`src/`、`frontend/`、測試檔案等）。
   - 暫存本主題的所有產出物（`issues/<topic-folder>/` 下的 `REQUIREMENT.md`、`PLAN.md`、`TASKS.md`、`WALKTHROUGH.md` 及截圖/錄影）。
   - 若有記錄新知識點，同步暫存 `KEEP.md`。
   - **避免盲目 `git add .`**，嚴格避免意外納入未預期的暫存或臨時檔案。
2. **撰寫規範化 Commit 訊息 (Conventional Commits)**：
   - 格式規範：
     ```text
     <type>(<scope>): <subject>

     - 說明項目 1
     - 說明項目 2

     Issue: issues/<topic-folder>
     ```
   - **Type 定義**：
     - `feat`：新功能
     - `fix`：錯誤修復
     - `refactor`：重構
     - `docs`：文件變更
     - `test`：測試調整
   - 範例：
     ```bash
     git commit -m "feat(spectral): 新增成果影像光譜指數下拉選單與載入遮罩

     - App.vue 引入 shadcn-vue Select 元件，支援 RGB 與多種植生指數切換
     - 串接 /api/odm-task-formulas 與 /api/odm-task-spectral 端點
     - 新增載入中狀態提示與轉圈遮罩動畫
     - 封存 issues/spectral-image-dropdown 規格與 WALKTHROUGH.md

     Issue: issues/spectral-image-dropdown"
     ```

### 步驟 4：推送至遠端儲存庫 (Git Push)
1. **確認當前分支**：
   - 檢查當前所在分支 (`git branch --show-current`)。
2. **執行推送**：
   - 執行 `git push`（若為新分支則執行 `git push -u origin <branch>`）。
3. **驗證推送狀態**：
   - 確認遠端回傳成功，無衝突或拒絕推播 (Reject) 錯誤。

### 步驟 5：完成呈報與整合總結 (CI Summary)
- 向開發者呈報推送成功的 Commit Hash、分支名稱與異動摘要。
- 總結從 `/grill-me` ➔ `/plan` ➔ `/discuss` ➔ `/proceed` ➔ `/review` ➔ `/ci` 的完整週期，宣布本次 Issue 開發暨持續整合圓滿達成！
