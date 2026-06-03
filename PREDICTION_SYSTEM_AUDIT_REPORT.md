# DiaShield Diabetes Prediction System — Complete Audit Report

**Date:** 2026-06-03
**Auditor:** AI Code Review
**Scope:** End-to-end prediction pipeline (frontend → backend → ML model → database)

---

## A. Prediction Workflow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                      DIABETES PREDICTION WORKFLOW                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FRONTEND                     BACKEND                      MODEL     │
│  ┌──────────┐               ┌──────────┐              ┌──────────┐  │
│  │Diabetes  │  POST /predict│FastAPI   │  input_data  │RandomForest│  │
│  │Prediction│──────────────►│Router    │─────────────►│Classifier │  │
│  │.jsx      │               │prediction│              │model.pkl  │  │
│  │          │               │_routes.py│              │(4 features)│  │
│  │8 inputs  │               │          │              └─────┬────┘  │
│  │          │               │8 features│                    │       │
│  └────┬─────┘               │passed to│                    │       │
│       │                     │model     │◄───────────────────┘       │
│       │◄────────────────────┤          │  predict_proba result      │
│       │   response          └────┬─────┘                             │
│       │                          │                                   │
│       │  POST /prediction-       │                                  │
│       │  history/create          ▼                                   │
│       │──────────────────►┌──────────────┐                          │
│       │                   │prediction_   │     DATABASE              │
│       │                   │history_routes│     ┌──────────┐         │
│       │                   │.py           │────►│prediction│         │
│       │                   │              │     │_histories│         │
│       │                   │Service → DB  │     └──────────┘         │
│       │◄──────────────────┤              │                          │
│       │   201 Created     └──────────────┘                          │
│       │                                                             │
│  Display                                                           │
│  result to user                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Problem:** The model expects 4 features (Age, BMI, Glucose, BloodPressure) but the API sends 8 (pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi, diabetes_pedigree, age). This would cause a `ValueError: Number of features does not match` at `prediction_routes.py:55`.

---

## B. Complete File Inventory

### Backend — ML & Training
| File | Role |
|------|------|
| `backend/ml/train_model.py` | Trains RandomForest on 4 features, saves model.pkl |
| `backend/ml/model.pkl` | Serialized model artifact |
| `backend/ml/diabetes.csv` | Pima Indians Diabetes dataset (768 rows) |

### Backend — API Routes
| File | Endpoints |
|------|-----------|
| `backend/routes/prediction_routes.py` | `POST /predict` — main inference endpoint |
| `backend/routes/prediction_history_routes.py` | `POST /prediction-history/create`, `GET /prediction-history/`, `GET /prediction-history/latest`, `DELETE /prediction-history/delete/{id}` |
| `backend/routes/admin_routes.py` | `GET /admin/predictions` — admin view |
| `backend/routes/patient_dashboard_routes.py` | `GET /dashboard` — includes latest_prediction |
| `backend/routes/report_routes.py` | `GET /report/pdf` — includes prediction history |
| `backend/routes/analytics_routes.py` | `GET /analytics/monthly` |

### Backend — Service Layer
| File | Functions |
|------|-----------|
| `backend/services/prediction_history_service.py` | `create_prediction_history`, `get_prediction_history`, `get_latest_prediction`, `delete_prediction_history` |
| `backend/services/patient_dashboard_service.py` | `get_patient_dashboard_data` — aggregates latest prediction |
| `backend/services/activity_log_service.py` | `log_activity` — logs "Prediction created" |

### Backend — Schemas
| File | Classes |
|------|---------|
| `backend/schemas/prediction_schema.py` | `PredictionRequest` (8 fields), `PredictionResponse`, `PredictionDBResponse` |
| `backend/schemas/prediction_history_schema.py` | `PredictionHistoryCreate`, `PredictionHistoryResponse` |
| `backend/schemas/patient_dashboard_schema.py` | `PredictionResponse` (nested) |

### Backend — Database Models
| File | Table |
|------|-------|
| `backend/models/prediction_model.py` | `predictions` (linked to `users`) |
| `backend/models/prediction_history_model.py` | `prediction_histories` (linked to `patients`) |

