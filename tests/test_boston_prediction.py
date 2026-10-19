"""
test_boston_prediction.py
自動化驗證波士頓房價資料集、模型係數與前端預測數學邏輯
"""

import json
from pathlib import Path
import pytest


@pytest.fixture(scope="module")
def boston_data():
    project_root = Path(__file__).resolve().parents[1]
    data_js_path = project_root / "docs" / "boston-data.js"
    assert data_js_path.exists(), f"找不到 {data_js_path}"

    content = data_js_path.read_text(encoding="utf-8")
    prefix = "window.BOSTON_DATA = "
    assert prefix in content, "boston-data.js 缺少 window.BOSTON_DATA 前綴"

    start_idx = content.find(prefix)
    json_str = content[start_idx + len(prefix):].strip().rstrip(";")
    data = json.loads(json_str)
    return data


def test_boston_data_keys(boston_data):
    """驗證資料集全域結構之完整性"""
    required_keys = [
        "metadata", "kpi", "featureRanges", "correlations",
        "architectures", "complexitySeries", "kModels",
        "presets", "testSetResiduals", "unlabeledPredictions"
    ]
    for key in required_keys:
        assert key in boston_data, f"資料集缺少必要鍵: {key}"


def test_feature_ranges_and_presets(boston_data):
    """驗證特徵邊界合法性與 4 組經典情境數值均在 min/max 內"""
    ranges = boston_data["featureRanges"]
    assert len(ranges) == 13, f"應具備 13 項特徵，目前僅有 {len(ranges)}"

    presets = boston_data["presets"]
    assert len(presets) == 4, f"應具備 4 組典型情境，目前有 {len(presets)}"

    for preset in presets:
        vals = preset["values"]
        for col, val in vals.items():
            f_min = ranges[col]["min"]
            f_max = ranges[col]["max"]
            assert f_min <= val <= f_max, (
                f"情境 {preset['name']} 之特徵 {col}={val} 超出範圍 [{f_min}, {f_max}]"
            )


def test_architectures_consistency(boston_data):
    """驗證 4 大模型架構的指標與係數結構"""
    archs = boston_data["architectures"]
    expected_ids = ["full", "key5", "core3", "rm1"]
    for arch_id in expected_ids:
        assert arch_id in archs, f"缺少架構: {arch_id}"
        arch = archs[arch_id]
        assert "metrics" in arch
        assert "coefficients" in arch
        assert "intercept" in arch
        assert arch["metrics"]["testR2"] > 0, "測試集 R2 應為正值"
        assert arch["metrics"]["testRMSE"] > 0, "測試集 RMSE 應為正值"
        assert len(arch["coefficients"]) == arch["featureCount"]


def test_prediction_formula_math(boston_data):
    """驗證前端線性預測公式在測試殘差樣本上的計算正確性"""
    full_arch = boston_data["architectures"]["full"]
    intercept = full_arch["intercept"]
    coefs = full_arch["coefficients"]

    residuals = boston_data["testSetResiduals"]
    assert len(residuals) == 67, f"測試樣本數應為 67 筆，目前為 {len(residuals)}"

    for sample in residuals[:10]:
        feat_vals = sample["features"]
        calculated_pred = intercept + sum(coefs[k] * feat_vals[k] for k in coefs)
        # 允許小數點四捨五入在 0.05 千美元內
        assert abs(calculated_pred - sample["predictedMedv"]) < 0.05, (
            f"樣本 #{sample['sampleId']} 計算值 {calculated_pred} 與預測值 {sample['predictedMedv']} 不符"
        )
        assert abs(sample["actualMedv"] - sample["predictedMedv"] - sample["residual"]) < 0.05


def test_complexity_series_trend(boston_data):
    """驗證 k=1~13 特徵數複雜度走勢"""
    series = boston_data["complexitySeries"]
    assert len(series) == 13
    assert series[0]["k"] == 1
    assert series[-1]["k"] == 13
    # 驗證 k=5 為推薦 Sweet Spot
    assert series[4]["isSweetSpot"] is True


def test_unlabeled_predictions_count(boston_data):
    """驗證真實無標籤測試集 173 筆批次預測完整度"""
    unlabeled = boston_data["unlabeledPredictions"]
    assert len(unlabeled) == 173
    for row in unlabeled[:10]:
        assert "predMedv" in row
        assert "predUSD" in row
        assert row["predMedv"] > 0
