"""
Risk Scoring Model for DeliverGuard AI

Predicts:
  - risk_score (0-100): likelihood of disruption causing income loss
  - claim_probability: probability of claim in next 6 hours
  - expected_payout: predicted payout amount

Features:
  1. rain_mm           : rainfall in mm/hr
  2. aqi               : air quality index
  3. temperature       : temperature in °C
  4. traffic_ratio     : currentSpeed / freeFlowSpeed
  5. hour_of_day       : 0-23
  6. is_weekend        : 0 or 1
  7. historical_claims : user's past claim count
  8. avg_daily_income  : user's average daily income
  9. policy_type       : 0=basic, 1=standard, 2=premium
  10. user_age_days    : days since registration
"""

import numpy as np
import pickle
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
N = 3000

# ── Generate synthetic training data ──────────────────────────────

# LOW RISK scenarios (1500 samples)
low_risk = np.column_stack([
    np.random.uniform(0, 40, 1500),      # rain_mm — below threshold
    np.random.uniform(0, 250, 1500),     # aqi — good/moderate
    np.random.uniform(20, 38, 1500),     # temperature — normal
    np.random.uniform(0.6, 1.0, 1500),   # traffic_ratio — smooth
    np.random.randint(0, 24, 1500),      # hour_of_day
    np.random.choice([0, 1], 1500, p=[0.7, 0.3]),  # is_weekend
    np.random.randint(0, 3, 1500),       # historical_claims — low
    np.random.uniform(500, 1500, 1500),  # avg_daily_income
    np.random.randint(0, 3, 1500),       # policy_type
    np.random.uniform(30, 365, 1500),    # user_age_days
])
low_risk_scores = np.random.uniform(0, 30, 1500)

# MEDIUM RISK scenarios (1000 samples)
med_risk = np.column_stack([
    np.random.uniform(40, 70, 1000),     # rain_mm — moderate
    np.random.uniform(250, 350, 1000),   # aqi — unhealthy
    np.random.uniform(38, 44, 1000),     # temperature — hot
    np.random.uniform(0.3, 0.6, 1000),   # traffic_ratio — congested
    np.random.randint(0, 24, 1000),
    np.random.choice([0, 1], 1000, p=[0.6, 0.4]),
    np.random.randint(2, 6, 1000),       # historical_claims — moderate
    np.random.uniform(500, 1500, 1000),
    np.random.randint(0, 3, 1000),
    np.random.uniform(30, 365, 1000),
])
med_risk_scores = np.random.uniform(30, 65, 1000)

# HIGH RISK scenarios (500 samples)
high_risk = np.column_stack([
    np.random.uniform(70, 150, 500),     # rain_mm — heavy
    np.random.uniform(350, 500, 500),    # aqi — hazardous
    np.random.uniform(44, 52, 500),      # temperature — extreme
    np.random.uniform(0.1, 0.3, 500),    # traffic_ratio — severe jam
    np.random.randint(0, 24, 500),
    np.random.choice([0, 1], 500, p=[0.5, 0.5]),
    np.random.randint(5, 15, 500),       # historical_claims — high
    np.random.uniform(500, 1500, 500),
    np.random.randint(0, 3, 500),
    np.random.uniform(30, 365, 500),
])
high_risk_scores = np.random.uniform(65, 100, 500)

X = np.vstack([low_risk, med_risk, high_risk])
y = np.concatenate([low_risk_scores, med_risk_scores, high_risk_scores])

# Shuffle
indices = np.random.permutation(len(X))
X = X[indices]
y = y[indices]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── Train Gradient Boosting Regressor ─────────────────────────────
model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    random_state=42
)

print("[ML] Training risk scoring model...")
model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n" + "="*60)
print("RISK SCORING MODEL — EVALUATION")
print("="*60)
print(f"Mean Absolute Error : {mae:.2f}")
print(f"R² Score            : {r2:.4f}")

# Feature importance
feature_names = [
    'rain_mm', 'aqi', 'temperature', 'traffic_ratio',
    'hour_of_day', 'is_weekend', 'historical_claims',
    'avg_daily_income', 'policy_type', 'user_age_days'
]
importances = model.feature_importances_
print("\nFeature Importances:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name:20s} : {imp:.4f}")

# ── Save model ─────────────────────────────────────────────────────
with open('risk_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n[OK] risk_model.pkl saved successfully")
print("="*60)