### Frontend
| File | Role |
|------|------|
| `diashield front/src/pages/DiabetesPrediction.jsx` | Prediction form (8 fields), API calls, result display |
| `diashield front/src/pages/PredictionHistory.jsx` | History list display |
| `diashield front/src/pages/Dashboard.jsx` | Shows latest prediction on patient dashboard |
| `diashield front/src/pages/AdminPredictions.jsx` | Admin prediction analytics |
| `diashield front/src/services/api.js` | Axios client with JWT |

---

## C. Critical Issues

### C1. Feature Count Mismatch — Model vs API

**Severity:** CRITICAL — RUNTIME FAILURE

**Evidence:**
- Training (`train_model.py:35`): `feature_columns = ["Age", "BMI", "Glucose", "BloodPressure"]` — model trained with **4 features**
- API (`prediction_routes.py:42-51`): sends **8 values** — `pregnancies`, `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree`, `age`
- The RandomForest classifier will throw `ValueError: Number of features of the model must match the input. Model n_features is 4 and input n_features is 8`

**Impact:** The `/predict` endpoint returns HTTP 500 whenever called. The prediction system is completely non-functional.

### C2. No Scaling/Normalization During Training or Inference

**Severity:** HIGH — DEGRADED ACCURACY

**Evidence:**
- `train_model.py:43-44`: `X = data[feature_columns]` then `model.fit(X_train, y_train)` — no `StandardScaler`, `MinMaxScaler`, or any preprocessing
- `prediction_routes.py:42-51`: raw values sent directly to `model.predict()` — no preprocessing

**Impact:** RandomForest is tree-based and invariant to scaling, so this doesn't cause errors. However, the lack of feature engineering (interaction terms, polynomial features, outlier handling) limits model accuracy.

### C3. Confidence Extraction Bug — Always Uses Positive Class

**Severity:** HIGH — INCORRECT FOR NEGATIVE PREDICTIONS

**Evidence:** `prediction_routes.py:66-67`:
```python
risk_probability = float(probabilities[1])       # always positive class
model_confidence = float(probabilities[prediction_label])  # correct
```

When the model predicts `Negative` (class 0), `prediction_label = 0`:
- `risk_probability` = probability of class 1 (positive) — **misleading as "risk" metric**
- `model_confidence` = probability of class 0 (negative) — correct confidence

The `risk_probability` is returned in 4 different fields and used by the frontend as the primary confidence score.

### C4. Two-Phase Save with No Transaction — Data Loss Risk

**Severity:** HIGH — PREDICTION RESULTS CAN BE LOST

**Evidence:**
- `/predict` endpoint does NOT save prediction results to any table — only logs activity (`prediction_routes.py:89`)
- Frontend separately calls `/prediction-history/create` (`DiabetesPrediction.jsx:194-202`) to save
- If the second API call fails (network error, server error), the prediction result is displayed to the user but **never saved to the database**

**Impact:** Users see a result but it's not stored in history, not visible on dashboard, and not included in admin analytics.

---

## D. Medium Issues

### D1. Column Name Mismatch — CSV vs Training Script

Training CSV (`diabetes.csv` line 1):
```
Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,Outcome
```

Training script selects `["Age", "BMI", "Glucose", "BloodPressure"]` — these match the CSV header exactly, so this works correctly. However, the API schema uses snake_case (`blood_pressure`, `bmi`, `glucose`, `age`) — while the model doesn't care about column names (it uses positional features), the naming inconsistency makes maintenance confusing.

### D2. Two Separate Prediction Storage Tables

`predictions` table (prediction_model.py) stores: `user_id`, `pregnancies`, `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree`, `age`, `result`, `created_at`
`prediction_histories` table (prediction_history_model.py) stores: `patient_id`, `prediction_result`, `risk_level`, `probability`, `created_at`

The `predictions` table is **never written to** — no endpoint inserts into it. It exists as dead schema.
The `prediction_histories` table is the active one, but it doesn't store input features, making it impossible to audit or re-run past predictions.

### D3. Unused `PredictionDBResponse` Schema

`schemas/prediction_schema.py:29-43` defines `PredictionDBResponse` with full ORM mapping. It's imported in `prediction_routes.py:17` but never used as `response_model` in any endpoint.

