/**
 * Boston Housing Linear Regression Dashboard - Interactive Controller
 * Pure Vanilla JavaScript & Chart.js v4
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.BOSTON_DATA;
  if (!data) {
    console.error("Boston data not found! Please check docs/boston-data.js.");
    return;
  }

  // 1. Chart.js 深色模式設定
  setupChartGlobalDefaults();

  // 2. 渲染頂部 KPI 摘要卡
  renderKPICards(data.kpi);

  // 3. 模型架構切換模組
  initArchitectureModule(data.architectures);

  // 4. 特徵數複雜度走勢與折衷分析模組 (k=1~13)
  initComplexityModule(data.complexitySeries, data.kModels, data.architectures);

  // 5. 即時波士頓房價預測試算器
  initPredictorModule(data.architectures, data.featureRanges, data.presets, data.kpi);

  // 6. 殘差診斷與無標籤批次推論表格模組
  initDiagnosticsModule(data.testSetResiduals, data.unlabeledPredictions);
});

/* ==========================================================================
   1. Chart.js Global Dark Defaults
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
}

/* ==========================================================================
   2. KPI Summary Cards
   ========================================================================== */
function renderKPICards(kpi) {
  const container = document.getElementById("kpi-container");
  if (!container) return;

  container.innerHTML = `
    <!-- Card 1: 最佳全特徵解釋力 R² -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">最佳模型測試集 R² (解釋力)</span>
        <div class="kpi-icon indigo">📈</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-indigo);">${kpi.fullModelR2.toFixed(4)}</div>
      <div class="kpi-meta">
        <span>全 13 特徵基準</span>
        <span class="kpi-badge badge-indigo">72.61% 變異解釋</span>
      </div>
    </div>

    <!-- Card 2: 最佳測試集 RMSE -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">測試集泛化 RMSE 誤差</span>
        <div class="kpi-icon emerald">⚡</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-emerald);">$${kpi.fullModelRMSE.toFixed(2)} <span style="font-size: 1rem; font-weight: 500;">k</span></div>
      <div class="kpi-meta">
        <span>換算實際美元: $${kpi.fullModelRMSE_USD.toLocaleString()}</span>
        <span class="kpi-badge badge-emerald">泛化最優</span>
      </div>
    </div>

    <!-- Card 3: 領域關鍵 5 特徵模型 -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">領域關鍵 5 特徵折衷表現</span>
        <div class="kpi-icon cyan">🎯</div>
      </div>
      <div class="kpi-value" style="color: var(--accent-cyan);">${kpi.key5ModelR2.toFixed(4)}</div>
      <div class="kpi-meta">
        <span>RMSE: $${kpi.key5ModelRMSE.toFixed(2)}k ($${kpi.key5ModelRMSE_USD.toLocaleString()})</span>
        <span class="kpi-badge badge-cyan">保留 93% 解釋力</span>
      </div>
    </div>

    <!-- Card 4: 最關鍵正負驅動因子 -->
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">主要推升與拉低特徵</span>
        <div class="kpi-icon amber">⚖️</div>
      </div>
      <div class="kpi-value" style="font-size: 1.35rem; color: #fbbf24;">rm (+) / lstat (-)</div>
      <div class="kpi-meta">
        <span>房間數 +0.70 / 低收入 -0.74</span>
        <span class="kpi-badge badge-amber">主導因子</span>
      </div>
    </div>
  `;
}

/* ==========================================================================
   3. Architecture Module (4 Models)
   ========================================================================== */
let currentActiveModelKey = "full";

function initArchitectureModule(architectures) {
  const btnContainer = document.getElementById("architecture-buttons");
  if (!btnContainer) return;

  btnContainer.innerHTML = "";
  Object.keys(architectures).forEach((key) => {
    const arch = architectures[key];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `model-btn ${key === currentActiveModelKey ? "active" : ""}`;
    btn.dataset.modelKey = key;
    btn.innerHTML = `
      <div class="model-btn-name">${arch.shortName}</div>
      <div class="model-btn-meta">
        <span>${arch.featureCount} 項特徵</span>
        <span class="model-badge">${arch.badge}</span>
      </div>
    `;

    btn.addEventListener("click", () => {
      currentActiveModelKey = key;
      document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateActiveArchitectureUI(architectures[key]);
      
      // 同步觸發預測器連動更新
      if (window.syncPredictorWithModel) {
        window.syncPredictorWithModel(architectures[key]);
      }
    });

    btnContainer.appendChild(btn);
  });

  // 初始化預設模型顯示
  updateActiveArchitectureUI(architectures[currentActiveModelKey]);
}

