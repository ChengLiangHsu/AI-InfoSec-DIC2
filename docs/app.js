/**
 * 50-Startups Analysis Dashboard - Interactive Controller
 * Powered by Pure Vanilla JavaScript & Chart.js v4
 */

function initDashboard() {
  const data = window.DASHBOARD_DATA;

  // 1. 初始化 Chart.js 全域深色主題
  try {
    setupChartGlobalDefaults();
  } catch (err) {
    console.warn("Chart.js setup warning:", err);
  }

  // 2. 渲染頂部 KPI 摘要卡
  try {
    if (data && data.kpi) renderKPICards(data.kpi);
  } catch (err) {
    console.warn("KPI render error:", err);
  }

  // 3. 渲染演算法比較模組 (圖表 + 卡片)
  try {
    if (data && data.algorithms) initAlgorithmsModule(data.algorithms);
  } catch (err) {
    console.warn("Algorithms module error:", err);
  }

  // 4. 渲染特徵選擇方式模組 (卡片 + 相關係數圖)
  try {
    if (data && data.featureSelectionMethods) initFeatureSelectionModule(data.featureSelectionMethods, data.correlations);
  } catch (err) {
    console.warn("Feature selection module error:", err);
  }

  // 5. 渲染特徵數量漸進消長雙軸折線圖
  try {
    if (data && data.featureCountSensitivity) initFeatureCountChart(data.featureCountSensitivity);
  } catch (err) {
    console.warn("Sensitivity chart error:", err);
  }

  // 6. 渲染與初始化互動數據表格 (支援排序)
  try {
    if (data && data.featureCountSensitivity) initInteractiveTable(data.featureCountSensitivity);
  } catch (err) {
    console.warn("Interactive table error:", err);
  }

  // 7. 渲染與初始化新創獲利即時預測試算器（具備強韌降級備援）
  try {
    const models = (data && data.predictionModels) ? data.predictionModels : DEFAULT_PREDICTION_MODELS;
    const presets = (data && data.predictionPresets) ? data.predictionPresets : DEFAULT_PRESETS;
    const benchmark = (data && data.historicalBenchmark) ? data.historicalBenchmark : DEFAULT_BENCHMARK;
    initPredictorModule(models, presets, benchmark);
  } catch (err) {
    console.error("Predictor module initialization error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}

/* ==========================================================================
   1. Chart.js Global Defaults
   ========================================================================== */
function setupChartGlobalDefaults() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(99, 102, 241, 0.3)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.boxPadding = 6;
}

/* ==========================================================================
   2. Render KPI Summary Cards
   ========================================================================== */
function renderKPICards(kpi) {
  const container = document.getElementById("kpi-container");
  if (!container) return;

  const cardsHtml = `
    <!-- Card 1: 最佳模型組態 -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">最佳模型特徵數</span>
        <div class="kpi-icon cyan">🎯</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-cyan);">${kpi.bestFeatureCount} <span style="font-size: 1.1rem; font-weight: 500;">Features</span></div>
      <div class="kpi-meta">
        <span>${kpi.bestFeatures.join(" + ")}</span>
        <span class="kpi-badge badge-cyan">${kpi.featureReductionRate}</span>
      </div>
    </div>

    <!-- Card 2: 最佳測試集 R² -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">最佳測試集 R² (解釋力)</span>
        <div class="kpi-icon indigo">📈</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-indigo);">${kpi.bestTestR2.toFixed(4)}</div>
      <div class="kpi-meta">
        <span>全特徵基準: ${kpi.baselineTestR2.toFixed(4)}</span>
        <span class="kpi-badge badge-indigo">+${((kpi.bestTestR2 - kpi.baselineTestR2) * 100).toFixed(2)}% Δ</span>
      </div>
    </div>

    <!-- Card 3: 最佳測試集 RMSE -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">最佳測試集 RMSE (誤差)</span>
        <div class="kpi-icon emerald">⚡</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-emerald);">$${kpi.bestTestRMSE.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div class="kpi-meta">
        <span>基準誤差: $${kpi.baselineTestRMSE.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        <span class="kpi-badge badge-emerald">-${kpi.rmseReductionPct}% 誤差</span>
      </div>
    </div>

    <!-- Card 4: 最關鍵驅動特徵 -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">最高相關性特徵</span>
        <div class="kpi-icon amber">🔥</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-amber); font-size: 1.6rem; line-height: 1.4;">R&D Spend</div>
      <div class="kpi-meta">
        <span>皮爾森相關係數: r = 0.9729</span>
        <span class="kpi-badge badge-cyan">決定性因子</span>
      </div>
    </div>
  `;

  container.innerHTML = cardsHtml;
}

/* ==========================================================================
   3. Algorithms Module (Chart & Details)
   ========================================================================== */
function initAlgorithmsModule(algorithms) {
  // 3.1 演算法圖表
  const ctx = document.getElementById("chart-algorithms");
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: algorithms.map(a => a.name.split(' (')[0]),
        datasets: [
          {
            label: '測試集 RMSE (誤差，越低越好)',
            data: algorithms.map(a => a.testRMSE),
            backgroundColor: 'rgba(99, 102, 241, 0.65)',
            borderColor: '#6366f1',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'yRMSE'
          },
          {
            label: '測試集 R² (解釋力，越高越好)',
            data: algorithms.map(a => a.testR2),
            backgroundColor: 'rgba(6, 182, 212, 0.65)',
            borderColor: '#06b6d4',
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: 'yR2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { display: false }
          },
          yRMSE: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: '測試集 RMSE ($)' },
            min: 8000,
            max: 9500,
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          yR2: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: '測試集 R²' },
            min: 0.92,
            max: 0.95,
            grid: { display: false }
          }
        }
      }
    });
  }

  // 3.2 演算法卡片解析
  const listContainer = document.getElementById("algorithm-cards-container");
  if (listContainer) {
    listContainer.innerHTML = algorithms.map(a => `
      <div style="padding: 1rem; border-radius: 10px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <strong style="color: #fff; font-size: 0.95rem;">${a.name}</strong>
            <span class="kpi-badge badge-indigo" style="font-size: 0.7rem;">${a.badge}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">${a.description}</p>
        </div>
        <div style="text-align: right; min-width: 130px;">
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-cyan);">R²: ${a.testR2.toFixed(4)}</div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">RMSE: $${Math.round(a.testRMSE).toLocaleString()}</div>
        </div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   4. Feature Selection Methods Module
   ========================================================================== */
function initFeatureSelectionModule(methods, correlations) {
  // 4.1 特徵選取方式卡片
  const container = document.getElementById("methods-container");
  if (container) {
    container.innerHTML = methods.map(m => `
      <div class="glass-card method-card ${m.id === 'sfs' ? 'featured' : ''}">
        <div>
          <div class="method-title">${m.name}</div>
          <div class="method-type">${m.type}</div>
          
          <div class="method-stats">
            <div class="method-stat-item">
              <span class="stat-label">最佳特徵數</span>
              <span class="stat-val" style="color: var(--accent-cyan);">${m.selectedCount} 個</span>
            </div>
            <div class="method-stat-item">
              <span class="stat-label">特徵精簡率</span>
              <span class="stat-val" style="color: var(--accent-emerald);">${m.featureReduction}</span>
            </div>
            <div class="method-stat-item">
              <span class="stat-label">測試集 R²</span>
              <span class="stat-val">${m.testR2.toFixed(4)}</span>
            </div>
            <div class="method-stat-item">
              <span class="stat-label">測試集 RMSE</span>
              <span class="stat-val">$${Math.round(m.testRMSE).toLocaleString()}</span>
            </div>
          </div>

          <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.35rem;">選入特徵組合:</div>
          <div class="feature-pill-list">
            ${m.selectedFeatures.map(f => `<span class="feature-pill">${f}</span>`).join('')}
          </div>
        </div>

        <div>
          <p class="method-desc" style="margin-top: 0.5rem; font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
            <strong style="color: var(--text-main);">評語：</strong>${m.verdict}
          </p>
        </div>
      </div>
    `).join('');
  }

  // 4.2 皮爾森相關係數長條圖
  const corrCtx = document.getElementById("chart-correlations");
  if (corrCtx && typeof Chart !== 'undefined') {
    new Chart(corrCtx, {
      type: 'bar',
      data: {
        labels: correlations.map(c => c.feature),
        datasets: [{
          label: '與目標變數 (Profit) 之相關係數 r',
          data: correlations.map(c => c.correlation),
          backgroundColor: correlations.map(c => 
            c.correlation > 0.8 ? 'rgba(16, 185, 129, 0.75)' :
            c.correlation > 0.5 ? 'rgba(6, 182, 212, 0.75)' :
            'rgba(148, 163, 184, 0.45)'
          ),
          borderColor: correlations.map(c => 
            c.correlation > 0.8 ? '#10b981' :
            c.correlation > 0.5 ? '#06b6d4' :
            '#94a3b8'
          ),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            min: 0,
            max: 1.0,
            title: { display: true, text: '皮爾森相關係數 (r)' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }
}

/* ==========================================================================
   5. Feature Count Sensitivity Double-Axis Line Chart
   ========================================================================== */
function initFeatureCountChart(sensitivityData) {
  const ctx = document.getElementById("chart-feature-counts");
  if (!ctx || typeof Chart === 'undefined') return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: sensitivityData.map(d => `${d.k} 特徵`),
      datasets: [
        {
          label: '測試集 RMSE (越低越好)',
          data: sensitivityData.map(d => d.testRMSE),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'yRMSE'
        },
        {
          label: '測試集 R² (越高越好)',
          data: sensitivityData.map(d => d.testR2),
          borderColor: '#06b6d4',
          backgroundColor: 'transparent',
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.35,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'yR2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function(items) {
              const idx = items[0].dataIndex;
              const item = sensitivityData[idx];
              return `特徵數: ${item.k} (${item.featuresLabel})`;
            },
            afterBody: function(items) {
              const idx = items[0].dataIndex;
              const item = sensitivityData[idx];
              return [
                `----------------------------`,
                `納入特徵清單:`,
                ...item.features.map(f => ` • ${f}`),
                `----------------------------`,
                `訓練集 R²: ${item.trainR2.toFixed(6)}`,
                `說明: ${item.note}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        yRMSE: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: '測試集 RMSE ($)' },
          min: 8000,
          max: 9400,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        yR2: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: '測試集 R²' },
          min: 0.93,
          max: 0.95,
          grid: { display: false }
        }
      }
    }
  });
}

