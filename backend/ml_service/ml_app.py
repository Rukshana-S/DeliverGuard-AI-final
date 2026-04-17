import pickle
import numpy as np
from flask import Flask, request, jsonify
from pathlib import Path
from datetime import datetime

app = Flask(__name__)

BASE = Path(__file__).parent

# Load all 4 models
with open(BASE / 'model.pkl', 'rb') as f:
    fraud_model = pickle.load(f)

with open(BASE / 'risk_model.pkl', 'rb') as f:
    risk_model = pickle.load(f)

with open(BASE / 'approval_model.pkl', 'rb') as f:
    approval_model = pickle.load(f)

with open(BASE / 'income_model.pkl', 'rb') as f:
    income_model = pickle.load(f)

print("[ML] All 4 models loaded successfully", flush=True)

DISRUPTION_ENC = {
    'heavy_rain':   0,
    'extreme_heat': 1,
    'aqi_hazard':   2,
    'traffic_jam':  3,
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'DeliverGuard ML (4 Models)', 'port': 5002})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        body = request.get_json(force=True)

        disruption_value    = float(body.get('disruption_value',    65))
        claims_last_24h     = int(body.get('claims_last_24h',        0))
        claims_last_7d      = int(body.get('claims_last_7d',         0))
        claim_amount        = float(body.get('claim_amount',         0))
        avg_daily_income    = float(body.get('avg_daily_income',   500))
        disruption_type     = body.get('disruption_type', 'heavy_rain')
        disruption_type_enc = DISRUPTION_ENC.get(disruption_type, 0)
        user_age_days       = float(body.get('user_age_days',       90))

        # Derived features
        claim_to_income_ratio = (claim_amount / avg_daily_income) if avg_daily_income > 0 else 0
        now = datetime.now()
        hour_of_day = now.hour
        is_weekend  = 1 if now.weekday() >= 5 else 0

        features = np.array([[
            disruption_value,
            claims_last_24h,
            claims_last_7d,
            claim_amount,
            avg_daily_income,
            disruption_type_enc,
            claim_to_income_ratio,
            hour_of_day,
            is_weekend,
            user_age_days,
        ]])

        prob       = fraud_model.predict_proba(features)[0][1]
        risk_score = round(prob * 100, 2)
        label      = 'high' if prob > 0.6 else 'medium' if prob > 0.35 else 'low'

        print(f"[ML] score={risk_score} label={label} ratio={claim_to_income_ratio:.2f} hour={hour_of_day}", flush=True)

        return jsonify({
            'riskScore':    float(risk_score),
            'label':        label,
            'isSuspicious': bool(prob > 0.6),
            'details': {
                'claimToIncomeRatio': round(claim_to_income_ratio, 2),
                'hourOfDay':          hour_of_day,
                'isWeekend':          bool(is_weekend),
            }
        })

    except Exception as e:
        print(f"[ML ERROR] {e}", flush=True)
        return jsonify({'riskScore': 0, 'label': 'low', 'isSuspicious': False}), 200

@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    try:
        body = request.get_json(force=True)

        rain_mm           = float(body.get('rain_mm',           0))
        aqi               = float(body.get('aqi',               0))
        temperature       = float(body.get('temperature',       30))
        traffic_ratio     = float(body.get('traffic_ratio',     1.0))
        historical_claims = int(body.get('historical_claims',   0))
        avg_daily_income  = float(body.get('avg_daily_income',  500))
        policy_type       = int(body.get('policy_type',         0))   # 0=basic,1=standard,2=premium
        user_age_days     = float(body.get('user_age_days',     90))

        now        = datetime.now()
        hour       = now.hour
        is_weekend = 1 if now.weekday() >= 5 else 0

        features = np.array([[
            rain_mm, aqi, temperature, traffic_ratio,
            hour, is_weekend, historical_claims,
            avg_daily_income, policy_type, user_age_days
        ]])

        raw_score  = float(risk_model.predict(features)[0])
        risk_score = round(max(0, min(100, raw_score)), 2)
        severity   = 'critical' if risk_score >= 75 else 'high' if risk_score >= 50 else 'medium' if risk_score >= 25 else 'low'
        claim_prob = round(risk_score / 100, 2)

        # Estimate payout based on risk and income
        expected_payout = round((claim_prob * avg_daily_income * 0.8), 2) if risk_score >= 50 else 0

        print(f"[RISK] score={risk_score} severity={severity} claim_prob={claim_prob} payout={expected_payout}", flush=True)

        return jsonify({
            'riskScore':      risk_score,
            'severity':       severity,
            'claimProbability': claim_prob,
            'expectedPayout': expected_payout,
            'shouldTriggerClaim': bool(risk_score >= 50),
        })

    except Exception as e:
        print(f"[RISK ERROR] {e}", flush=True)
        return jsonify({'riskScore': 0, 'severity': 'low', 'claimProbability': 0, 'expectedPayout': 0, 'shouldTriggerClaim': False}), 200