function updateActiveArchitectureUI(arch) {
  const metricsContainer = document.getElementById("active-model-metrics");
  const eqText = document.getElementById("active-equation-text");
  if (!metricsContainer || !eqText) return;

  const m = arch.metrics;
  metricsContainer.innerHTML = `
    <div class="glass-card metric-card">
      <div class="metric-label">TEST RMSE (誤差)</div>
      <div class="metric-value highlight-cyan">$${m.testRMSE.toFixed(2)}k</div>
      <div class="metric-sub">折合 $${m.testRMSE_USD.toLocaleString()} USD</div>
    </div>

    <div class="glass-card metric-card">
      <div class="metric-label">R² SCORE (解釋力)</div>
      <div class="metric-value highlight-indigo">${m.testR2.toFixed(4)}</div>
      <div class="metric-sub">解釋 ${(m.testR2 * 100).toFixed(1)}% 房價變異</div>
    </div>

    <div class="glass-card metric-card">
      <div class="metric-label">ADJUSTED R²</div>
      <div class="metric-value highlight-emerald">${m.adjustedR2.toFixed(4)}</div>
      <div class="metric-sub">懲罰額外自由度負擔</div>
    </div>

    <div class="glass-card metric-card">
      <div class="metric-label">TEST MAE (平均絕對誤差)</div>
      <div class="metric-value highlight-amber">$${m.testMAE.toFixed(2)}k</div>
      <div class="metric-sub">折合 $${m.testMAE_USD.toLocaleString()} USD</div>
    </div>

    <div class="glass-card metric-card">
      <div class="metric-label">5-FOLD CV R² (平均)</div>
      <div class="metric-value highlight-rose">${m.cvR2Mean.toFixed(4)}</div>
      <div class="metric-sub">標準差 ±${m.cvR2Std.toFixed(4)}</div>
    </div>
  `;

  // 格式化方程式
  eqText.innerHTML = formatEquationHtml(arch.formula);
}

function formatEquationHtml(formulaStr) {
  return formulaStr
    .replace(/(medv =)/g, '<strong style="color: var(--accent-cyan); font-size: 1.15rem;">medv</strong> =')
    .replace(/([+-] \d+\.\d+) × \(([^)]+)\)/g, '<span style="color: var(--accent-indigo); font-weight: 600;">$1</span> × <span style="color: var(--accent-emerald);">($2)</span>');
}

/* ==========================================================================
   4. Complexity & Parsimony Analysis Module (k=1~13)
   ========================================================================== */
let rmseChartInstance = null;
let r2ChartInstance = null;

