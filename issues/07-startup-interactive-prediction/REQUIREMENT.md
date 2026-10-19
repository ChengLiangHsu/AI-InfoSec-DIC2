# 需求規格書：50-Startups 線性迴歸即時獲利預測試算器 (07-startup-interactive-prediction)

## 1. 背景與目標 (Background & Goals)
- **核心痛點**：目前的 50-Startups 線性迴歸分析儀表板 (`docs/index.html`) 聚焦於演算法評估與特徵選擇之靜態指標呈現，缺乏使用者可直接動手操作、模擬新創公司投資配置並即時獲取預測結果的互動體驗。
- **改動目標**：參考 `https://huanchen1107.github.io/AIoT-DIC2-MultipleLR/` 的 Live Profit Predictor 設計，在 `docs/index.html` 整合「即時獲利預測試算器 (Live Profit Predictor)」。使用者可隨意滑動各特徵數值滑桿或手動鍵入數字，即時獲得多元線性迴歸模型的獲利預測金額、各特徵貢獻拆解與模型係數連動回饋。

## 2. 功能範圍 (Scope)
- **包含項目 (In Scope)**：
  1. **多模型切換運算引擎**：
     - 支援切換「最佳 2 特徵模型 (R&D + Marketing, k=2)」、「全 5 特徵基準模型 (k=5)」、「單特徵模型 (R&D, k=1)」、「3 特徵模型 (k=3)」與「4 特徵模型 (k=4)」。
     - 切換模型時，未被納入當前模型的特徵控制項自動呈現半透明反灰停用狀態 (Disabled)，並即時刷新數學迴歸公式。
  2. **雙向同步互動控制項**：
     - 提供研發支出 (R&D Spend)、行銷支出 (Marketing Spend)、行政支出 (Administration) 的「滑桿 (Range Slider) + 數值輸入框 (Number Input) + 格式化即時標籤」雙向綁定。
     - 提供州別所在地 (State Location) 下拉選單：加州 (California，基準組)、紐約州 (New York)、佛羅里達州 (Florida)。
  3. **一鍵經典情境預設按鈕 (Quick Scenario Presets)**：
     - 提供「典型平均新創 (Average Startup)」、「高硬科技研發 (R&D Heavy)」、「市場擴張導向 (Growth Marketing)」、「精實自籌新創 (Lean Bootstrap)」等一鍵填入按鈕。
  4. **即時運算與邊際貢獻拆解面板**：
     - 毫秒級即時計算預估獲利金額 (`$123,456.78`)，並提供數值滾動微動畫與與資料集平均獲利 ($112,012.64) 的相對高低百分比指示。
     - 展開顯示該模型目前使用之特徵子集、截距項 ($\beta_0$) 與各特徵產生的正負收益貢獻明細 (`R&D: +$85,162`、`Marketing: +$4,886`)。
  5. **導覽列與數據結構相容**：
     - 於頂部導覽列加入「即時試算」錨點連結。
     - 在 `docs/data.js` 補充各特徵子集之精確截距與係數矩陣 (`predictionModels`)，保持單一真相來源。

- **排除項目 (Out of Scope)**：
  - 本地不引入額外後端伺服器或 Python 執行期環境，維持純瀏覽器端 Vanilla JS 算力。
  - 不變更現有之四大分析圖表（演算法比較、特徵選取方式、敏感度曲線、數據表）既有展示。

## 3. 決策歷程與討論紀錄 (Key Decisions & Rationale)
1. **模型選擇架構**：
   - 採納推薦方案：提供「模型選擇下拉選單/按鈕切換」，並根據當前模型動態啟用/反灰對應之特徵滑桿。相較於死鎖特定模型，能讓訪客直觀驗證「為何 2 特徵模型表現比全特徵模型更好」，具備強大教學與說服力。
2. **輸入控制項體驗**：
   - 採納推薦方案：同時具備「滑桿 (直覺拖曳感受趨勢)」與「數字輸入框 (精確輸入具體金額)」，並加上「一鍵情境預設按鈕」，大幅降低操作阻力。
3. **計算架構與資料整合**：
   - 將所有子集模型的嚴格 OLS 係數矩陣（透過 `test_size=0.2, random_state=0` 擬合）結構化封裝於 `docs/data.js`，避免寫死在 HTML，維持架構整潔與易維護性。

## 4. 邊界條件與例外處理 (Edge Cases & Error Handling)
1. **數值極值與無效輸入限制**：
   - 數值下限防呆：當使用者輸入負數時，自動修正 (clamp) 為 0。
   - 數值上限限制：R&D 最大 $250,000、Marketing 最大 $500,000、Admin 最大 $250,000，超過上限時自動限制在最大值。
   - 非法輸入防呆：若輸入框出現空白、非數字字元或 NaN，預設回退安全值 0 進行計算，避免計算報錯。
2. **模型特徵停用狀態反饋**：
   - 切換至 k=2 模型時，Administration 與 State 控制項半透明反灰 (opacity: 0.45, pointer-events: none)，並標示「非當前模型特徵 (Inactive)」，清楚傳達該特徵不參與計算。
3. **離線與相依性容錯**：
   - 計算邏輯純依賴 Vanilla JS 內建浮點數運算與字串格式化，0 外部第三方函式庫依賴，即使 CDN 斷線或離線雙擊開啟網頁亦能 100% 正常運算。

## 5. 非功能性需求 (Non-Functional Requirements)
- **美學標準**：承襲當前網頁最高規格之純深色琉璃風 (Glassmorphism)，包含精緻漸層滑軌、自訂發光 Thumb、毛玻璃卡片、微光邊框與流暢過渡動畫。
- **響應式佈局 (Responsive Design)**：確保在桌面大螢幕 (雙欄或三欄對齊) 與行動端 (單欄堆疊) 均能完美操作，觸控滑桿流暢不卡頓。
- **效能指標**：滑桿拖曳觸發之即時運算與 DOM 渲染耗時小於 5ms，無延遲與重繪卡頓。

## 6. 驗收準則 (Acceptance Criteria)
- [ ] 驗收條件 1：[docs/data.js](file:///c:/Users/amath701/Downloads/AI-InfoSec-DIC2/docs/data.js) 完整擴充各模型子集之截距與係數定義 (`predictionModels`)，數值與筆記本訓練結果 100% 一致。
- [ ] 驗收條件 2：[docs/index.html](file:///c:/Users/amath701/Downloads/AI-InfoSec-DIC2/docs/index.html) 成功整合「即時獲利預測試算器」區塊與頂部導覽列錨點。
- [ ] 驗收條件 3：[docs/app.js](file:///c:/Users/amath701/Downloads/AI-InfoSec-DIC2/docs/app.js) 實作雙向滑桿/輸入框數值同步、動態模型切換與即時公式拆解計算邏輯。
- [ ] 驗收條件 4：[docs/style.css](file:///c:/Users/amath701/Downloads/AI-InfoSec-DIC2/docs/style.css) 提供高質感滑桿樣式、停用反灰過渡效果、情境預設按鈕與預測數值光暈反饋。
- [ ] 驗收條件 5：四組經典情境按鈕（平均、研發導向、行銷導向、精實）點擊後數值與滑桿能立即正確更新並同步重新計算預測獲利。
- [ ] 驗收條件 6：啟動瀏覽器驗證端到端互動行為，確認滑桿拖曳、輸入框變更、模型切換與預測金額顯示均運作正常且無任何 JavaScript 主控台報錯。
