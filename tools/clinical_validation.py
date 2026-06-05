import joblib
import numpy as np
import pandas as pd
from pathlib import Path

MODEL_PATH = Path('backend/ml/model.pkl')
DATA_CSV = Path('backend/ml/diabetes.csv')
DIABETES_THRESHOLD = 0.35

model = joblib.load(MODEL_PATH)
# Determine feature names robustly (fallback to known PIMA order)
try:
    feat_names = list(model.feature_names_in_)
except Exception:
    try:
        # If pipeline, try to get from named steps or final estimator
        if hasattr(model, 'named_steps'):
            # fallback hard-coded PIMA order
            feat_names = ['Pregnancies','Glucose','BloodPressure','SkinThickness','Insulin','BMI','DiabetesPedigreeFunction','Age']
        else:
            feat_names = ['Pregnancies','Glucose','BloodPressure','SkinThickness','Insulin','BMI','DiabetesPedigreeFunction','Age']
    except Exception:
        feat_names = ['Pregnancies','Glucose','BloodPressure','SkinThickness','Insulin','BMI','DiabetesPedigreeFunction','Age']

# Load dataset to compute medians/std for baseline
if DATA_CSV.exists():
    df = pd.read_csv(DATA_CSV)
else:
    df = None

medians = {}
stds = {}
if df is not None:
    for fn in feat_names:
        if fn in df.columns:
            med = df[fn].median()
            sd = df[fn].std()
        else:
            low = fn.lower()
            if low in df.columns:
                med = df[low].median()
                sd = df[low].std()
            else:
                med = 0.0
                sd = 1.0
        medians[fn] = float(med) if pd.notna(med) else 0.0
        stds[fn] = float(sd) if pd.notna(sd) and sd>0 else 1.0
else:
    for fn in feat_names:
        medians[fn] = 0.0
        stds[fn] = 1.0

# helper to compute approx contributions
# Get feature importances from final estimator if available
if hasattr(model, 'feature_importances_'):
    importances = model.feature_importances_
else:
    try:
        # If pipeline, final estimator may have feature_importances_
        final_est = model
        if hasattr(model, 'steps'):
            final_est = model.steps[-1][1]
        importances = getattr(final_est, 'feature_importances_', np.ones(len(feat_names)) / len(feat_names))
    except Exception:
        importances = np.ones(len(feat_names)) / len(feat_names)
imp_norm = importances / (importances.sum() if importances.sum()>0 else 1.0)

# Create synthetic cases
cases = []
np.random.seed(42)

# categories and generators
def make_case(preg, glu, bp, skin, ins, bmi, dpf, age, cat):
    return {
        'category': cat,
        'Pregnancies': int(preg),
        'Glucose': float(glu),
        'BloodPressure': float(bp),
        'SkinThickness': float(skin),
        'Insulin': float(ins),
        'BMI': float(bmi),
        'DiabetesPedigreeFunction': float(dpf),
        'Age': int(age),
    }

# Healthy young adults (5 cases)
for i in range(5):
    cases.append(make_case(0, np.random.normal(90,5), np.random.normal(70,5), np.random.normal(15,3), np.random.normal(60,10), np.random.normal(22,1.5), np.random.normal(0.2,0.05), np.random.randint(20,30), 'Healthy young adult'))

# Overweight adults (BMI 25-29)
for i in range(5):
    cases.append(make_case(np.random.randint(0,3), np.random.normal(100,10), np.random.normal(75,6), np.random.normal(18,4), np.random.normal(80,20), np.random.normal(27,1.5), np.random.normal(0.3,0.1), np.random.randint(30,50), 'Overweight adult'))

# Obese adults (BMI 30-40)
for i in range(5):
    cases.append(make_case(np.random.randint(0,5), np.random.normal(110,15), np.random.normal(80,8), np.random.normal(22,6), np.random.normal(90,30), np.random.normal(33,3), np.random.normal(0.4,0.15), np.random.randint(30,60), 'Obese adult'))

# Prediabetic patients (impaired glucose)
for i in range(5):
    cases.append(make_case(np.random.randint(0,4), np.random.normal(115,8), np.random.normal(78,6), np.random.normal(20,5), np.random.normal(85,25), np.random.normal(29,2), np.random.normal(0.45,0.2), np.random.randint(35,60), 'Prediabetic'))

# High-risk diabetic patients
for i in range(5):
    cases.append(make_case(np.random.randint(0,6), np.random.normal(160,20), np.random.normal(90,10), np.random.normal(30,8), np.random.normal(200,100), np.random.normal(36,4), np.random.normal(1.0,0.4), np.random.randint(50,75), 'High-risk diabetic'))

# Elderly patients
for i in range(5):
    cases.append(make_case(np.random.randint(0,3), np.random.normal(105,12), np.random.normal(80,10), np.random.normal(18,5), np.random.normal(70,30), np.random.normal(28,3), np.random.normal(0.6,0.3), np.random.randint(65,85), 'Elderly'))

# Run model predictions
X = np.array([[c[f] for f in feat_names] for c in cases], dtype=float)
if hasattr(model, 'predict_proba'):
    probs = model.predict_proba(X)[:,1]
else:
    probs = model.predict(X)

results = []
for i,c in enumerate(cases):
    prob = float(probs[i])
    prediction = 'Positive' if prob >= DIABETES_THRESHOLD else 'Negative'
    risk_level = 'High Risk' if prediction == 'Positive' else 'Low Risk'
    # approximate contributions: zscore * importance
    contribs = {}
    for j,fn in enumerate(feat_names):
        z = (c[fn] - medians.get(fn,0.0)) / (stds.get(fn,1.0) if stds.get(fn,1.0)>0 else 1.0)
        contribs[fn] = float(z * imp_norm[j])
    # top factors by absolute contrib
    top = sorted(contribs.items(), key=lambda x: -abs(x[1]))[:3]
    explanation = [{'feature': k, 'score': v} for k,v in top]
    results.append({'id': i+1, 'category': c['category'], 'input': c, 'probability': round(prob,4), 'prediction': prediction, 'risk_level': risk_level, 'explanation': explanation})

# Analyze monotonicity within categories for primary risk variable (Glucose or BMI)
from collections import defaultdict
cats = defaultdict(list)
for r in results:
    cats[r['category']].append(r)

violations = []
for cat, lst in cats.items():
    primary = 'Glucose' if 'Prediabetic' in cat or 'High-risk' in cat or 'Healthy' in cat else 'BMI'
    sorted_lst = sorted(lst, key=lambda x: x['input'][primary])
    probs_seq = [x['probability'] for x in sorted_lst]
    for a,b in zip(probs_seq, probs_seq[1:]):
        if b + 1e-8 < a:
            violations.append({'category': cat, 'primary': primary, 'seq': probs_seq})
            break

import json
out = {'cases': results, 'violations': violations, 'feature_importances': dict(zip(feat_names, imp_norm.tolist())), 'medians': medians}
print(json.dumps(out, indent=2))