function initComplexityModule(complexitySeries, kModels, architectures) {
  const kContainer = document.getElementById("k-buttons-container");
  if (!kContainer) return;

  kContainer.innerHTML = "";
  complexitySeries.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `k-btn ${item.k === 13 ? "active" : ""}`;
    btn.dataset.k = item.k;

    const sweetBadge = item.isSweetSpot ? `<span class="sweet-spot-badge">⚡ Sweet Spot</span>` : "";
    btn.innerHTML = `
      <span>k = ${item.k} (+${item.addedFeature})</span>
      ${sweetBadge}
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".k-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      highlightChartPoints(item.k);
    });

    kContainer.appendChild(btn);
  });

  renderComplexityCharts(complexitySeries);
}

function renderComplexityCharts(series) {
  const labels = series.map(s => `k=${s.k} (${s.addedFeature})`);
  const trainRmseData = series.map(s => s.trainRMSE);
  const testRmseData = series.map(s => s.testRMSE);
  const trainR2Data = series.map(s => s.trainR2);
  const testR2Data = series.map(s => s.testR2);

  // 1. RMSE Chart
  const ctxRmse = document.getElementById("chart-complexity-rmse")?.getContext("2d");
  if (ctxRmse) {
    if (rmseChartInstance) rmseChartInstance.destroy();
    rmseChartInstance = new Chart(ctxRmse, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "測試集 RMSE (千美元)",
            data: testRmseData,
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            borderWidth: 2.5,
            pointBackgroundColor: series.map(s => s.isSweetSpot ? "#f59e0b" : "#06b6d4"),
            pointRadius: series.map(s => s.isSweetSpot ? 6 : 4),
            tension: 0.25,
            fill: false
          },
          {
            label: "訓練集 RMSE (千美元)",
            data: trainRmseData,
            borderColor: "#64748b",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 3,
            tension: 0.25,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: "RMSE (千美元)" },
            grid: { color: "rgba(255, 255, 255, 0.05)" }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
          }
        }
      }
    });
  }

  // 2. R² Chart
  const ctxR2 = document.getElementById("chart-complexity-r2")?.getContext("2d");
  if (ctxR2) {
    if (r2ChartInstance) r2ChartInstance.destroy();
    r2ChartInstance = new Chart(ctxR2, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "測試集 R²",
            data: testR2Data,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2.5,
            pointBackgroundColor: series.map(s => s.isSweetSpot ? "#f59e0b" : "#10b981"),
            pointRadius: series.map(s => s.isSweetSpot ? 6 : 4),
            tension: 0.25,
            fill: false
          },
          {
            label: "訓練集 R²",
            data: trainR2Data,
            borderColor: "#64748b",
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 3,
            tension: 0.25,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: { display: true, text: "R² 判定係數" },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            min: 0.4,
            max: 0.8
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
          }
        }
      }
    });
  }
}

function highlightChartPoints(k) {
  // 供點擊 k 按鈕時強調走勢圖上特定資料點
  if (rmseChartInstance) {
    rmseChartInstance.setActiveElements([{ datasetIndex: 0, index: k - 1 }]);
    rmseChartInstance.update();
  }
  if (r2ChartInstance) {
    r2ChartInstance.setActiveElements([{ datasetIndex: 0, index: k - 1 }]);
    r2ChartInstance.update();
  }
}

/* ==========================================================================
   5. Live Predictor Module
   ========================================================================== */
const CORE_FEATURE_KEYS = ["rm", "lstat", "ptratio", "tax", "crim"];
const ADVANCED_FEATURE_KEYS = ["zn", "indus", "chas", "nox", "age", "dis", "rad", "black"];

function initPredictorModule(architectures, featureRanges, presets, kpi) {
  const coreContainer = document.getElementById("core-inputs-stack");
  const advContainer = document.getElementById("advanced-inputs-container");
  const presetContainer = document.getElementById("preset-buttons-container");
  const toggleBtn = document.getElementById("toggle-advanced-features");

  if (!coreContainer || !advContainer || !presetContainer) return;

  // 1. 建立 4 組情境按鈕
  presetContainer.innerHTML = "";
  presets.forEach((preset, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `preset-btn ${index === 0 ? "active" : ""}`;
    btn.innerHTML = `
      <span>${preset.name}</span>
      <span class="feature-badge-tag">${preset.tag}</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyPresetValues(preset.values, featureRanges);
      recalculatePrediction(architectures, featureRanges, kpi);
    });

    presetContainer.appendChild(btn);
  });

  // 2. 建立 5 大核心輸入卡
  coreContainer.innerHTML = "";
  CORE_FEATURE_KEYS.forEach(col => {
    const fMeta = featureRanges[col];
    coreContainer.appendChild(createFeatureInputCard(col, fMeta));
  });

  // 3. 建立 8 大進階輸入卡
  advContainer.innerHTML = "";
  ADVANCED_FEATURE_KEYS.forEach(col => {
    const fMeta = featureRanges[col];
    advContainer.appendChild(createFeatureInputCard(col, fMeta));
  });

  // 4. 手風琴開關
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isExpanded = advContainer.classList.toggle("show");
      toggleBtn.classList.toggle("expanded", isExpanded);
      toggleBtn.querySelector("span:first-child").textContent = isExpanded
        ? "收合進階特徵（保留 5 大核心特徵）"
        : "展開其餘 8 項進階特徵（土地規劃、屋齡、距離、交通、空氣品質等）";
    });
  }

  // 5. 初始填入第一組預設情境
  if (presets.length > 0) {
    applyPresetValues(presets[0].values, featureRanges);
  }

  // 6. 註冊與架構切換連動函式
  window.syncPredictorWithModel = function (arch) {
    const activeFeats = new Set(arch.features);
    document.getElementById("predictor-active-model-name").textContent = arch.name;
    document.getElementById("predictor-active-feature-count").textContent = `${arch.featureCount} 項特徵`;

    // 更新特徵卡反灰狀態
    document.querySelectorAll(".input-card").forEach(card => {
      const col = card.dataset.col;
      const pill = card.querySelector(".model-inclusion-pill");
      if (activeFeats.has(col)) {
        card.classList.remove("disabled");
        if (pill) {
          pill.className = "model-inclusion-pill included";
          pill.textContent = "已納入";
        }
      } else {
        card.classList.add("disabled");
        if (pill) {
          pill.className = "model-inclusion-pill excluded";
          pill.textContent = "未納入";
        }
      }
    });

    recalculatePrediction(architectures, featureRanges, kpi);
  };

  // 初始觸發一次連動與計算
  window.syncPredictorWithModel(architectures[currentActiveModelKey]);
}