### D4. No Input Validation / Range Checks

The API accepts any numeric values without validation. Users can submit:
- Negative age, blood pressure, glucose
- Absurdly high BMI values (1000+)
- Null/undefined values

While `PredictionRequest` uses Pydantic types (int/float), there are no `Field(ge=..., le=...)` constraints. The model will happily predict on invalid inputs.

### D5. Confidence Field Overcomplication

The API response (`prediction_routes.py:90-99`) returns **5 fields** that all essentially contain the same value:
```python
"confidence": risk_probability,
"probability": risk_probability,
"risk_probability": risk_probability,
"risk_percentage": risk_percentage,  # this one is % (0-100)
"model_confidence": model_confidence,
```

The frontend (`DiabetesPrediction.jsx:126-147`) tries **9 different candidate fields** in an `extractConfidenceScore` function, suggesting confusion about which field to use.

---

## E. Minor Issues

### E1. Model Loaded at Import Time

`prediction_routes.py:26-29`:
```python
try:
    model = joblib.load(MODEL_PATH)
except Exception:
    model = None
```

The model is loaded at module import time, not during app startup. If `model.pkl` is missing or corrupt, the app still starts but `/predict` returns 503. Better to load during a lifespan startup event.

### E2. Hardcoded Dataset Path

`train_model.py:14`: `dataset_path = "diabetes.csv"` — hardcoded relative path with no CLI argument or env variable.

### E3. No Model Versioning / Metadata

No version number, training timestamp, feature list, or accuracy metrics are stored alongside `model.pkl`. If a new model is trained, there's no way to know which version is deployed.

### E4. Raw `print()` in Production Code

`patient_dashboard_service.py:56-68`: prints health records to stdout in production.

### E5. Chained Exception Handling on Error

`DiabetesPrediction.jsx:204-205`:
```javascript
alert(error.response?.data?.detail || "Prediction failed")
```

Using `alert()` in React is poor UX. No retry mechanism or graceful degradation.

### E6. Skeleton Uses Wrong Background Color

`PredictionHistory.jsx:27-31`: skeleton loaders use `bg-sky-100` — this is fine but doesn't use the existing `animate-pulse` pattern properly in dark mode. Already addressed in dark mode fixes.

---

## F. Accuracy Risks

### F1. Small, Non-Representative Training Dataset

- **768 records** — very small for medical ML
- **All female** of **Pima Indian** heritage — predictions for males or other ethnicities are unreliable
- **Class imbalance** — ~65% negative, ~35% positive (typical for this dataset)
- **Zero-value placeholders** — in the dataset, values like `Glucose=0`, `BloodPressure=0`, `BMI=0`, `SkinThickness=0`, `Insulin=0` are actually missing values, not real measurements. The training treats them as valid numbers. For context, `BloodPressure=0` is biologically impossible.

### F2. Only 4 Features Used From 8 Available

The model uses only `Age`, `BMI`, `Glucose`, `BloodPressure`. Discarded features that have known predictive value:
- **Pregnancies** — strongly correlated with diabetes risk
- **Insulin** — directly related to diabetes
- **DiabetesPedigreeFunction** — genetic risk factor
- **SkinThickness** — correlated with obesity

### F3. No Cross-Validation or Advanced Metrics

`train_model.py` only calculates `accuracy_score`. No:
- Precision, recall, F1-score
- ROC-AUC
- Confusion matrix
- Cross-validation
- Hyperparameter tuning (`n_estimators=100` with `random_state=42` — no grid search)
- Feature importance analysis

### F4. No Data Leakage Prevention

`train_model.py:47-49`: `train_test_split(X, y, test_size=0.2, random_state=42)` — simple split with no stratification. No check for duplicates or overlapping patients.

---

## G. Recommended Fixes

### G1. [CRITICAL] Fix Feature Count Mismatch

Either train the model on all 8 features or send only the 4 the model expects.

**Option A — Retrain with all 8 features (`train_model.py`):**
```python
feature_columns = [
    "Pregnancies", "Glucose", "BloodPressure",
    "SkinThickness", "Insulin", "BMI",
    "DiabetesPedigreeFunction", "Age"
]
```

