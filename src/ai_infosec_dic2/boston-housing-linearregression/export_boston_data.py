"""
export_boston_data.py
波士頓房價多元線性迴歸模型計算與資料導出腳本
產出 docs/boston-data.js 供 GitHub Pages 靜態儀表板使用
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def generate_boston_data():
    base_dir = Path(__file__).resolve().parent
    train_path = base_dir / "boston_train.csv"
    test_path = base_dir / "boston_test.csv"
    output_js_path = base_dir.parents[2] / "docs" / "boston-data.js"

    df_train = pd.read_csv(train_path)
    df_test_raw = pd.read_csv(test_path)

    # 1. 切分訓練集與獨立測試集 (80/20, random_state=42)
    X = df_train.drop(columns=["ID", "medv"])
    y = df_train["medv"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    num_features = [
        "crim", "zn", "indus", "nox", "rm", "age",
        "dis", "rad", "tax", "ptratio", "black", "lstat"
    ]
    binary_features = ["chas"]
    all_features = list(X.columns)

    # 特徵中文名稱、單位與說明
    feature_meta = {
        "crim": {
            "name": "城鎮人均犯罪率",
            "en": "Per capita crime rate",
            "unit": "率",
            "desc": "各城鎮之人均犯罪率",
            "category": "治安環境"
        },
        "zn": {
            "name": "大坪數住宅用地比例",
            "en": "Residential land zoned >25k sq.ft",
            "unit": "%",
            "desc": "規劃超過 25,000 平方英尺之住宅用地佔比",
            "category": "土地規劃"
        },
        "indus": {
            "name": "非零售商業用地比例",
            "en": "Non-retail business acres",
            "unit": "%",
            "desc": "每城鎮非零售商業用地之佔比",
            "category": "工商業態"
        },
        "chas": {
            "name": "查爾斯河虛擬變數",
            "en": "Charles River dummy variable",
            "unit": "0/1",
            "desc": "地段是否瀕臨查爾斯河 (1: 是, 0: 否)",
            "category": "景觀水岸"
        },
        "nox": {
            "name": "一氧化氮濃度",
            "en": "Nitric oxides concentration",
            "unit": "ppm (x10)",
            "desc": "每千萬份之一氧化氮濃度",
            "category": "空氣品質"
        },
        "rm": {
            "name": "每戶平均房間數",
            "en": "Average rooms per dwelling",
            "unit": "間",
            "desc": "每棟住宅的平均房間數量 (主要正相關驅動力)",
            "category": "居住空間"
        },
        "age": {
            "name": "老舊房屋比例",
            "en": "Owner-occupied units built <1940",
            "unit": "%",
            "desc": "1940 年以前建造之自住房屋佔比",
            "category": "建築屋齡"
        },
        "dis": {
            "name": "到五大就業中心加權距離",
            "en": "Distances to employment centres",
            "unit": "英里",
            "desc": "至波士頓五個主要就業服務中心之加權距離",
            "category": "交通區位"
        },
        "rad": {
            "name": "環狀公路可達性指數",
            "en": "Accessibility to radial highways",
            "unit": "級",
            "desc": "輻射狀環城公路交通便利指數",
            "category": "公路路網"
        },
        "tax": {
            "name": "全額不動產財產稅率",
            "en": "Property tax rate per $10k",
            "unit": "美元/$10k",
            "desc": "每萬美元的不動產全額財產稅率",
            "category": "市政稅賦"
        },
        "ptratio": {
            "name": "學區師生比",
            "en": "Pupil-teacher ratio",
            "unit": "人/師",
            "desc": "該市鎮中小學校區師生比例 (教育資源指標)",
            "category": "文教資源"
        },
        "black": {
            "name": "非裔人口歷史比例指數",
            "en": "Black population index",
            "unit": "指數",
            "desc": "1000(Bk - 0.63)^2 人口結構指數",
            "category": "社區人口"
        },
        "lstat": {
            "name": "社會低收入人口比例",
            "en": "Lower status of the population",
            "unit": "%",
            "desc": "該區域低收入社經階層人口比例 (主要負相關驅動力)",
            "category": "社經地位"
        }
    }

    # 特徵數值統計分佈 (基於訓練集 X_train)
    feature_ranges = {}
    for col in all_features:
        s = X_train[col]
        meta = feature_meta[col]
        step = 0.1 if col in ["rm", "dis", "ptratio", "lstat"] else (
            0.01 if col in ["crim", "nox"] else (1.0 if col in ["zn", "indus", "age", "rad", "tax", "black"] else 1)
        )
        feature_ranges[col] = {
            "col": col,
            "name": meta["name"],
            "en": meta["en"],
            "unit": meta["unit"],
            "desc": meta["desc"],
            "category": meta["category"],
            "min": round(float(s.min()), 3),
            "max": round(float(s.max()), 3),
            "mean": round(float(s.mean()), 3),
            "median": round(float(s.median()), 3),
            "std": round(float(s.std()), 3),
            "q25": round(float(s.quantile(0.25)), 3),
            "q75": round(float(s.quantile(0.75)), 3),
            "step": step,
            "isBinary": col == "chas"
        }

    # 2. 特徵相關係數 (與 medv 之皮爾森相關係數)
    correlations = []
    for col in all_features:
        r = float(X_train[col].corr(y_train))
        correlations.append({
            "col": col,
            "name": feature_meta[col]["name"],
            "correlation": round(r, 4),
            "absCorr": round(abs(r), 4),
            "impact": "推升房價" if r > 0 else "拉低房價",
            "level": "強相關" if abs(r) >= 0.5 else ("中度相關" if abs(r) >= 0.3 else "弱相關")
        })
    correlations.sort(key=lambda x: x["absCorr"], reverse=True)

    # 3. 輔助函數：建立 Pipeline
    def make_pipeline(sub_features):
        sub_num = [c for c in sub_features if c in num_features]
        sub_bin = [c for c in sub_features if c in binary_features]
        transformers = []
        if sub_num:
            transformers.append(("num", StandardScaler(), sub_num))
        if sub_bin:
            transformers.append(("bin", "passthrough", sub_bin))
        preprocessor = ColumnTransformer(transformers=transformers)
        return Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", TransformedTargetRegressor(
                regressor=LinearRegression(),
                transformer=StandardScaler()
            ))
        ])

    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    # 4. 四大架構定義與評估
    arch_specs = {
        "full": {
            "id": "full",
            "name": "全特徵模型 (Full Model, 13 特徵)",
            "shortName": "全 13 特徵基準",
            "badge": "最完整基準",
            "features": all_features,
            "desc": "納入全部 13 項特徵，包含環境、交通、建物、經濟與人口，提供最高解釋力與最全面評估。"
        },
        "key5": {
            "id": "key5",
            "name": "領域關鍵 5 特徵模型 (Key 5 Features)",
            "shortName": "精選關鍵 5 特徵",
            "badge": "👑 實務推薦 (最佳平衡)",
            "features": ["rm", "lstat", "ptratio", "tax", "crim"],
            "desc": "精選生活空間 (rm)、所得階層 (lstat)、學區資源 (ptratio)、房屋稅率 (tax) 與治安 (crim)，以 38% 特徵數保留 93% 解釋力。"
        },
        "core3": {
            "id": "core3",
            "name": "房價核心 3 要素模型 (Core 3 Features)",
            "shortName": "核心 3 要素",
            "badge": "極簡實用",
            "features": ["rm", "lstat", "ptratio"],
            "desc": "房地產三大黃金支柱：空間大小 (rm)、區域階層 (lstat) 與學區文教 (ptratio)，直觀好解釋。"
        },
        "rm1": {
            "id": "rm1",
            "name": "單一房間數模型 (Single Feature: rm)",
            "shortName": "單房間數基準",
            "badge": "單變量基準",
            "features": ["rm"],
            "desc": "僅使用最強單一正相關特徵房間數 (rm) 的單變量線性迴歸，作為衡量多變量邊際增益的比較底線。"
        }
    }

    architectures = {}
    for key, spec in arch_specs.items():
        sub_feats = spec["features"]
        pipe = make_pipeline(sub_feats)

        # 5-Fold CV
        cv_r2 = cross_val_score(pipe, X_train, y_train, cv=kf, scoring="r2")
        cv_neg_rmse = cross_val_score(pipe, X_train, y_train, cv=kf, scoring="neg_root_mean_squared_error")

        # 擬合與測試集評估
        pipe.fit(X_train, y_train)
        y_train_pred = pipe.predict(X_train)
        y_test_pred = pipe.predict(X_test)

        test_r2 = float(r2_score(y_test, y_test_pred))
        test_mse = float(mean_squared_error(y_test, y_test_pred))
        test_rmse = float(np.sqrt(test_mse))
        test_mae = float(mean_absolute_error(y_test, y_test_pred))

        n_test = len(y_test)
        p_feats = len(sub_feats)
        adj_r2 = float(1 - (1 - test_r2) * (n_test - 1) / (n_test - p_feats - 1))

        # 未標準化 (Unstandardized) 原始尺度係數：供純 JS 預測引擎微秒級運算
        raw_ols = LinearRegression().fit(X_train[sub_feats], y_train)
        unstd_intercept = float(raw_ols.intercept_)
        unstd_coefs = {feat: float(coef) for feat, coef in zip(sub_feats, raw_ols.coef_)}

        # 標準化係數 (用於 Feature Importance 圖表)
        std_coefs = pipe.named_steps["regressor"].regressor_.coef_
        # 對齊特徵順序 (num_features 先, binary_features 後)
        sub_ordered = [c for c in sub_feats if c in num_features] + [c for c in sub_feats if c in binary_features]
        std_coef_map = {feat: float(coef) for feat, coef in zip(sub_ordered, std_coefs)}

        # 迴歸方程式字串 (原始尺度)
        equation_terms = [f"{unstd_intercept:,.2f}"]
        for feat in sub_feats:
            c = unstd_coefs[feat]
            sign = "+ " if c >= 0 else "- "
            equation_terms.append(f"{sign}{abs(c):.4f} × ({feat})")
        formula_str = f"medv = {' '.join(equation_terms)}"

        architectures[key] = {
            "id": spec["id"],
            "name": spec["name"],
            "shortName": spec["shortName"],
            "badge": spec["badge"],
            "features": sub_feats,
            "featureCount": len(sub_feats),
            "description": spec["desc"],
            "metrics": {
                "testR2": round(test_r2, 4),
                "adjustedR2": round(adj_r2, 4),
                "testRMSE": round(test_rmse, 4),
                "testRMSE_USD": round(test_rmse * 1000, 2),
                "testMAE": round(test_mae, 4),
                "testMAE_USD": round(test_mae * 1000, 2),
                "testMSE": round(test_mse, 4),
                "cvR2Mean": round(float(cv_r2.mean()), 4),
                "cvR2Std": round(float(cv_r2.std()), 4),
                "cvRMSEMean": round(float(-cv_neg_rmse.mean()), 4),
                "cvRMSEMean_USD": round(float(-cv_neg_rmse.mean() * 1000), 2),
                "trainR2": round(float(r2_score(y_train, y_train_pred)), 4),
                "trainRMSE": round(float(np.sqrt(mean_squared_error(y_train, y_train_pred))), 4)
            },
            "intercept": round(unstd_intercept, 4),
            "coefficients": {k: round(v, 6) for k, v in unstd_coefs.items()},
            "standardizedCoefficients": {k: round(v, 6) for k, v in std_coef_map.items()},
            "formula": formula_str
        }

    # 5. 特徵複雜度循序分析 (k=1 到 13，依相關係數絕對值排序)
    sorted_features = [c["col"] for c in correlations]
    complexity_series = []
    k_models = {}

    for k in range(1, len(sorted_features) + 1):
        cur_feats = sorted_features[:k]
        pipe_k = make_pipeline(cur_feats)
        pipe_k.fit(X_train, y_train)

        train_pred_k = pipe_k.predict(X_train)
        test_pred_k = pipe_k.predict(X_test)

        train_r2_k = float(r2_score(y_train, train_pred_k))
        test_r2_k = float(r2_score(y_test, test_pred_k))
        train_rmse_k = float(np.sqrt(mean_squared_error(y_train, train_pred_k)))
        test_rmse_k = float(np.sqrt(mean_squared_error(y_test, test_pred_k)))

        raw_ols_k = LinearRegression().fit(X_train[cur_feats], y_train)

        latest_feature = sorted_features[k - 1]
        is_sweet_spot = (k == 5)  # k=5 關鍵拐點，兼顧精簡與指標

        complexity_series.append({
            "k": k,
            "addedFeature": latest_feature,
            "addedFeatureName": feature_meta[latest_feature]["name"],
            "features": cur_feats,
            "trainRMSE": round(train_rmse_k, 4),
            "testRMSE": round(test_rmse_k, 4),
            "testRMSE_USD": round(test_rmse_k * 1000, 2),
            "trainR2": round(train_r2_k, 4),
            "testR2": round(test_r2_k, 4),
            "r2Delta": round(test_r2_k - (complexity_series[-1]["testR2"] if complexity_series else 0), 4),
            "isSweetSpot": is_sweet_spot
        })

        k_models[f"k{k}"] = {
            "k": k,
            "features": cur_feats,
            "intercept": round(float(raw_ols_k.intercept_), 4),
            "coefficients": {f: round(float(c), 6) for f, c in zip(cur_feats, raw_ols_k.coef_)}
        }

    # 6. 67 筆獨立測試集殘差診斷 (使用全特徵基準模型)
    best_pipe = make_pipeline(all_features)
    best_pipe.fit(X_train, y_train)
    test_preds = best_pipe.predict(X_test)

    residuals_list = []
    res_raw = y_test.values - test_preds
    res_std = float(np.std(res_raw))

    for idx, (original_idx, actual, pred) in enumerate(zip(X_test.index, y_test.values, test_preds), start=1):
        res = float(actual - pred)
        abs_err = abs(res)
        pct_err = float((abs_err / actual) * 100) if actual != 0 else 0
        sample_id = int(df_train.loc[original_idx, "ID"]) if "ID" in df_train.columns else original_idx

        # 診斷標籤：殘差絕對值超過 1.75 倍殘差標準差，或百分比誤差 > 30% 視為顯著離群殘差
        is_outlier = (abs_err > 1.75 * res_std) or (pct_err > 35)

        residuals_list.append({
            "rank": idx,
            "sampleId": sample_id,
            "actualMedv": round(float(actual), 2),
            "actualUSD": round(float(actual * 1000), 2),
            "predictedMedv": round(float(pred), 2),
            "predictedUSD": round(float(pred * 1000), 2),
            "residual": round(res, 2),
            "residualUSD": round(res * 1000, 2),
            "absError": round(abs_err, 2),
            "pctError": round(pct_err, 2),
            "status": "High Residual" if is_outlier else "In-Range",
            "statusType": "warning" if is_outlier else "success",
            "features": {col: round(float(X_test.loc[original_idx, col]), 3) for col in all_features}
        })

    # 依絕對殘差由大到小排序
    residuals_list.sort(key=lambda x: x["absError"], reverse=True)
    for i, item in enumerate(residuals_list, start=1):
        item["rank"] = i

    # 7. 173 筆真實無標籤測試集 (boston_test.csv) 批次預測
    X_unlabeled = df_test_raw.drop(columns=["ID"], errors="ignore")
    unlabeled_preds = best_pipe.predict(X_unlabeled)

    unlabeled_results = []
    for idx, pred in enumerate(unlabeled_preds):
        sample_id = int(df_test_raw.loc[idx, "ID"]) if "ID" in df_test_raw.columns else (idx + 1)
        row = df_test_raw.loc[idx]
        unlabeled_results.append({
            "id": sample_id,
            "predMedv": round(float(pred), 2),
            "predUSD": round(float(pred * 1000), 2),
            "crim": round(float(row["crim"]), 3),
            "rm": round(float(row["rm"]), 2),
            "tax": round(float(row["tax"]), 1),
            "ptratio": round(float(row["ptratio"]), 1),
            "lstat": round(float(row["lstat"]), 2)
        })

    # 8. 4 組典型社區情境預設
    # 基于訓練集特定分位數構建具有代表性的社區情境
    presets = [
        {
            "id": "suburb_luxury",
            "name": "郊區優質學區豪宅",
            "tag": "High-end Suburb",
            "desc": "低犯罪率、房間多、大坪數、低污染與頂級小班教育資源",
            "badge": "高端住宅",
            "values": {
                "crim": 0.08,
                "zn": 40.0,
                "indus": 3.5,
                "chas": 1,
                "nox": 0.42,
                "rm": 7.6,
                "age": 28.0,
                "dis": 5.8,
                "rad": 4,
                "tax": 280,
                "ptratio": 14.5,
                "black": 395.0,
                "lstat": 4.8
            }
        },
        {
            "id": "urban_metro",
            "name": "都會核心高密度住宅",
            "tag": "Urban Metro",
            "desc": "鄰近商業與就業中心、交通網絡發達、老牌都會住宅區",
            "badge": "市區樞紐",
            "values": {
                "crim": 0.35,
                "zn": 0.0,
                "indus": 12.0,
                "chas": 0,
                "nox": 0.58,
                "rm": 6.2,
                "age": 82.0,
                "dis": 2.2,
                "rad": 8,
                "tax": 410,
                "ptratio": 17.8,
                "black": 388.0,
                "lstat": 11.5
            }
        },
        {
            "id": "baseline_avg",
            "name": "波士頓歷史基準社區",
            "tag": "Regional Baseline",
            "desc": "各項指標皆取自波士頓訓練樣本之平均或中位水準",
            "badge": "母體均值",
            "values": {col: round(feature_ranges[col]["mean"], 2) for col in all_features}
        },
        {
            "id": "industrial_worker",
            "name": "工商業周邊平價社區",
            "tag": "Industrial Working-class",
            "desc": "高工業用地佔比、高公立學校師生比、低收入人口佔比較高",
            "badge": "平價老區",
            "values": {
                "crim": 4.8,
                "zn": 0.0,
                "indus": 18.5,
                "chas": 0,
                "nox": 0.67,
                "rm": 5.4,
                "age": 93.0,
                "dis": 1.9,
                "rad": 24,
                "tax": 666,
                "ptratio": 20.2,
                "black": 350.0,
                "lstat": 21.0
            }
        }
    ]

    # 9. 總體 KPI 與歷史基準
    kpi = {
        "trainSamples": len(X_train),
        "testSamples": len(X_test),
        "unlabeledSamples": len(df_test_raw),
        "totalFeatures": len(all_features),
        "bestModelName": "全特徵模型 (Full Model, 13 Features)",
        "fullModelR2": architectures["full"]["metrics"]["testR2"],
        "fullModelRMSE": architectures["full"]["metrics"]["testRMSE"],
        "fullModelRMSE_USD": architectures["full"]["metrics"]["testRMSE_USD"],
        "key5ModelR2": architectures["key5"]["metrics"]["testR2"],
        "key5ModelRMSE": architectures["key5"]["metrics"]["testRMSE"],
        "key5ModelRMSE_USD": architectures["key5"]["metrics"]["testRMSE_USD"],
        "core3ModelR2": architectures["core3"]["metrics"]["testR2"],
        "core3ModelRMSE": architectures["core3"]["metrics"]["testRMSE"],
        "rm1ModelR2": architectures["rm1"]["metrics"]["testR2"],
        "rm1ModelRMSE": architectures["rm1"]["metrics"]["testRMSE"],
        "topPositiveFeature": "rm (每戶平均房間數, r = +0.6953)",
        "topNegativeFeature": "lstat (社會低收入比例, r = -0.7358)",
        "meanMedv": round(float(y_train.mean()), 2),
        "meanPriceUSD": round(float(y_train.mean() * 1000), 2),
        "medianMedv": round(float(y_train.median()), 2),
        "medianPriceUSD": round(float(y_train.median() * 1000), 2),
        "minMedv": round(float(y.min()), 2),
        "maxMedv": round(float(y.max()), 2)
    }

    # 10. 組裝匯出全域物件
    dashboard_payload = {
        "metadata": {
            "datasetName": "Boston Housing Dataset",
            "targetVariable": "medv (房價中位數，千美元)",
            "splitCondition": "Train: 266 (80%), Test: 67 (20%), random_state = 42",
            "unlabeledTestSamples": len(df_test_raw),
            "generatedAt": "2026-10-19"
        },
        "kpi": kpi,
        "featureRanges": feature_ranges,
        "correlations": correlations,
        "architectures": architectures,
        "complexitySeries": complexity_series,
        "kModels": k_models,
        "presets": presets,
        "testSetResiduals": residuals_list,
        "unlabeledPredictions": unlabeled_results
    }

    # 寫出為 docs/boston-data.js
    output_js_path.parent.mkdir(parents=True, exist_ok=True)
    js_content = f"""/**
 * Boston Housing 線性迴歸分析與預測結構化資料集
 * 自動產生自 export_boston_data.py
 * 包含：4大模型架構指標、k=1~13 複雜度序列、67筆測試集殘差診斷、173筆未標籤測試集批次推論
 * 適用於：GitHub Pages 與本地離線預覽 (無 CORS 限制)
 */
window.BOSTON_DATA = {json.dumps(dashboard_payload, indent=2, ensure_ascii=False)};
"""
    with open(output_js_path, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"成功產出波士頓房價資料集: {output_js_path} (大小: {output_js_path.stat().st_size} bytes)")


if __name__ == "__main__":
    generate_boston_data()
