# 待辦任務清單：50-startups 線性迴歸筆記本之 scikit-learn Pipeline 現代化重構

- [x] 任務 1：備份現有筆記本並建立整併後之結構骨架（已備份至 .bak，建立 19 格高聚合骨架，首格遵循 PEP 8 匯入規範）
- [x] 任務 2：實作 EDA 複合子圖視覺化與無洩漏之資料集切分（已實作 2x2 箱形圖、分布圖與熱圖，切分 X_train 與 X_test 徹底消除 Data Leakage）
- [x] 任務 3：實作 ColumnTransformer 前處理與 TransformedTargetRegressor Pipeline 封裝（已封裝數值標準化、One-Hot 編碼與目標值反標準化回歸器）
- [x] 任務 4：實作 5-Fold 交叉驗證多模型比較、殘差診斷繪圖與新資料端到端預測（完成 3 款模型 5-Fold CV 比較、殘差圖診斷、測試集評估與新樣本直接預測）
- [x] 任務 5：透過執行核心完整執行筆記本以刷新持久化圖表輸出，並通過自動化結構與 AST 驗證（已透過 NotebookClient 完整執行，持久化 5 張高解析圖表與所有輸出，全數通過 nbformat 與 AST 檢驗）
- [x] 任務 6：更新 KEEP.md 記錄 scikit-learn Pipeline 與目標轉換最佳實踐規範（已補充 Pipeline、ColumnTransformer 與 TransformedTargetRegressor 官方文件連結）