@app.route('/predict-approval', methods=['POST'])
def predict_approval():
    try:
        body = request.get_json(force=True)

        fraud_score           = float(body.get('fraud_score',           0))
        risk_score            = float(body.get('risk_score',            0))
        claim_amount          = float(body.get('claim_amount',          0))
        avg_daily_income      = float(body.get('avg_daily_income',    500))
        historical_claims     = int(body.get('historical_claims',       0))
        approval_rate         = float(body.get('approval_rate',       1.0))
        user_age_days         = float(body.get('user_age_days',        90))
        policy_type           = int(body.get('policy_type',             0))
        disruption_severity   = int(body.get('disruption_severity',     2))

        claim_to_income_ratio = (claim_amount / avg_daily_income) if avg_daily_income > 0 else 0

        features = np.array([[
            fraud_score, risk_score, claim_amount, avg_daily_income,
            claim_to_income_ratio, historical_claims, approval_rate,
            user_age_days, policy_type, disruption_severity
        ]])

        decision_code = int(approval_model.predict(features)[0])
        probabilities = approval_model.predict_proba(features)[0]
        confidence    = round(float(max(probabilities)) * 100, 2)

        decision_map = {0: 'approve', 1: 'investigate', 2: 'reject'}
        decision = decision_map[decision_code]

        print(f"[APPROVAL] decision={decision} confidence={confidence}% fraud={fraud_score} risk={risk_score}", flush=True)

        return jsonify({
            'decision':    decision,
            'confidence':  confidence,
            'probabilities': {
                'approve':     round(float(probabilities[0]) * 100, 2),
                'investigate': round(float(probabilities[1]) * 100, 2),
                'reject':      round(float(probabilities[2]) * 100, 2),
            }
        })

    except Exception as e:
        print(f"[APPROVAL ERROR] {e}", flush=True)
        return jsonify({'decision': 'investigate', 'confidence': 0}), 200


@app.route('/predict-income', methods=['POST'])
def predict_income():
    try:
        body = request.get_json(force=True)

        avg_past_income    = float(body.get('avg_past_income',    5000))
        last_week_income   = float(body.get('last_week_income',   5000))
        rain_forecast      = float(body.get('rain_forecast',         0))
        aqi_forecast       = float(body.get('aqi_forecast',          0))
        user_age_days      = float(body.get('user_age_days',        90))
        historical_claims  = int(body.get('historical_claims',       0))
        policy_type        = int(body.get('policy_type',             0))

        trend = ((last_week_income - avg_past_income) / avg_past_income) if avg_past_income > 0 else 0

        now        = datetime.now()
        day_of_week = now.weekday()
        is_weekend  = 1 if day_of_week >= 5 else 0
        month       = now.month
        is_monsoon  = 1 if 6 <= month <= 9 else 0

        features = np.array([[
            avg_past_income, last_week_income, trend, day_of_week,
            is_weekend, month, is_monsoon, rain_forecast,
            aqi_forecast, user_age_days, historical_claims, policy_type
        ]])

        predicted = float(income_model.predict(features)[0])
        predicted_income = round(max(1000, min(15000, predicted)), 2)

        print(f"[INCOME] predicted={predicted_income} last_week={last_week_income} trend={trend:.2f}", flush=True)

        return jsonify({
            'predictedIncome': predicted_income,
            'trend':           round(trend * 100, 2),
            'confidence':      'high' if abs(trend) < 0.1 else 'medium' if abs(trend) < 0.3 else 'low',
        })

    except Exception as e:
        print(f"[INCOME ERROR] {e}", flush=True)
        return jsonify({'predictedIncome': 5000, 'trend': 0, 'confidence': 'low'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