/* ==========================================================================
   6. Interactive Sortable Data Table
   ========================================================================== */
function initInteractiveTable(sensitivityData) {
  const tbody = document.getElementById("table-body");
  const headers = document.querySelectorAll("#interactive-table th[data-sort]");
  if (!tbody || !headers.length) return;

  let currentSortKey = "k";
  let currentSortAsc = true;
  let tableData = [...sensitivityData];

  function renderTableRows(rows) {
    tbody.innerHTML = rows.map(r => `
      <tr class="${r.isOptimal ? 'row-optimal' : ''}">
        <td>
          <span class="mono-val" style="font-weight: 700; color: ${r.isOptimal ? 'var(--accent-cyan)' : 'inherit'};">k = ${r.k}</span>
          ${r.isOptimal ? '<span class="kpi-badge badge-emerald" style="margin-left: 0.5rem;">👑 最優組態</span>' : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: #fff; margin-bottom: 0.2rem;">${r.featuresLabel}</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">${r.features.join(", ")}</div>
        </td>
        <td class="mono-val">${r.trainR2.toFixed(6)}</td>
        <td class="mono-val" style="color: ${r.isOptimal ? 'var(--accent-cyan)' : 'inherit'}; font-weight: ${r.isOptimal ? '700' : 'normal'};">${r.testR2.toFixed(6)}</td>
        <td class="mono-val" style="color: ${r.isOptimal ? 'var(--accent-emerald)' : 'inherit'}; font-weight: ${r.isOptimal ? '700' : 'normal'};">$${r.testRMSE.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td class="mono-val">$${r.testMAE.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${r.note}</td>
      </tr>
    `).join('');
  }

  // 排序事件綁定
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const sortKey = th.getAttribute("data-sort");
      if (currentSortKey === sortKey) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortKey = sortKey;
        currentSortAsc = true;
      }

      headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));
      th.classList.add(currentSortAsc ? "sorted-asc" : "sorted-desc");

      tableData.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === 'string') {
          return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return currentSortAsc ? valA - valB : valB - valA;
      });

      renderTableRows(tableData);
    });
  });

  // 初次渲染
  renderTableRows(tableData);
}

