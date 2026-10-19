/**
 * 50-Startups 線性迴歸分析成果結構化資料集
 * 包含：演算法評估、特徵選擇方式對照、特徵數消長趨勢、特徵相關係數矩陣
 * 適用於：GitHub Pages 與本地離線雙擊預覽 (無 CORS 限制)
 */
window.DASHBOARD_DATA = {
  metadata: {
    datasetName: "50_Startups Dataset",
    totalSamples: 50,
    targetVariable: "Profit",
    splitCondition: "test_size = 0.2, random_state = 0 (Train: 40, Test: 10)",
    bestModel: "OLS (2 Features: R&D Spend + Marketing Spend)",
    generatedAt: "2026-10-19"
  },

  // 頂部核心 KPI 指標摘要
  kpi: {
    bestFeatureCount: 2,
    bestFeatures: ["R&D Spend", "Marketing Spend"],
    bestTestR2: 0.947439,
    bestTestRMSE: 8198.80,
    baselineTestR2: 0.934707,
    baselineTestRMSE: 9137.99,
    rmseReductionPct: 10.28,
    topCorrelatedFeature: "R&D Spend (r = 0.9729)",
    featureReductionRate: "60% (5 -> 2 特徵)"
  },

  // 演算法綜合對比 (全部特徵基準下)
  algorithms: [
    {
      id: "ols",
      name: "Multiple Linear Regression (OLS)",
      category: "標準線性迴歸",
      trainR2: 0.950185,
      testR2: 0.934707,
      testRMSE: 9137.99,
      testMAE: 7514.29,
      regularization: "無",
      complexity: "低",
      badge: "基準模型",
      description: "採用普通最小平方法，計算速度最快，但在包含共線性噪音特徵時易有微幅過擬合。"
    },
    {
      id: "ridge",
      name: "Ridge Regression (L2)",
      category: "正則化迴歸",
      trainR2: 0.950183,
      testR2: 0.935191,
      testRMSE: 9105.71,
      testMAE: 7487.27,
      regularization: "L2 (alpha=1.0)",
      complexity: "中",
      badge: "抗共線性",
      description: "透過 L2 範數懲罰平滑收縮係數，有效抑制多重共線性，RMSE 優於基準 OLS。"
    },
    {
      id: "lasso",
      name: "Lasso Regression (L1)",
      category: "稀疏化正則化",
      trainR2: 0.950149,
      testR2: 0.936886,
      testRMSE: 8979.66,
      testMAE: 7398.61,
      regularization: "L1 (alpha=100.0)",
      complexity: "中",
      badge: "自動特徵稀疏",
      description: "透過 L1 範數懲罰將不顯著特徵係數直接歸零，具備特徵選擇能力，顯著降低測試集誤差。"
    },
    {
      id: "elasticnet",
      name: "ElasticNet (L1 + L2)",
      category: "混合正則化",
      trainR2: 0.950012,
      testR2: 0.939414,
      testRMSE: 8805.00,
      testMAE: 7321.09,
      regularization: "L1+L2 (alpha=100.0, ratio=0.5)",
      complexity: "中高",
      badge: "最佳泛化 (全特徵)",
      description: "結合 L1 稀疏性與 L2 平滑性，在 5 個全特徵下取得最高的測試集 R² 與最低 RMSE。"
    }
  ],

  // 特徵選擇方式深度比較
  featureSelectionMethods: [
    {
      id: "sfs",
      name: "循序前向選擇 (SFS)",
      type: "包裝法 (Wrapper Method)",
      selectedCount: 2,
      selectedFeatures: ["R&D Spend", "Marketing Spend"],
      testR2: 0.947439,
      testRMSE: 8198.80,
      featureReduction: "60%",
      computeCost: "中等 (迭代擬合子集)",
      verdict: "全局最優 (精簡且指標最高)",
      pros: "直接以模型目標指標為導向，有效捕捉特徵間非線性互補效益",
      cons: "當特徵數量極龐大時運算耗時較長"
    },
    {
      id: "correlation",
      name: "皮爾森相關係數過濾 (Filter)",
      type: "過濾法 (Filter Method)",
      selectedCount: 2,
      selectedFeatures: ["R&D Spend", "Marketing Spend"],
      testR2: 0.947439,
      testRMSE: 8198.80,
      featureReduction: "60%",
      computeCost: "極低 (單次相關係數計算)",
      verdict: "極速且結論與 SFS 完美吻合",
      pros: "計算極度迅速、無模型相依性，高相關特徵排序直觀明瞭",
      cons: "僅衡量單特徵與目標變數之線性相關，無法衡量特徵間冗餘與多重共線性"
    },
    {
      id: "lasso_embed",
      name: "Lasso 稀疏嵌入選取 (Embedded)",
      type: "嵌入法 (Embedded Method)",
      selectedCount: 3,
      selectedFeatures: ["R&D Spend", "Marketing Spend", "Administration"],
      testR2: 0.936886,
      testRMSE: 8979.66,
      featureReduction: "40%",
      computeCost: "低 (單次正則化最佳化)",
      verdict: "自動稀疏化類別特徵",
      pros: "訓練過程內建特徵選擇，自動將不重要的 State 虛擬變數權重收縮至零",
      cons: "對於相關性高的特徵群可能隨機挑選單一代表，需微調正則化強度 alpha"
    },
    {
      id: "full_features",
      name: "全特徵基準 (All Features)",
      type: "無選取 (Baseline)",
      selectedCount: 5,
      selectedFeatures: ["R&D Spend", "Administration", "Marketing Spend", "State_New York", "State_Florida"],
      testR2: 0.934707,
      testRMSE: 9137.99,
      featureReduction: "0%",
      computeCost: "無額外開銷",
      verdict: "受噪音特徵拖累，泛化最差",
      pros: "保留全部原始資訊，無需任何前置選擇流程",
      cons: "模型維度過高、引入 Administration 與州別等低相關噪音，測試集 RMSE 明顯劣化"
    }
  ],

  // 特徵數量消長漸進對比 (k = 1 到 5)
  featureCountSensitivity: [
    {
      k: 1,
      features: ["R&D Spend"],
      featuresLabel: "R&D Spend",
      trainR2: 0.944959,
      testR2: 0.946459,
      testRMSE: 8274.87,
      testMAE: 6772.45,
      note: "單一核心特徵即具備極高預測力 (R² > 0.946)"
    },
    {
      k: 2,
      features: ["R&D Spend", "Marketing Spend"],
      featuresLabel: "R&D + Marketing",
      trainR2: 0.949665,
      testR2: 0.947439,
      testRMSE: 8198.80,
      testMAE: 6886.59,
      isOptimal: true,
      note: "黃金最佳組合：RMSE 降至歷史最低 8198.80，R² 達最高 0.9474"
    },
    {
      k: 3,
      features: ["R&D Spend", "Marketing Spend", "State_New York"],
      featuresLabel: "R&D + Marketing + NY",
      trainR2: 0.949764,
      testR2: 0.946015,
      testRMSE: 8309.06,
      testMAE: 7028.44,
      note: "納入紐約州虛擬變數，測試誤差開始反彈增加"
    },
    {
      k: 4,
      features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"],
      featuresLabel: "R&D + Marketing + NY + FL",
      trainR2: 0.949826,
      testR2: 0.944697,
      testRMSE: 8409.92,
      testMAE: 7109.16,
      note: "加入佛羅里達州，測試集 RMSE 進一步微幅劣化"
    },
    {
      k: 5,
      features: ["R&D Spend", "Administration", "Marketing Spend", "State_New York", "State_Florida"],
      featuresLabel: "全特徵 (含 Administration)",
      trainR2: 0.950185,
      testR2: 0.934707,
      testRMSE: 9137.99,
      testMAE: 7514.29,
      note: "納入行政支出 (低相關)，模型複雜度上升且泛化能力最差 (RMSE 破 9100)"
    }
  ],

  // 特徵與目標變數 (Profit) 之皮爾森相關係數
  correlations: [
    { feature: "R&D Spend", correlation: 0.9729, absCorr: 0.9729, significance: "極高正相關", impact: "關鍵主要驅動力" },
    { feature: "Marketing Spend", correlation: 0.7478, absCorr: 0.7478, significance: "高度正相關", impact: "顯著次要輔助特徵" },
    { feature: "Administration", correlation: 0.2007, absCorr: 0.2007, significance: "微弱正相關", impact: "模型噪音 / 干擾項" },
    { feature: "State_Florida", correlation: 0.1162, absCorr: 0.1162, significance: "極弱正相關", impact: "區域效應不明顯" },
    { feature: "State_New York", correlation: 0.0649, absCorr: 0.0649, significance: "幾乎無相關", impact: "無預測邊際價值" }
  ],

  // 即時預測模型迴歸係數定義 (OLS, test_size=0.2, random_state=0)
  predictionModels: {
    k1: {
      id: "k1",
      name: "單特徵模型 (R&D)",
      badge: "極簡基準",
      k: 1,
      rmse: 8274.87,
      r2: 0.946459,
      features: ["R&D Spend"],
      intercept: 48416.2977,
      coefficients: {
        "R&D Spend": 0.851623
      },
      formula: "Profit = 48,416.30 + 0.8516 × (R&D)",
      insight: "僅憑研發支出單一項即可解釋高達 94.6% 的獲利變異，驗證研發投入為企業成長核心動力。"
    },
    k2: {
      id: "k2",
      name: "最佳 2 特徵模型 (R&D + Marketing)",
      badge: "👑 最優推薦 (奧坎剃刀)",
      isOptimal: true,
      k: 2,
      rmse: 8198.80,
      r2: 0.947439,
      features: ["R&D Spend", "Marketing Spend"],
      intercept: 46346.3388,
      coefficients: {
        "R&D Spend": 0.788618,
        "Marketing Spend": 0.032577
      },
      formula: "Profit = 46,346.34 + 0.7886 × (R&D) + 0.0326 × (Marketing)",
      insight: "奧坎剃刀黃金組合：兼顧研發與行銷投入，在測試集取得全特徵更優之最小誤差 ($8,198.80) 與最高解釋力 (0.9474)。"
    },
    k3: {
      id: "k3",
      name: "3 特徵模型 (R&D + Marketing + NY)",
      badge: "微幅過擬合",
      k: 3,
      rmse: 8309.06,
      r2: 0.946015,
      features: ["R&D Spend", "Marketing Spend", "State_New York"],
      intercept: 46100.2913,
      coefficients: {
        "R&D Spend": 0.785871,
        "Marketing Spend": 0.033272,
        "State_New York": 864.001870
      },
      formula: "Profit = 46,100.29 + 0.7859 × (R&D) + 0.0333 × (Mkt) + 864.00 × (NY)",
      insight: "納入紐約州虛擬變數後，測試集 RMSE 開始由 8198 反彈至 8309，呈現邊際效益遞減。"
    },
    k4: {
      id: "k4",
      name: "4 特徵模型 (R&D + Marketing + NY + FL)",
      badge: "邊際效益遞減",
      k: 4,
      rmse: 8409.92,
      r2: 0.944697,
      features: ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"],
      intercept: 46329.0602,
      coefficients: {
        "R&D Spend": 0.785142,
        "Marketing Spend": 0.033956,
        "State_New York": 554.657333,
        "State_Florida": -826.468159
      },
      formula: "Profit = 46,329.06 + 0.7851 × (R&D) + 0.0340 × (Mkt) + 554.66 × (NY) - 826.47 × (FL)",
      insight: "加入佛羅里達州後測試集表現持續下滑，顯見地區虛擬變數對獲利預測之噪音大於信號。"
    },
    k5: {
      id: "k5",
      name: "全 5 特徵基準模型 (All Features)",
      badge: "全特徵基準 (泛化最差)",
      k: 5,
      rmse: 9137.99,
      r2: 0.934707,
      features: ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"],
      intercept: 42554.1676,
      coefficients: {
        "R&D Spend": 0.773467,
        "Administration": 0.032885,
        "Marketing Spend": 0.036610,
        "State_Florida": -959.284160,
        "State_New York": 699.369053
      },
      formula: "Profit = 42,554.17 + 0.7735 × (R&D) + 0.0329 × (Admin) + 0.0366 × (Mkt) - 959.28 × (FL) + 699.37 × (NY)",
      insight: "納入行政支出與全州別變數，因多重共線性與低相關噪音拖累，測試集 RMSE 激增至 $9,137.99。"
    }
  },

  // 經典情境預設組合 (便於使用者一鍵試算體驗)
  predictionPresets: [
    {
      id: "avg",
      name: "典型平均新創",
      tag: "50家母體平均值",
      desc: "反映 50 家新創公司歷史均值配置",
      rd: 74000,
      mkt: 210000,
      admin: 121000,
      state: "California"
    },
    {
      id: "tech",
      name: "硬科技研發型",
      tag: "Deep Tech",
      desc: "高強度研發投入，著重技術突破與專利建構",
      rd: 160000,
      mkt: 100000,
      admin: 110000,
      state: "New York"
    },
    {
      id: "growth",
      name: "市場擴張導向",
      tag: "Growth Marketing",
      desc: "高行銷預算快速獲取市場份額與用戶規模",
      rd: 60000,
      mkt: 420000,
      admin: 130000,
      state: "Florida"
    },
    {
      id: "lean",
      name: "精實自籌新創",
      tag: "Lean Bootstrap",
      desc: "極低預算精準營運，控制行政與行銷成本",
      rd: 20000,
      mkt: 15000,
      admin: 60000,
      state: "California"
    }
  ],

  // 歷史數據集基準指標
  historicalBenchmark: {
    meanProfit: 112012.64,
    medianProfit: 107978.19,
    minProfit: 14681.40,
    maxProfit: 192261.83
  }
};