function createFeatureInputCard(col, fMeta) {
  const card = document.createElement("div");
  card.className = "input-card";
  card.dataset.col = col;

  const isChas = fMeta.isBinary;
  const initialVal = fMeta.mean;

  card.innerHTML = `
    <div class="input-card-header">
      <div class="feature-info">
        <span class="feature-name">${fMeta.name} (<code>${col}</code>)</span>
        <span class="feature-badge-tag">${fMeta.category}</span>
        <span class="model-inclusion-pill included">已納入</span>
      </div>
      <div class="feature-val-display" id="val-display-${col}">${initialVal} ${fMeta.unit}</div>
    </div>
    <div class="feature-desc" style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.5rem;">
      ${fMeta.desc}
    </div>
    <div class="input-controls-row">
      <div class="slider-wrap">
        <input 
          type="range" 
          class="custom-slider" 
          id="slider-${col}" 
          min="${fMeta.min}" 
          max="${fMeta.max}" 
          step="${fMeta.step}" 
          value="${initialVal}">
      </div>
      <div class="number-input-wrap">
        <input 
          type="number" 
          class="custom-number-input" 
          id="num-${col}" 
          min="${fMeta.min}" 
          max="${fMeta.max}" 
          step="${fMeta.step}" 
          value="${initialVal}">
      </div>
    </div>
  `;

  // 雙向綁定與防呆 Clamp
  const slider = card.querySelector(`#slider-${col}`);
  const numInput = card.querySelector(`#num-${col}`);
  const valDisplay = card.querySelector(`#val-display-${col}`);

  function syncValues(newVal, triggerSource) {
    let val = parseFloat(newVal);
    if (isNaN(val)) val = fMeta.mean;

    // Clamp 防呆
    if (val < fMeta.min) val = fMeta.min;
    if (val > fMeta.max) val = fMeta.max;

    if (triggerSource !== "slider") slider.value = val;
    if (triggerSource !== "num") numInput.value = val;
    valDisplay.textContent = `${val} ${fMeta.unit}`;

    // 觸發重新預測計算
    if (window.triggerPredictionRecalc) {
      window.triggerPredictionRecalc();
    }
  }

  slider.addEventListener("input", (e) => syncValues(e.target.value, "slider"));
  numInput.addEventListener("input", (e) => syncValues(e.target.value, "num"));
  numInput.addEventListener("blur", (e) => syncValues(e.target.value, "num"));

  return card;
}

function applyPresetValues(presetValues, featureRanges) {
  Object.keys(presetValues).forEach(col => {
    const val = presetValues[col];
    const slider = document.getElementById(`slider-${col}`);
    const num = document.getElementById(`num-${col}`);
    const display = document.getElementById(`val-display-${col}`);
    const fMeta = featureRanges[col];

    if (slider) slider.value = val;
    if (num) num.value = val;
    if (display && fMeta) display.textContent = `${val} ${fMeta.unit}`;
  });
}

