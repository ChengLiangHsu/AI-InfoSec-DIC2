/**
 * 50-Startups Analysis Dashboard - Interactive Controller
 * Powered by Pure Vanilla JavaScript & Chart.js v4
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.DASHBOARD_DATA;
  if (!data) {
    console.error("Dashboard data not found! Please check docs/data.js.");
    return;
  }

  // 1. 初始化 Chart.js 全域深色主題
  setupChartGlobalDefaults();

  // 2. 渲染頂部 KPI 摘要卡
  renderKPICards(data.kpi);

  // 3. 渲染演算法比較模組 (圖表 + 卡片)
  initAlgorithmsModule(data.algorithms);

  // 4. 渲染特徵選擇方式模組 (卡片 + 相關係數圖)
  initFeatureSelectionModule(data.featureSelectionMethods, data.correlations);

  // 5. 渲染特徵數量漸進消長雙軸折線圖
  initFeatureCountChart(data.featureCountSensitivity);

  // 6. 渲染與初始化互動數據表格 (支援排序)
  initInteractiveTable(data.featureCountSensitivity);
});

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
