# 待辦任務清單：統一筆記本 Import 語句至首格

- [x] 任務 1：重構 50-startups 筆記本首個 Code 儲存格，按 PEP 8 規範彙整所有 import（已於 Cell 3 集中 Path、標準庫與第三方函式庫，AST 解析通過）
- [x] 任務 2：移除 50-startups 筆記本後續儲存格（Cell 5 與 Cell 129）中分散的 import 語句（已成功抽離 import，保留檔案載入與繪圖邏輯，總儲存格數維持 161）
- [x] 任務 3：重構 boston-housing 筆記本首個 Code 儲存格，按 PEP 8 規範彙整所有 import 並置底魔術指令（已於 Cell 2 集中第三方庫並將 %matplotlib inline 置底，AST 檢驗通過）
- [x] 任務 4：移除 boston-housing 筆記本後續儲存格（Cell 22 與 Cell 27）之 import 並刪除全空儲存格（已安全刪除 Cell 22，抽離原 Cell 27 import 並保留評估邏輯，儲存格數由 35 調整為 34）
- [x] 任務 5：執行自動化語法檢查與結構驗證，確保 JSON 完整性且無遺留 import 與空白格（自動化檢驗腳本執行通過，所有 import 均已 100% 隔離至首個 Code 儲存格，AST 及 nbformat 規範均合規）
