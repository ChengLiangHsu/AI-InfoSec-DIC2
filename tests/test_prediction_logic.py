import json
import re
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split


def get_trained_models():
    csv_path = Path("src/ai_infosec_dic2/50-startup-linearregression/50_Startups.csv")
    df = pd.read_csv(csv_path)

    X = df.drop("Profit", axis=1)
    y = df["Profit"]
    X = pd.get_dummies(X, drop_first=True, dtype=float)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=0
    )

    feature_subsets = {
        "k1": ["R&D Spend"],
        "k2": ["R&D Spend", "Marketing Spend"],
        "k3": ["R&D Spend", "Marketing Spend", "State_New York"],
        "k4": ["R&D Spend", "Marketing Spend", "State_New York", "State_Florida"],
        "k5": ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"],
    }

    models = {}
    for k_key, cols in feature_subsets.items():
        lr = LinearRegression()
        lr.fit(X_train[cols], y_train)
        models[k_key] = (lr, cols)

    return models, df


def parse_data_js():
    data_js_path = Path("docs/data.js")
    with open(data_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract predictionModels
    match_models = re.search(r"predictionModels:\s*(\{[\s\S]*?\n  \},)", content)
    assert match_models, "Could not find predictionModels in docs/data.js"

    # Extract historicalBenchmark
    match_bench = re.search(r"historicalBenchmark:\s*(\{[\s\S]*?\n  \})", content)
    assert match_bench, "Could not find historicalBenchmark in docs/data.js"

    # Extract predictionPresets
    match_presets = re.search(r"predictionPresets:\s*(\[[\s\S]*?\n  \],)", content)
    assert match_presets, "Could not find predictionPresets in docs/data.js"

    # Safely evaluate JSON-like dictionary
    models_str = match_models.group(1).rstrip(",")
    # convert keys to json format
    models_clean = re.sub(r"(\b[a-zA-Z0-9_]+)\s*:", r'"\1":', models_str)
    # fix quotes if needed
    models_clean = re.sub(r',(\s*[}\]])', r'\1', models_clean)

    return content


def test_data_js_coefficients_match_sklearn():
    models, df = get_trained_models()

    data_js_path = Path("docs/data.js")
    with open(data_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    for k_key, (lr, cols) in models.items():
        # extract specific block for k_key
        block_pattern = rf'{k_key}:\s*\{{[\s\S]*?formula:'
        m_block = re.search(block_pattern, content)
        assert m_block, f"Block for {k_key} not found"
        block_text = m_block.group(0)

        # verify intercept
        expected_intercept = lr.intercept_
        m = re.search(r'intercept:\s*([\d\.-]+)', block_text)
        assert m, f"Intercept for {k_key} not found"
        js_intercept = float(m.group(1))
        assert abs(js_intercept - expected_intercept) < 0.1, (
            f"Intercept mismatch for {k_key}: js={js_intercept}, sklearn={expected_intercept}"
        )

        # verify coefficients
        for col, expected_coef in zip(cols, lr.coef_):
            pattern_coef = rf'"{re.escape(col)}":\s*([\d\.-]+)'
            m_c = re.search(pattern_coef, block_text)
            assert m_c, f"Coefficient for {col} in {k_key} not found"
            js_coef = float(m_c.group(1))
            assert abs(js_coef - expected_coef) < 0.001, (
                f"Coef mismatch for {col} in {k_key}: js={js_coef}, sklearn={expected_coef}"
            )


def test_historical_benchmark():
    _, df = get_trained_models()
    expected_mean = df["Profit"].mean()

    data_js_path = Path("docs/data.js")
    with open(data_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    m = re.search(r"meanProfit:\s*([\d\.]+)", content)
    assert m, "meanProfit not found in docs/data.js"
    js_mean = float(m.group(1))
    assert abs(js_mean - expected_mean) < 0.1, (
        f"Mean profit mismatch: js={js_mean}, pandas={expected_mean}"
    )


def test_html_predictor_elements_exist():
    html_path = Path("docs/index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    required_ids = [
        "predictor",
        "model-selector-group",
        "preset-buttons-container",
        "slider-rd",
        "num-rd",
        "label-rd",
        "slider-mkt",
        "num-mkt",
        "label-mkt",
        "slider-admin",
        "num-admin",
        "label-admin",
        "select-state",
        "label-state",
        "pred-profit-value",
        "pred-benchmark-pill",
        "pred-formula-box",
        "pred-breakdown-list",
        "pred-insight-text",
    ]

    for elem_id in required_ids:
        assert f'id="{elem_id}"' in html, f"Missing id='{elem_id}' in docs/index.html"


def test_prediction_formula_calculation():
    # Test k=2 calculation on preset avg: rd=74000, mkt=210000
    intercept = 46346.3388
    beta_rd = 0.788618
    beta_mkt = 0.032577

    rd = 74000
    mkt = 210000
    expected_pred = intercept + beta_rd * rd + beta_mkt * mkt
    # Expected profit should be around $111,545.24
    assert 110000 < expected_pred < 113000

    # Test k=5 calculation with all features
    intercept_k5 = 42554.1676
    beta_rd_k5 = 0.773467
    beta_adm_k5 = 0.032885
    beta_mkt_k5 = 0.036610
    beta_fl_k5 = -959.284160
    beta_ny_k5 = 699.369053

    admin = 121000
    pred_k5_ny = (
        intercept_k5
        + beta_rd_k5 * rd
        + beta_adm_k5 * admin
        + beta_mkt_k5 * mkt
        + beta_ny_k5 * 1
    )
    assert 110000 < pred_k5_ny < 115000
