"""
Explainability utilities for Logistic Regression model.
Computes per-feature contributions to predictions.
"""
import numpy as np

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

IMPACT_LABELS = {
    "Pregnancies": "Pregnancies",
    "Glucose": "Glucose",
    "BloodPressure": "Blood Pressure",
    "SkinThickness": "Skin Thickness",
    "Insulin": "Insulin",
    "BMI": "BMI",
    "DiabetesPedigreeFunction": "Diabetes Pedigree",
    "Age": "Age",
}


def _get_coefficients(model):
    if "lr" in model.named_steps:
        return model.named_steps["lr"].coef_[0]
    cal = model.named_steps.get("cal")
    if cal is not None:
        return cal.calibrated_classifiers_[0].estimator.coef_[0]
    raise ValueError("No supported estimator step found in pipeline")


def compute_top_factors(raw_features, model):
    """
    Given raw feature values (list of 8 floats) and the sklearn Pipeline,
    compute per-feature contributions to the log-odds and return ranked factors.

    Returns:
        list of dict: [{"feature": str, "impact": str, "direction": str}, ...]
    """
    scaler = model.named_steps["scaler"]
    coef = _get_coefficients(model)

    raw = np.array([raw_features])
    scaled = scaler.transform(raw)
    contributions = coef * scaled[0]

    total_abs = np.sum(np.abs(contributions))
    if total_abs == 0:
        return []

    factors = []
    for idx in np.argsort(-np.abs(contributions)):
        feature = FEATURE_NAMES[idx]
        contr = contributions[idx]
        pct = np.abs(contr) / total_abs * 100
        direction = "Increase Risk" if contr > 0 else "Decrease Risk"

        if pct >= 20:
            impact = "High"
        elif pct >= 10:
            impact = "Moderate"
        else:
            impact = "Low"

        factors.append({
            "feature": feature,
            "impact": impact,
            "direction": direction,
        })

    return factors