**Option B — Send only 4 features (`prediction_routes.py`):**
```python
input_data = [[
    data.age,
    data.bmi,
    data.glucose,
    data.blood_pressure
]]
```

**Option C — With pipeline (recommended):**
Save a `sklearn.pipeline.Pipeline` that includes feature selection, scaling (if needed), and the model.

### G2. [HIGH] Fix Confidence Extraction

`prediction_routes.py:66-67` — use `model_confidence` as the primary metric, not `risk_probability`:
```python
# risk_probability should be the actual prediction probability
risk_probability = float(probabilities[prediction_label])
model_confidence = risk_probability
```

### G3. [HIGH] Save Prediction Result in the `/predict` Endpoint

Add database save within the `/predict` endpoint so the save is atomic:
```python
@router.post("/predict")
async def predict(...):
    ...
    # Save to database
    prediction_record = PredictionModel(
        user_id=current_user.id,
        pregnancies=data.pregnancies,
        glucose=data.glucose,
        ...
        result=result
    )
    db.add(prediction_record)
    db.commit()
    ...
```

### G4. [MEDIUM] Add Input Validation

`schemas/prediction_schema.py`:
```python
class PredictionRequest(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20, description="Number of pregnancies")
    glucose: int = Field(..., ge=20, le=400, description="Plasma glucose concentration")
    blood_pressure: int = Field(..., ge=30, le=200, description="Diastolic blood pressure")
    skin_thickness: int = Field(..., ge=0, le=100, description="Triceps skin fold thickness")
    insulin: int = Field(..., ge=0, le=1000, description="2-Hour serum insulin")
    bmi: float = Field(..., ge=10, le=70, description="Body mass index")
    diabetes_pedigree: float = Field(..., ge=0, le=3, description="Diabetes pedigree function")
    age: int = Field(..., ge=1, le=120, description="Age in years")
```

### G5. [MEDIUM] Standardize API Response

Remove duplicate confidence fields from `prediction_routes.py:90-99`:
```python
return {
    "prediction": result,
    "confidence": model_confidence,
    "risk_percentage": risk_percentage,
}
```

And update the frontend `extractConfidenceScore` to use only `confidence`.

### G6. [MEDIUM] Remove Dead Code

Remove unused `predictions` table or reconcile with `prediction_histories`. Remove unused `PredictionDBResponse` schema.

### G7. [MINOR] Model Startup Loading

Move model loading from import-time to a lifespan event in `main.py`.

### G8. [MINOR] Add Model Metadata

Save alongside `model.pkl`:
```python
model_meta = {
    "version": "1.0",
    "features": feature_columns,
    "accuracy": accuracy,
    "training_date": datetime.now().isoformat(),
    "dataset_size": len(data),
    "n_estimators": 100
}
joblib.dump({"model": model, "metadata": model_meta}, output_path)
```

---

## H. Health Score

```
┌─────────────────────────────────────────────────────┐
│          PREDICTION SYSTEM HEALTH SCORE             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Category                    Score   Weight         │
│  ──────────────────────────────────────────         │
│  Feature Integrity           10/100  × 30%          │
│  Data Flow Completeness      40/100  × 20%          │
│  Code Quality                50/100  × 15%          │
│  Error Handling              40/100  × 15%          │
│  Accuracy Robustness         30/100  × 10%          │
│  Security / Auth             80/100  × 10%          │
│                                                     │
│  ──────────────────────────────────────────         │
│  WEIGHTED TOTAL:             32/100                 │
│                                                     │
│  CRITICAL FAILURES:                                 │
│   • Feature count mismatch → 500 error              │
│   • No prediction save in main endpoint             │
│   • Incorrect confidence extraction                 │
│                                                     │
│  STATUS: NON-FUNCTIONAL                             │
└─────────────────────────────────────────────────────┘
```

### Most Urgent (Fix Order):
1. **Feature count mismatch** — retrain model or fix input dimensions
2. **Save prediction atomically** — add DB save to `/predict` endpoint
3. **Fix confidence extraction** — use correct class probability
4. **Add input validation** — Pydantic range constraints
5. **Remove dead code** — `predictions` table and `PredictionDBResponse`
6. **Standardize API response fields**
