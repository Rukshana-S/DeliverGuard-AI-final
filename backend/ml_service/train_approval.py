"""
Claim Auto-Approval Model for DeliverGuard AI

Predicts: approve / investigate / reject

Features:
  1. fraud_score         : 0-100 from fraud detection model
  2. risk_score          : 0-100 from risk scoring model
  3. claim_amount        : payout requested
  4. avg_daily_income    : user's average income
  5. claim_to_income_ratio : claim / income
  6. historical_claims   : total past claims
  7. approval_rate       : % of past claims approved
  8. user_age_days       : days since registration
  9. policy_type         : 0=basic, 1=standard, 2=premium
  10. disruption_severity : 0=low, 1=medium, 2=high, 3=critical

Target:
  - decision: 0=approve, 1=investigate, 2=reject
"""

import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

np.random.seed(42)

# ── Generate 3000 samples ──────────────────────────────────────────

# AUTO-APPROVE (1800 samples — 60%)
approve = np.column_stack([
    np.random.uniform(0, 25, 1800),       # fraud_score — low
    np.random.uniform(50, 100, 1800),     # risk_score — high (real disruption)
    np.random.uniform(200, 800, 1800),    # claim_amount — reasonable
    np.random.uniform(500, 1500, 1800),   # avg_daily_income
    np.random.uniform(0.2, 0.7, 1800),    # claim_to_income_ratio — normal
    np.random.randint(0, 5, 1800),        # historical_claims — low
    np.random.uniform(0.8, 1.0, 1800),    # approval_rate — high
    np.random.uniform(30, 365, 1800),     # user_age_days — established
    np.random.randint(0, 3, 1800),        # policy_type
    np.random.randint(2, 4, 1800),        # disruption_severity — high/critical
])
approve_labels = np.zeros(1800)

# INVESTIGATE (900 samples — 30%)
investigate = np.column_stack([
    np.random.uniform(25, 60, 900),       # fraud_score — medium
    np.random.uniform(40, 70, 900),       # risk_score — medium
    np.random.uniform(600, 1500, 900),    # claim_amount — moderate
    np.random.uniform(400, 1200, 900),    # avg_daily_income
    np.random.uniform(0.6, 1.5, 900),     # claim_to_income_ratio — borderline
    np.random.randint(3, 8, 900),         # historical_claims — moderate
    np.random.uniform(0.5, 0.8, 900),     # approval_rate — mixed
    np.random.uniform(10, 120, 900),      # user_age_days — newer accounts
    np.random.randint(0, 3, 900),
    np.random.randint(1, 3, 900),         # disruption_severity — medium/high
])
investigate_labels = np.ones(900)

# REJECT (300 samples — 10%)
reject = np.column_stack([
    np.random.uniform(60, 100, 300),      # fraud_score — high
    np.random.uniform(0, 50, 300),        # risk_score — low (no real disruption)
    np.random.uniform(1000, 3000, 300),   # claim_amount — inflated
    np.random.uniform(200, 600, 300),     # avg_daily_income — low
    np.random.uniform(1.5, 5.0, 300),     # claim_to_income_ratio — suspicious
    np.random.randint(8, 20, 300),        # historical_claims — excessive
    np.random.uniform(0.0, 0.5, 300),     # approval_rate — low
    np.random.uniform(1, 30, 300),        # user_age_days — very new
    np.random.randint(0, 3, 300),
    np.random.randint(0, 2, 300),         # disruption_severity — low/medium
])
reject_labels = np.full(300, 2)

X = np.vstack([approve, investigate, reject])
y = np.concatenate([approve_labels, investigate_labels, reject_labels])

# Shuffle
indices = np.random.permutation(len(X))
X = X[indices]
y = y[indices]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# ── Train Random Forest Classifier ────────────────────────────────
model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    min_samples_split=5,
    random_state=42
)

print("[ML] Training claim auto-approval model...")
model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────
y_pred = model.predict(X_test)

print("\n" + "="*60)
print("CLAIM AUTO-APPROVAL MODEL — EVALUATION")
print("="*60)
print(classification_report(y_test, y_pred, target_names=['Approve', 'Investigate', 'Reject']))
print("\nConfusion Matrix:")
print("              Approve  Investigate  Reject")
cm = confusion_matrix(y_test, y_pred)
for i, label in enumerate(['Approve', 'Investigate', 'Reject']):
    print(f"{label:12s}  {cm[i][0]:7d}  {cm[i][1]:11d}  {cm[i][2]:7d}")

# Feature importance
feature_names = [
    'fraud_score', 'risk_score', 'claim_amount', 'avg_daily_income',
    'claim_to_income_ratio', 'historical_claims', 'approval_rate',
    'user_age_days', 'policy_type', 'disruption_severity'
]
importances = model.feature_importances_
print("\nFeature Importances:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name:25s} : {imp:.4f}")

# ── Save model ─────────────────────────────────────────────────────
with open('approval_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n[OK] approval_model.pkl saved successfully")
print("="*60)
