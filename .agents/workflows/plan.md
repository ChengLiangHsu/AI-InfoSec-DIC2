---
description: 規格與實作規劃流程。驗證 REQUIREMENT.md 前置門檻，深入調研並產出 PLAN.md、TASKS.md，並於審核通過後主動調用 /proceed 推進實作。
---

# Plan 規格與排程工作流程

使用者要求你在執行即將展開的任務前，先進行審慎的架構調研與技術規劃。本工作流程嚴格依據 `issues/<topic-folder>/REQUIREMENT.md` 的需求規格，於主題資料夾下產出實作計畫 (`PLAN.md`) 與原子任務待辦清單 (`TASKS.md`)，並在獲得使用者核准後主動調用 `/proceed` 技能推進實作。

## 執行步驟 (Workflow Steps)

### 步驟 1：前置門檻檢查 (Prerequisite Gate)
在開始任何規劃或程式碼調研之前，**必須**先進行門檻檢查：
1. **確認主題資料夾**：
   - 檢查專案根目錄下 `issues/<topic-folder>/` 是否存在。
2. **檢查需求規格書**：
   - 檢查該主題資料夾內是否存在 `REQUIREMENT.md`。
3. **未通過門檻時的處理（強制中斷）**：
   - **若主題資料夾或 `REQUIREMENT.md` 不存在**：
     - **強制中斷執行**，嚴禁在沒有需求對齊的情況下逕自規劃或寫入程式碼。
     - 向使用者明確回報：「尚未找到需求規格書 `issues/<topic-folder>/REQUIREMENT.md`，無法進行規格規劃。」
     - 明確引導使用者：「請先輸入 `/grill-me` 進行需求訪談與邊界對齊，產出 `REQUIREMENT.md` 後再執行 `/plan`。」

### 步驟 2：程式碼庫深度調研 (Codebase Research)
門檻檢查通過後，以 `REQUIREMENT.md` 為權威輸入深入調研：
- 完整閱讀 `issues/<topic-folder>/REQUIREMENT.md` 的所有內容（特別是範圍、決策紀錄、邊界例外與驗收準則）。
- 深入調研專案程式碼庫：分析相關模組、資料模型、介面定義、相依套件與現有測試。
- 調研過程中主動向使用者同步思考脈絡與調研進度。

### 步驟 3：產出實作計畫 (`PLAN.md`)
於該主題資料夾中建立 `issues/<topic-folder>/PLAN.md`（取代預設的 `<Artifact Directory>/<plan_name>.md`）：

文件結構規範如下：

```markdown
# 實作計畫：[任務/主題名稱]

> 前置需求依據：[REQUIREMENT.md](./REQUIREMENT.md)

## 1. 目標說明 (Goal Description)
簡要說明本計畫如何落實 REQUIREMENT.md 中定義的需求目標。

## 2. 系統架構與技術選型 (Architecture & Design)
- 系統架構設計與資料流向（必要時提供 Mermaid 流程圖）
- 模組與 API 介面簽章定義

## 3. 需使用者審閱事項 (User Review Required)
記錄任何需要使用者審核的架構決策、重大依賴變更或潛在破壞性變更 (Breaking Changes)。
使用 GitHub 警示標籤 (`IMPORTANT` / `WARNING` / `CAUTION`)。

## 4. 檔案異動清單 (Proposed Changes)
按組件或依賴順序排列，使用 `[NEW]`、`[MODIFY]`、`[DELETE]` 明確標記：
- `[NEW] path/to/new_file.py`：新增檔案與核心功能說明
- `[MODIFY] path/to/existing_file.py`：修改既有邏輯（附關鍵 diff 或程式碼片段）
- `[DELETE] path/to/deprecated_file.py`：移除廢棄檔案

## 5. 驗證與測試計畫 (Verification Plan)
- **自動化測試指令**：精確的測試指令（如 `pytest tests/...`、`npm test`）
- **人工驗證步驟**：使用者手動驗收操作與預期結果
```

### 步驟 4：產出單層原子待辦清單 (`TASKS.md`)
依據 `PLAN.md` 的規劃內容，將實作項目分解為**單層未勾選**的待辦清單，存檔於 `issues/<topic-folder>/TASKS.md`：

格式規範（一律採用單層 markdown checkbox，每個項目必須是獨立可驗收的最小粒度）：

```markdown
# 待辦任務清單：[任務/主題名稱]

- [ ] 任務 1：[模組名稱] 建立基礎資料模型與介面定義
- [ ] 任務 2：[模組名稱] 實作核心業務邏輯與例外處理
- [ ] 任務 3：[API/路由] 串接端點與輸入驗證
- [ ] 任務 4：[測試] 撰寫單元測試與邊界條件測試案例
- [ ] 任務 5：[整合驗證] 執行完整測試套件並驗收功能
```

### 步驟 5：使用者審核與觸發實作 (`/proceed`)
1. **等待審核確認**：
   - 向使用者展示已產出的 `PLAN.md` 與 `TASKS.md` 路徑。
   - 清楚告知：「在您明確審查核准計畫之前，不會對專案進行任何實質代碼變更。」
2. **推進實作階段**：
   - 當使用者明確審核核准（例如回覆確認、Proceed 或批准計畫）後，**主動調用 `/proceed` 技能**，正式進入代碼實作階段並依據 `TASKS.md` 逐項推進。