function recalculatePrediction(architectures, featureRanges, kpi) {
  const activeArch = architectures[currentActiveModelKey];
  if (!activeArch) return;

  const currentValues = {};
  Object.keys(featureRanges).forEach(col => {
    const num = document.getElementById(`num-${col}`);
    currentValues[col] = num ? parseFloat(num.value) : featureRanges[col].mean;
  });

  // 計算 OLS 未標準化推論
  let predMedv = activeArch.intercept;
  const contributions = [];

  activeArch.features.forEach(col => {
    const coef = activeArch.coefficients[col] || 0;
    const val = currentValues[col];
    const mean = featureRanges[col].mean;
    const marginalEffect = coef * (val - mean);

    predMedv += coef * val;

    contributions.push({
      col: col,
      name: featureRanges[col].name,
      coef: coef,
      val: val,
      mean: mean,
      marginalEffect: marginalEffect
    });
  });

  // 防禦性 Clamp：房價中位數最低限制為 $5.0k ($5,000 USD)
  const clampedMedv = Math.max(5.0, predMedv);
  const clampedUSD = clampedMedv * 1000;

  // 更新預測大字
  const medvEl = document.getElementById("pred-medv-value");
  const usdEl = document.getElementById("pred-usd-value");
  const diffBadge = document.getElementById("pred-diff-badge");
  const diffText = document.getElementById("pred-diff-text");

  if (medvEl) medvEl.textContent = `$${clampedMedv.toFixed(2)} k`;
  if (usdEl) usdEl.textContent = `($${Math.round(clampedUSD).toLocaleString()} USD)`;

  // 與歷史平均（kpi.meanMedv）比較
  const baselineDiff = clampedMedv - kpi.meanMedv;
  const baselineDiffPct = (baselineDiff / kpi.meanMedv) * 100;
  if (diffBadge && diffText) {
    if (baselineDiff >= 0) {
      diffBadge.className = "result-diff-badge";
      diffBadge.style.color = "var(--accent-emerald)";
      diffBadge.style.background = "rgba(16, 185, 129, 0.12)";
      diffBadge.style.border = "1px solid rgba(16, 185, 129, 0.3)";
      diffText.textContent = `高於歷史母體均值 +$${baselineDiff.toFixed(2)}k (+${baselineDiffPct.toFixed(1)}%)`;
    } else {
      diffBadge.className = "result-diff-badge";
      diffBadge.style.color = "#f87171";
      diffBadge.style.background = "rgba(239, 68, 68, 0.1)";
      diffBadge.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      diffText.textContent = `低於歷史母體均值 -$${Math.abs(baselineDiff).toFixed(2)}k (${baselineDiffPct.toFixed(1)}%)`;
    }
  }

  // 渲染特徵邊際貢獻度拆解條
  renderContributionBars(contributions);
}

// 註冊全域重新計算捷徑
window.triggerPredictionRecalc = function () {
  const data = window.BOSTON_DATA;
  if (data) {
    recalculatePrediction(data.architectures, data.featureRanges, data.kpi);
  }
};

