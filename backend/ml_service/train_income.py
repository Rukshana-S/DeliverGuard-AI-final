"""
Income Prediction Model for DeliverGuard AI

Predicts: expected weekly income

Features:
  1. avg_past_income     : average of last 4 weeks
  2. last_week_income    : most recent week
  3. trend               : (last_week - avg_past) / avg_past
  4. day_of_week         : 0=Mon, 6=Sun
  5. is_weekend          : 0 or 1
  6. month               : 1-12
  7. is_monsoon          : 1 if Jun-Sep, else 0
  8. rain_forecast       : predicted rain mm/hr
  9. aqi_forecast        : predicted AQI
  10. user_age_days      : days since registration
  11. historical_claims  : total past claims
  12. policy_type        : 0=basic, 1=standard, 2=premium

Target:
  - predicted_income: expected weekly income in ₹
"""

import numpy as np
import pickle
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

np.random.seed(42)
N = 3000

# ── Generate synthetic training data ──────────────────────────────

# Base income patterns
base_income = np.random.uniform(3000, 10000, N)

# Trend effect (-20% to +20%)
trend = np.random.uniform(-0.2, 0.2, N)

# Day of week effect (weekends slightly lower)
day_of_week = np.random.randint(0, 7, N)
is_weekend = (day_of_week >= 5).astype(int)
weekend_penalty = is_weekend * np.random.uniform(-500, 0, N)

# Month/season effect
month = np.random.randint(1, 13, N)
is_monsoon = ((month >= 6) & (month <= 9)).astype(int)
monsoon_penalty = is_monsoon * np.random.uniform(-800, -200, N)

# Weather impact
rain_forecast = np.random.uniform(0, 100, N)
rain_penalty = np.where(rain_forecast > 50, -rain_forecast * 5, 0)

aqi_forecast = np.random.uniform(0, 500, N)
aqi_penalty = np.where(aqi_forecast > 300, -(aqi_forecast - 300) * 2, 0)

# User experience boost
user_age_days = np.random.uniform(1, 365, N)
experience_boost = np.where(user_age_days > 90, 500, 0)

# Claims history (more claims = less work time)
historical_claims = np.random.randint(0, 15, N)
claims_penalty = historical_claims * -50

# Policy type (premium users work more consistently)
policy_type = np.random.randint(0, 3, N)
policy_boost = policy_type * 200

# Calculate target income
avg_past_income = base_income
last_week_income = base_income * (1 + trend)

predicted_income = (
    last_week_income +
    weekend_penalty +
    monsoon_penalty +
    rain_penalty +
    aqi_penalty +
    experience_boost +
    claims_penalty +
    policy_boost +
    np.random.normal(0, 300, N)  # noise
)

# Clip to realistic range
predicted_income = np.clip(predicted_income, 1000, 15000)

# Build feature matrix
X = np.column_stack([
    avg_past_income,
    last_week_income,
    trend,
    day_of_week,
    is_weekend,
    month,
    is_monsoon,
    rain_forecast,
    aqi_forecast,
    user_age_days,
    historical_claims,
    policy_type,
])

y = predicted_income

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── Train Gradient Boosting Regressor ─────────────────────────────
model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    random_state=42
)

print("[ML] Training income prediction model...")
model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n" + "="*60)
print("INCOME PREDICTION MODEL — EVALUATION")
print("="*60)
print(f"Mean Absolute Error  : Rs.{mae:.2f}")
print(f"Root Mean Squared Error : Rs.{rmse:.2f}")
print(f"R² Score             : {r2:.4f}")

# Feature importance
feature_names = [
    'avg_past_income', 'last_week_income', 'trend', 'day_of_week',
    'is_weekend', 'month', 'is_monsoon', 'rain_forecast',
    'aqi_forecast', 'user_age_days', 'historical_claims', 'policy_type'
]
importances = model.feature_importances_
print("\nFeature Importances:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name:20s} : {imp:.4f}")

# Sample predictions
print("\nSample Predictions:")
print(f"{'Actual':>10s}  {'Predicted':>10s}  {'Error':>10s}")
for i in range(5):
    actual = y_test.iloc[i] if hasattr(y_test, 'iloc') else y_test[i]
    pred = y_pred[i]
    error = abs(actual - pred)
    print(f"Rs.{actual:>8.0f}  Rs.{pred:>8.0f}  Rs.{error:>8.0f}")

# ── Save model ─────────────────────────────────────────────────────
with open('income_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n[OK] income_model.pkl saved successfully")
print("="*60)
