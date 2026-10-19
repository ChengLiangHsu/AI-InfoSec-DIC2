# 50-Startups 獲利預測與特徵工程深度實證研究

> **Empirical Machine Learning Benchmark // Regression, Regularization & Sequential Feature Selection**

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Dashboard-06b6d4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chenglianghsu.github.io/AI-InfoSec-DIC2/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deployed-10b981?style=for-the-badge&logo=githubpages&logoColor=white)](https://chenglianghsu.github.io/AI-InfoSec-DIC2/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-v1.9+-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

### 🚀 [點擊立即探索線上互動視覺化儀表板 (Live Demo)](https://chenglianghsu.github.io/AI-InfoSec-DIC2/)
*支援全螢幕深色毛玻璃 (Glassmorphism) 美學、動態 Tooltip、演算法長條對比圖、雙軸敏感度曲線與即時排序數據表*

---

</div>

## 🖥️ 儀表板視覺預覽 (Interactive Dashboard Preview)

[![50-Startups Analytics Dashboard Preview](./docs/images/dashboard-preview.png)](https://chenglianghsu.github.io/AI-InfoSec-DIC2/)

> [!TIP]
> **點擊上方預覽圖即可直達線上即時展示**。本儀表板為零後端依賴之純靜態單頁應用 (SPA)，完美託管於 GitHub Pages，支援桌機與行動裝置自適應瀏覽。

---

## 📊 核心研究洞察與實證發現 (Key Empirical Findings)

本專案針對 50 家新創公司歷史營運數據（包含研發支出、行政管理費、行銷費用與營運據點州別），探討多元線性迴歸模型在獲利預測上的泛化極限與特徵選擇效益：

1. **特徵降維顯著提升泛化力 (60% 特徵縮減)**：
   - 透過循序前向選擇 (SFS) 篩選出的 **2 個核心特徵 (`R&D Spend` + `Marketing Spend`)**，在測試集上達到最佳預測表現：$R^2 = 0.9474$、$\text{RMSE} = \$8,198.80$。
   - 相較於包含全部 5 個特徵的原始基準模型（$R^2 = 0.9347$、$\text{RMSE} = \$9,137.99$），預測誤差顯著下降 **$10.28\%$**，解釋力提升 **$+1.27\%$**。
2. **研發支出為絕對決定性因子 (Deterministic Factor)**：
   - 皮爾森相關分析顯示，`R&D Spend` 與獲利呈現極高度正相關（$r = 0.9729$），是左右創業公司獲利水準的最主要動能。
   - `Marketing Spend` 具中高度相關（$r = 0.7478$），能提供額外顯著解釋資訊。
   - `Administration` 行政開銷與獲利相關度極低（$r = 0.2007$），強行納入反而會增加多重共線性風險與預測雜訊。

### 迴歸演算法基準對比 (全特徵基準)

| 迴歸演算法 | 懲罰/正則化機制 | 測試集 $R^2$ | 測試集 RMSE | 實證特性評估 |
| :--- | :--- | :---: | :---: | :--- |
| **多元線性迴歸 (OLS)** | 無 (普通最小平方法) | `0.9347` | `$9,138` | 計算速度最快，但在存在共線性雜音特徵時易有微幅過度配適。 |
| **Ridge 回歸 (L2)** | L2 範數懲罰 ($\alpha=1.0$) | **`0.9352`** | **`$9,106`** | 透過 L2 平滑收縮權重係數，有效抑制多重共線性，表現優於 OLS 基準。 |
| **Lasso 回歸 (L1)** | L1 範數懲罰 ($\alpha=100.0$) | `0.9369` | `$8,980` | 具備特徵稀疏化能力，能自動將次要權重收縮至零。 |
| **ElasticNet 回歸** | L1 + L2 混合正則化 ($\alpha=100.0, \text{ratio}=0.5$) | `0.9394` | `$8,805` | 同時兼顧係數平滑與特徵篩選，在全特徵正則化下表現最佳。 |

### 循序前向選擇 (SFS) 特徵數敏感度消長

| 特徵數量 | 納入特徵組合 | 測試集 $R^2$ | 測試集 RMSE | 效能評級 |
| :---: | :--- | :---: | :---: | :--- :|
| 1 | `[R&D Spend]` | `0.9465` | `$8,274.87` | 優異 (單一研發特徵即具極高預測力) |
| **2** | **`[R&D Spend, Marketing Spend]`** | **`0.9474`** | **`$8,198.80`** | **🏆 全域最優 (誤差減少 10.28%)** |
| 3 | `[R&D Spend, Marketing Spend, State_New York]` | `0.9460` | `$8,309.06` | 良好 (地域虛擬變數引入微幅雜訊) |
| 4 | `[R&D Spend, Marketing Spend, State_New York, State_Florida]` | `0.9447` | `$8,409.92` | 普通 (特徵數增加導致誤差上升) |
| 5 | `[全特徵基準 (含 Administration)]` | `0.9347` | `$9,137.99` | 基準 (維度災難與行政雜訊影響泛化) |

---

## 📁 專案架構導覽 (Repository Structure)

```text
AI-InfoSec-DIC2/
├── docs/                                 # 現代前端展示儀表板 (GitHub Pages 發布來源)
│   ├── index.html                        # SPA 語意化 HTML5 版面骨架
│   ├── style.css                         # Glassmorphism 深色科技調色盤與 RWD 規則
│   ├── app.js                            # Chart.js 圖表控制、動態 Tooltip 與表格排序邏輯
│   ├── data.js                           # 50-Startups 結構化真實評估數據常數集
│   └── images/                           # 靜態視覺資產與儀表板預覽截圖
│       ├── dashboard-preview.png         # 儀表板全域高解析度展示圖
│       ├── 特徵選擇.png                  # 特徵篩選關聯矩陣圖
│       └── 特徵數比較.png                # 特徵數敏感度折線對照圖
├── src/ai_infosec_dic2/                  # 資料科學與模型實驗原始碼
│   ├── 50-startup-linearregression/      # 50-Startups 迴歸分析、特徵工程與驗證實驗
│   │   ├── 50-startups-linearregression.ipynb # 核心 Jupyter 實驗筆記本
│   │   └── 50_Startups.csv               # 原始訓練與測試資料集
│   └── boston-housing-linearregression/  # 基準迴歸分析筆記本與資料集
├── issues/                               # 嚴謹工程軌跡 (REQUIREMENT / PLAN / TASKS / WALKTHROUGH)
│   ├── 01-consolidate-notebook-imports/  # PEP 8 匯入優化
│   ├── 02-50startups-refactor/           # 模組化重構
│   ├── 03-feature-selection/             # SFS 特徵篩選與消長實證
│   ├── 04-analysis-dashboard/            # 互動儀表板建置
│   └── 05-readme-dashboard-showcase/     # 本次 README 展示整合
├── pyproject.toml                        # 現代 Python 依賴宣告與專案配置
└── README.md                             # 專案首頁說明文件
```

---

## 🛠️ 本地快速啟動與預覽指南 (Local Quickstart)

### 方式一：啟動本機 HTTP 伺服器 (推薦)
透過 Python 內建的輕量 HTTP 模組啟動伺服器，模擬真實線上託管環境：

```bash
# 於專案根目錄下啟動靜態伺服器 (指定 docs 目錄)
python -m http.server 8000 --directory docs
```
啟動完成後，於瀏覽器造訪 [http://localhost:8000](http://localhost:8000) 即可即時體驗。

### 方式二：離線雙擊開啟 (零安裝門檻)
本儀表板採用去中心化常數封裝 (`docs/data.js`)，完全不受瀏覽器跨來源資源共享 (CORS) 限制：
- 直接在檔案總管中雙擊開啟 `docs/index.html` 即可完整渲染所有圖表與數據。

### 方式三：Jupyter 筆記本復現實驗
如需重現機器學習特徵篩選與迴歸模型訓練流程：

```bash
# 安裝專案依賴
pip install -r pyproject.toml
# 或使用 uv / poetry / pip 直接安裝 scikit-learn, pandas, statsmodels 等

# 啟動 Jupyter 筆記本
jupyter lab src/ai_infosec_dic2/50-startup-linearregression/50-startups-linearregression.ipynb
```

---

## 🌐 GitHub Pages 部署啟用指引 (Deployment Guide)

本專案的前端儀表板原始碼已完整組織於 `docs/` 資料夾，完全相容 GitHub 原生 Pages 機制：

1. 登入 GitHub 並進入本專案儲存庫頁面。
2. 點選儲存庫上方分頁的 **Settings (設定)**。
3. 於左側選單點選 **Pages**。
4. 在 **Build and deployment (建置與部署)** 下：
   - **Source (來源)**：選擇 `Deploy from a branch`。
   - **Branch (分支)**：選擇 `master` (或 `main`)，目錄下拉選單切換為 `/docs`。
5. 點擊 **Save (儲存)**，靜待 GitHub Actions 自動部署完成。
6. 完成後即可透過 [https://chenglianghsu.github.io/AI-InfoSec-DIC2/](https://chenglianghsu.github.io/AI-InfoSec-DIC2/) 公開存取。

---

## 📄 授權條款 (License)

本專案採 [MIT License](./LICENSE) 開源授權，歡迎自由研究、衍生與學術交流。


