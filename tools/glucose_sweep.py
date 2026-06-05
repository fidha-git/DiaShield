import joblib
import numpy as np
import pandas as pd
import json
from pathlib import Path

MODEL_PATH = Path('backend/ml/model.pkl')
OUT_CSV = Path('tools/glucose_sweep_results.csv')
OUT_JSON = Path('tools/glucose_sweep_results.json')
OUT_PNG = Path('tools/glucose_sweep_plot.png')
DIABETES_THRESHOLD = 0.35

model = joblib.load(MODEL_PATH)
# robust feature names fallback
try:
    feat_names = list(model.feature_names_in_)
except Exception:
    feat_names = ['Pregnancies','Glucose','BloodPressure','SkinThickness','Insulin','BMI','DiabetesPedigreeFunction','Age']

fixed = {
    'Pregnancies': 2,
    'BloodPressure': 76,
    'SkinThickness': 20,
    'Insulin': 85,
    'BMI': 30,
    'DiabetesPedigreeFunction': 0.45,
    'Age': 45,
}

glucose_values = [70,80,90,100,110,120,126,130,140,160,180,200]
rows = []
X = []
for g in glucose_values:
    sample = [None]*len(feat_names)
    for i,fn in enumerate(feat_names):
        if fn == 'Glucose':
            sample[i] = float(g)
        else:
            sample[i] = float(fixed.get(fn,0))
    X.append(sample)

X = np.array(X,dtype=float)
if hasattr(model, 'predict_proba'):
    probs = model.predict_proba(X)[:,1]
else:
    probs = model.predict(X)

for i,g in enumerate(glucose_values):
    prob = float(probs[i])
    prediction = 'Positive' if prob >= DIABETES_THRESHOLD else 'Negative'
    risk_level = 'High Risk' if prediction == 'Positive' else 'Low Risk'
    rows.append({'Glucose': g, 'Probability': round(prob,6), 'Prediction': prediction, 'RiskLevel': risk_level})

# save CSV/JSON
df = pd.DataFrame(rows)
df.to_csv(OUT_CSV, index=False)
OUT_JSON.write_text(json.dumps({'rows': rows}, indent=2))

# attempt to plot
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.figure(figsize=(8,4))
    plt.plot(glucose_values, [r['Probability'] for r in rows], marker='o')
    plt.axhline(DIABETES_THRESHOLD, color='red', linestyle='--', label=f'Threshold={DIABETES_THRESHOLD}')
    plt.xlabel('Glucose')
    plt.ylabel('Predicted Probability')
    plt.title('Controlled Glucose Sweep')
    plt.grid(True)
    plt.savefig(OUT_PNG, bbox_inches='tight')
    plt.close()
    plot_saved = True
except Exception:
    plot_saved = False

# monotonicity check
violations = []
prev = -1.0
for a,b,g in zip([r['Probability'] for r in rows], [r['Probability'] for r in rows][1:]+[None], glucose_values):
    pass
# check strictly non-decreasing sequence
probs_list = [r['Probability'] for r in rows]
for i in range(len(probs_list)-1):
    if probs_list[i+1] < probs_list[i] - 1e-12:
        violations.append({'index': i, 'glucose_from': glucose_values[i], 'glucose_to': glucose_values[i+1], 'prob_from': probs_list[i], 'prob_to': probs_list[i+1]})

result = {'rows': rows, 'monotonic': len(violations)==0, 'violations': violations, 'plot_saved': plot_saved, 'csv': str(OUT_CSV), 'json': str(OUT_JSON), 'plot': str(OUT_PNG) if plot_saved else None}
print(json.dumps(result, indent=2))