/* ==========================================================================
   7. Live Profit Predictor Controller
   ========================================================================== */
const DEFAULT_PREDICTION_MODELS = {
  k1: {
    id: "k1",
    name: "單特徵模型 (R&D)",
    badge: "極簡基準",
    k: 1,
    rmse: 8274.87,
    r2: 0.946459,
    features: ["R&D Spend"],
    intercept: 48416.2977,
    coefficients: { "R&D Spend": 0.851623 },
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
    coefficients: { "R&D Spend": 0.788618, "Marketing Spend": 0.032577 },
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
    coefficients: { "R&D Spend": 0.785871, "Marketing Spend": 0.033272, "State_New York": 864.001870 },
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
    coefficients: { "R&D Spend": 0.785142, "Marketing Spend": 0.033956, "State_New York": 554.657333, "State_Florida": -826.468159 },
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
};

const DEFAULT_PRESETS = [
  { id: "avg", name: "典型平均新創", tag: "50家母體平均值", rd: 74000, mkt: 210000, admin: 121000, state: "California" },
  { id: "tech", name: "硬科技研發型", tag: "Deep Tech", rd: 160000, mkt: 100000, admin: 110000, state: "New York" },
  { id: "growth", name: "市場擴張導向", tag: "Growth Marketing", rd: 60000, mkt: 420000, admin: 130000, state: "Florida" },
  { id: "lean", name: "精實自籌新創", tag: "Lean Bootstrap", rd: 20000, mkt: 15000, admin: 60000, state: "California" }
];

const DEFAULT_BENCHMARK = {
  meanProfit: 112012.64,
  medianProfit: 107978.19,
  minProfit: 14681.40,
  maxProfit: 192261.83
};

function initPredictorModule(models, presets, benchmark) {
  const predictionModels = models || DEFAULT_PREDICTION_MODELS;
  const predictionPresets = presets || DEFAULT_PRESETS;
  const historicalBenchmark = benchmark || DEFAULT_BENCHMARK;

  let activeModelKey = "k2"; // 預設使用奧坎剃刀最優 2 特徵模型

  // DOM 元素引用
  const modelPills = document.querySelectorAll("#model-selector-group .model-pill");
  const modelBadge = document.getElementById("predictor-model-badge");
  const modelMeta = document.getElementById("pred-model-meta");
  const presetContainer = document.getElementById("preset-buttons-container");
  
  // 輸入控制群與標籤
  const sliderRd = document.getElementById("slider-rd");
  const numRd = document.getElementById("num-rd");
  const labelRd = document.getElementById("label-rd");

  const sliderMkt = document.getElementById("slider-mkt");
  const numMkt = document.getElementById("num-mkt");
  const labelMkt = document.getElementById("label-mkt");

  const groupAdmin = document.getElementById("input-group-admin");
  const statusAdmin = document.getElementById("status-badge-admin");
  const sliderAdmin = document.getElementById("slider-admin");
  const numAdmin = document.getElementById("num-admin");
  const labelAdmin = document.getElementById("label-admin");

  const groupState = document.getElementById("input-group-state");
  const statusState = document.getElementById("status-badge-state");
  const selectState = document.getElementById("select-state");
  const labelState = document.getElementById("label-state");

  // 結果呈現與公式分解
  const profitValueEl = document.getElementById("pred-profit-value");
  const benchmarkPill = document.getElementById("pred-benchmark-pill");
  const benchmarkIcon = document.getElementById("benchmark-icon");
  const benchmarkPct = document.getElementById("benchmark-pct");
  const formulaBox = document.getElementById("pred-formula-box");
  const formulaCountBadge = document.getElementById("formula-feature-count");
  const breakdownList = document.getElementById("pred-breakdown-list");
  const insightText = document.getElementById("pred-insight-text");

  // 1. 綁定情境預設按鈕
  function attachPresetListeners() {
    if (!presetContainer) return;
    const presetBtns = presetContainer.querySelectorAll(".preset-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const presetId = btn.getAttribute("data-preset-id");
        const selectedPreset = predictionPresets.find(p => p.id === presetId);
        if (selectedPreset) {
          applyPresetValues(selectedPreset);
        }
      });
    });
  }

  if (presetContainer && predictionPresets) {
    // 若尚未由 HTML 靜態渲染按鈕，動態補齊
    if (!presetContainer.children.length) {
      presetContainer.innerHTML = predictionPresets.map(p => `
        <button type="button" class="preset-btn ${p.id === 'avg' ? 'active' : ''}" data-preset-id="${p.id}">
          <span>${p.name}</span>
          <span style="font-size: 0.68rem; opacity: 0.7;">(${p.tag})</span>
        </button>
      `).join('');
    }
    attachPresetListeners();
  }

  // 套用情境預設數值
  function applyPresetValues(p) {
    if (sliderRd && numRd && labelRd) {
      sliderRd.value = p.rd;
      numRd.value = p.rd;
      labelRd.textContent = `$${Number(p.rd).toLocaleString()}`;
    }

    if (sliderMkt && numMkt && labelMkt) {
      sliderMkt.value = p.mkt;
      numMkt.value = p.mkt;
      labelMkt.textContent = `$${Number(p.mkt).toLocaleString()}`;
    }

    if (sliderAdmin && numAdmin && labelAdmin) {
      sliderAdmin.value = p.admin;
      numAdmin.value = p.admin;
      labelAdmin.textContent = `$${Number(p.admin).toLocaleString()}`;
    }

    if (selectState && labelState) {
      selectState.value = p.state;
      labelState.textContent = p.state;
    }

    calculatePrediction();
  }

  // 2. 雙向滑桿與數字框同步綁定 (監聽 input 與 change 事件)
  function bindSyncInput(slider, num, label, min, max) {
    if (!slider || !num || !label) return;
    const clamp = (val) => Math.min(Math.max(val, min), max);

    const syncFromVal = (raw) => {
      const parsed = parseFloat(raw);
      const val = clamp(isNaN(parsed) ? min : parsed);
      slider.value = val;
      num.value = val;
      label.textContent = `$${Number(val).toLocaleString()}`;
      clearActivePresetHighlight();
      calculatePrediction();
    };

    slider.addEventListener("input", () => syncFromVal(slider.value));
    slider.addEventListener("change", () => syncFromVal(slider.value));

    num.addEventListener("input", () => syncFromVal(num.value));
    num.addEventListener("change", () => syncFromVal(num.value));

    num.addEventListener("blur", () => {
      let raw = parseFloat(num.value);
      if (isNaN(raw) || raw < min) raw = min;
      if (raw > max) raw = max;
      syncFromVal(raw);
    });
  }

  bindSyncInput(sliderRd, numRd, labelRd, 0, 250000);
  bindSyncInput(sliderMkt, numMkt, labelMkt, 0, 500000);
  bindSyncInput(sliderAdmin, numAdmin, labelAdmin, 0, 250000);

  if (selectState) {
    selectState.addEventListener("change", () => {
      if (labelState) labelState.textContent = selectState.value;
      clearActivePresetHighlight();
      calculatePrediction();
    });
  }

  function clearActivePresetHighlight() {
    if (!presetContainer) return;
    const presetBtns = presetContainer.querySelectorAll(".preset-btn");
    presetBtns.forEach(b => b.classList.remove("active"));
  }

  // 3. 模型切換互動與特徵狀態更新
  modelPills.forEach(pill => {
    pill.addEventListener("click", () => {
      modelPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeModelKey = pill.getAttribute("data-model");
      updateModelUIState();
      calculatePrediction();
    });
  });

  function updateModelUIState() {
    const model = predictionModels[activeModelKey] || predictionModels["k2"] || Object.values(predictionModels)[0];
    if (!model) return;

    // 更新模型標籤與評估指標
    if (modelBadge) {
      modelBadge.textContent = model.badge;
      modelBadge.className = `kpi-badge ${model.isOptimal ? 'badge-emerald' : 'badge-indigo'}`;
    }

    if (modelMeta) {
      modelMeta.textContent = `RMSE: $${model.rmse.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ｜ R²: ${model.r2.toFixed(4)}`;
    }

    if (insightText) {
      insightText.textContent = model.insight;
    }

    if (formulaCountBadge) {
      formulaCountBadge.textContent = `${model.features.length} 項活躍特徵`;
    }

    // 檢查特徵是否被納入當前模型
    const hasAdmin = model.features.includes("Administration");
    const hasState = model.features.some(f => f.startsWith("State_"));

    if (groupAdmin && statusAdmin) {
      if (hasAdmin) {
        groupAdmin.classList.remove("disabled");
        statusAdmin.textContent = "已納入預測模型 (Active)";
        statusAdmin.className = "input-status-badge badge-emerald";
      } else {
        groupAdmin.classList.add("disabled");
        statusAdmin.textContent = "非當前模型特徵 (Inactive)";
        statusAdmin.className = "input-status-badge badge-muted";
      }
    }

    if (groupState && statusState) {
      if (hasState) {
        groupState.classList.remove("disabled");
        statusState.textContent = "已納入預測模型 (Active)";
        statusState.className = "input-status-badge badge-emerald";
      } else {
        groupState.classList.add("disabled");
        statusState.textContent = "非當前模型特徵 (Inactive)";
        statusState.className = "input-status-badge badge-muted";
      }
    }
  }

  // 4. 即時預測計算引擎
  function calculatePrediction() {
    const model = predictionModels[activeModelKey] || predictionModels["k2"] || Object.values(predictionModels)[0];
    if (!model) return;

    const rd = sliderRd ? (parseFloat(sliderRd.value) || 0) : 0;
    const mkt = sliderMkt ? (parseFloat(sliderMkt.value) || 0) : 0;
    const admin = sliderAdmin ? (parseFloat(sliderAdmin.value) || 0) : 0;
    const state = selectState ? selectState.value : "California";

    let predictedProfit = model.intercept;
    const breakdownItems = [
      {
        name: "模型基準截距項 (β₀)",
        desc: "未投入任何支出時的基準估計常數",
        value: model.intercept
      }
    ];

    // R&D Spend
    if (model.coefficients["R&D Spend"] !== undefined) {
      const coef = model.coefficients["R&D Spend"];
      const contrib = coef * rd;
      predictedProfit += contrib;
      breakdownItems.push({
        name: "研發支出 (R&D Spend)",
        desc: `β = ${coef.toFixed(4)} × $${Math.round(rd).toLocaleString()}`,
        value: contrib
      });
    }

    // Marketing Spend
    if (model.coefficients["Marketing Spend"] !== undefined) {
      const coef = model.coefficients["Marketing Spend"];
      const contrib = coef * mkt;
      predictedProfit += contrib;
      breakdownItems.push({
        name: "行銷支出 (Marketing Spend)",
        desc: `β = ${coef.toFixed(4)} × $${Math.round(mkt).toLocaleString()}`,
        value: contrib
      });
    }

    // Administration
    if (model.coefficients["Administration"] !== undefined) {
      const coef = model.coefficients["Administration"];
      const contrib = coef * admin;
      predictedProfit += contrib;
      breakdownItems.push({
        name: "行政支出 (Administration)",
        desc: `β = ${coef.toFixed(4)} × $${Math.round(admin).toLocaleString()}`,
        value: contrib
      });
    }

    // State_New York
    if (model.coefficients["State_New York"] !== undefined) {
      const coef = model.coefficients["State_New York"];
      const dummyNY = (state === "New York") ? 1 : 0;
      const contrib = coef * dummyNY;
      predictedProfit += contrib;
      breakdownItems.push({
        name: "紐約州虛擬變數 (State_New York)",
        desc: `β = ${coef.toFixed(2)} × ${dummyNY} (Dummy)`,
        value: contrib
      });
    }

    // State_Florida
    if (model.coefficients["State_Florida"] !== undefined) {
      const coef = model.coefficients["State_Florida"];
      const dummyFL = (state === "Florida") ? 1 : 0;
      const contrib = coef * dummyFL;
      predictedProfit += contrib;
      breakdownItems.push({
        name: "佛州虛擬變數 (State_Florida)",
        desc: `β = ${coef.toFixed(2)} × ${dummyFL} (Dummy)`,
        value: contrib
      });
    }

    // 渲染預測金額 (強韌展示)
    if (profitValueEl) {
      profitValueEl.textContent = predictedProfit.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      profitValueEl.style.display = "inline-block";
    }

    // 基準均值百分比比較
    if (historicalBenchmark && benchmarkPill && benchmarkIcon && benchmarkPct) {
      const mean = historicalBenchmark.meanProfit || 112012.64;
      const diff = predictedProfit - mean;
      const diffPct = (diff / mean) * 100;

      if (diff >= 0) {
        benchmarkPill.className = "benchmark-pill positive";
        benchmarkIcon.textContent = "▲";
        benchmarkPct.textContent = `+${diffPct.toFixed(1)}%`;
      } else {
        benchmarkPill.className = "benchmark-pill negative";
        benchmarkIcon.textContent = "▼";
        benchmarkPct.textContent = `${diffPct.toFixed(1)}%`;
      }
    }

    // 渲染當前數學公式
    if (formulaBox) {
      formulaBox.textContent = model.formula;
    }

    // 渲染各項邊際增量拆解清單
    if (breakdownList) {
      breakdownList.innerHTML = breakdownItems.map(item => `
        <div class="breakdown-item">
          <div>
            <div class="breakdown-feat-name">${item.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${item.desc}</div>
          </div>
          <div class="breakdown-contrib-val ${item.value >= 0 ? 'positive' : 'negative'}">
            ${item.value >= 0 ? '+' : '-'}$${Math.abs(item.value).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      `).join('');
    }
  }

  // 初始化狀態
  updateModelUIState();
  calculatePrediction();
}
