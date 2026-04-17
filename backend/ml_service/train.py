"""
Enhanced Fraud Detection Model for DeliverGuard AI

Features:
  1. disruption_value      : rain mm / AQI / temp / traffic ratio
  2. claims_last_24h       : duplicate claim count
  3. claims_last_7d        : weekly claim frequency
  4. claim_amount          : payout requested
  5. avg_daily_income      : user's declared income
  6. disruption_type_enc   : encoded disruption type (0-3)
  7. claim_to_income_ratio : claim_amount / avg_daily_income
  8. hour_of_day           : claim submission hour (0-23)
  9. is_weekend            : 1 if weekend, 0 if weekday
  10. user_age_days        : days since user registration

Target:
  - is_fraud (1 = suspicious, 0 = legitimate)
"""

import numpy as np
import pickle
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

np.random.seed(42)

# ── Generate 3000 samples ──────────────────────────────────────────

# LEGITIMATE CLAIMS (2400 samples — 80%)
legit = np.column_stack([
    np.random.uniform(55, 150, 2400),    # disruption_value — clearly above threshold
    np.random.choice([0, 1], 2400, p=[0.7, 0.3]),  # claims_last_24h — mostly 0
    np.random.randint(0, 4, 2400),       # claims_last_7d — low frequency
    np.random.uniform(200, 900, 2400),   # claim_amount — reasonable
    np.random.uniform(500, 1500, 2400),  # avg_daily_income — normal range
    np.random.randint(0, 4, 2400),       # disruption_type_enc
    np.random.uniform(0.2, 0.8, 2400),   # claim_to_income_ratio — reasonable
    np.random.randint(6, 22, 2400),      # hour_of_day — normal working hours
    np.random.choice([0, 1], 2400, p=[0.7, 0.3]),  # is_weekend
    np.random.uniform(30, 365, 2400),    # user_age_days — established users
])
legit_labels = np.zeros(2400)

# FRAUDULENT CLAIMS (600 samples — 20%)
fraud = np.column_stack([
    np.random.uniform(30, 60, 600),      # disruption_value — barely above threshold
    np.random.randint(2, 10, 600),       # claims_last_24h — many duplicates
    np.random.randint(5, 20, 600),       # claims_last_7d — abnormal frequency
    np.random.uniform(800, 2500, 600),   # claim_amount — inflated
    np.random.uniform(200, 600, 600),    # avg_daily_income — low income, high claim
    np.random.randint(0, 4, 600),        # disruption_type_enc
    np.random.uniform(1.2, 4.0, 600),    # claim_to_income_ratio — suspicious ratio
    np.random.choice([0, 1, 2, 3, 22, 23], 600),  # hour_of_day — odd hours
    np.random.choice([0, 1], 600, p=[0.3, 0.7]),  # is_weekend — more on weekends
    np.random.uniform(1, 30, 600),       # user_age_days — new accounts
])
fraud_labels = np.ones(600)

X = np.vstack([legit, fraud])
y = np.concatenate([legit_labels, fraud_labels])

# Shuffle
indices = np.random.permutation(len(X))
X = X[indices]
y = y[indices]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# ── Train Gradient Boosting Classifier ────────────────────────────
model = GradientBoostingClassifier(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    random_state=42
)

print("[ML] Training fraud detection model...")
model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print("\n" + "="*60)
print("FRAUD DETECTION MODEL — EVALUATION")
print("="*60)
print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Fraud']))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(f"\nROC-AUC Score: {roc_auc_score(y_test, y_proba):.4f}")

# Feature importance
feature_names = [
    'disruption_value', 'claims_last_24h', 'claims_last_7d',
    'claim_amount', 'avg_daily_income', 'disruption_type_enc',
    'claim_to_income_ratio', 'hour_of_day', 'is_weekend', 'user_age_days'
]
importances = model.feature_importances_
print("\nFeature Importances:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name:25s} : {imp:.4f}")

# ── Save model ─────────────────────────────────────────────────────
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n[✓] model.pkl saved successfully")
print("="*60)