function renderContributionBars(contributions) {
  const container = document.getElementById("contribution-bars-container");
  if (!container) return;

  // 依邊際效應絕對值由大到小排序
  const sorted = [...contributions].sort((a, b) => Math.abs(b.marginalEffect) - Math.abs(a.marginalEffect));
  const maxAbsEffect = Math.max(...sorted.map(s => Math.abs(s.marginalEffect)), 1.0);

  container.innerHTML = "";
  sorted.slice(0, 6).forEach(item => {
    const isPositive = item.marginalEffect >= 0;
    const barWidthPct = Math.min(100, Math.round((Math.abs(item.marginalEffect) / maxAbsEffect) * 100));
    const signStr = isPositive ? "+" : "-";
    const color = isPositive ? "var(--accent-emerald)" : "#f87171";

    const row = document.createElement("div");
    row.className = "contribution-row";
    row.style.marginBottom = "0.6rem";
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.2rem;">
        <span style="color: var(--text-main); font-weight: 500;">${item.name} (<code>${item.col}</code>)</span>
        <span style="color: ${color}; font-weight: 600;">${signStr}$${Math.abs(item.marginalEffect).toFixed(2)}k</span>
      </div>
      <div style="height: 6px; background: rgba(255, 255, 255, 0.06); border-radius: 9999px; overflow: hidden;">
        <div style="width: ${barWidthPct}%; height: 100%; background: ${color}; border-radius: 9999px; transition: width 0.3s ease;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

/* ==========================================================================
   6. Diagnostics & Inference Module
   ========================================================================== */
let activeSortField = "rank";
let activeSortAsc = true;

function initDiagnosticsModule(residuals, unlabeled) {
  const tabResiduals = document.getElementById("tab-btn-residuals");
  const tabUnlabeled = document.getElementById("tab-btn-unlabeled");
  const wrapResiduals = document.getElementById("table-residuals-wrapper");
  const wrapUnlabeled = document.getElementById("table-unlabeled-wrapper");
  const titleEl = document.getElementById("diagnostics-table-title");
  const subtitleEl = document.getElementById("diagnostics-table-subtitle");

  if (!tabResiduals || !tabUnlabeled || !wrapResiduals || !wrapUnlabeled) return;

  // 分頁切換
  tabResiduals.addEventListener("click", () => {
    tabResiduals.classList.add("active");
    tabUnlabeled.classList.remove("active");
    wrapResiduals.style.display = "block";
    wrapUnlabeled.style.display = "none";
    if (titleEl) titleEl.textContent = "67 筆獨立測試集殘差與離群值診斷";
    if (subtitleEl) subtitleEl.textContent = "點擊表頭可依照殘差、真實房價或百分比誤差重新排序";
  });

  tabUnlabeled.addEventListener("click", () => {
    tabUnlabeled.classList.add("active");
    tabResiduals.classList.remove("active");
    wrapResiduals.style.display = "none";
    wrapUnlabeled.style.display = "block";
    if (titleEl) titleEl.textContent = "173 筆真實無標籤測試集 (boston_test.csv) 批次預測預覽";
    if (subtitleEl) subtitleEl.textContent = "端到端無標籤推論展示：完全封裝 Pipeline 前處理與反標籤自動縮放";
  });

  // 渲染殘差表格
  renderResidualsTable(residuals);

  // 綁定表頭排序
  document.querySelectorAll("#table-residuals th[data-sort]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (activeSortField === field) {
        activeSortAsc = !activeSortAsc;
      } else {
        activeSortField = field;
        activeSortAsc = true;
      }
      sortAndRenderResiduals(residuals);
    });
  });

  // 渲染無標籤測試集表格
  renderUnlabeledTable(unlabeled);
}

function sortAndRenderResiduals(residuals) {
  const sorted = [...residuals].sort((a, b) => {
    const valA = a[activeSortField];
    const valB = b[activeSortField];
    if (valA < valB) return activeSortAsc ? -1 : 1;
    if (valA > valB) return activeSortAsc ? 1 : -1;
    return 0;
  });
  renderResidualsTable(sorted);
}

function renderResidualsTable(residuals) {
  const tbody = document.getElementById("residuals-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  residuals.forEach(item => {
    const tr = document.createElement("tr");
    const statusBadgeClass = item.statusType === "warning" ? "badge-amber" : "badge-emerald";
    const residualColor = item.residual >= 0 ? "var(--accent-emerald)" : "#f87171";
    const residualSign = item.residual >= 0 ? "+" : "";

    tr.innerHTML = `
      <td>#${item.rank}</td>
      <td><strong>Sample #${item.sampleId}</strong></td>
      <td>$${item.actualMedv.toFixed(2)}k <span style="font-size: 0.72rem; color: var(--text-muted);">($${item.actualUSD.toLocaleString()})</span></td>
      <td>$${item.predictedMedv.toFixed(2)}k</td>
      <td style="color: ${residualColor}; font-weight: 600;">${residualSign}$${item.residual.toFixed(2)}k</td>
      <td>$${item.absError.toFixed(2)}k</td>
      <td>${item.pctError.toFixed(1)}%</td>
      <td><span class="kpi-badge ${statusBadgeClass}">${item.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderUnlabeledTable(unlabeled) {
  const tbody = document.getElementById("unlabeled-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  // 顯示前 50 筆避免 DOM 過於沉重
  unlabeled.slice(0, 50).forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>Test #${item.id}</strong></td>
      <td>${item.crim.toFixed(3)}</td>
      <td>${item.rm.toFixed(2)} 間</td>
      <td>${item.tax.toFixed(0)}</td>
      <td>${item.ptratio.toFixed(1)}</td>
      <td>${item.lstat.toFixed(1)}%</td>
      <td style="color: var(--accent-cyan); font-weight: 700;">$${item.predMedv.toFixed(2)}k</td>
      <td style="color: var(--accent-emerald); font-weight: 600;">$${item.predUSD.toLocaleString()} USD</td>
    `;
    tbody.appendChild(tr);
  });
}
