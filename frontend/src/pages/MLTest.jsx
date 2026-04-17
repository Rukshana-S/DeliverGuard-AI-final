import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function MLTest() {
  const [fraudResult, setFraudResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [loading, setLoading] = useState({ fraud: false, risk: false });

  const testFraud = async (scenario) => {
    setLoading({ ...loading, fraud: true });
    try {
      const { data } = await api.post('/monitoring/test-fraud', scenario);
      setFraudResult(data);
    } catch (err) {
      setFraudResult({ error: err.response?.data?.message || 'Failed' });
    } finally {
      setLoading({ ...loading, fraud: false });
    }
  };

  const testRisk = async (scenario) => {
    setLoading({ ...loading, risk: true });
    try {
      const { data } = await api.post('/monitoring/test-risk', scenario);
      setRiskResult(data);
    } catch (err) {
      setRiskResult({ error: err.response?.data?.message || 'Failed' });
    } finally {
      setLoading({ ...loading, risk: false });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">ML Models Testing</h1>
        <p className="text-gray-500 mt-2">Test Fraud Detection and Risk Scoring models</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* FRAUD DETECTION */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Fraud Detection</h2>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => testFraud({
                disruption_value: 65,
                claims_last_24h: 0,
                claims_last_7d: 1,
                claim_amount: 300,
                avg_daily_income: 500,
                disruption_type: 'heavy_rain',
                user_age_days: 90,
              })}
              disabled={loading.fraud}
              className="w-full py-2.5 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              ✅ Test Legitimate Claim
            </button>

            <button
              onClick={() => testFraud({
                disruption_value: 35,
                claims_last_24h: 5,
                claims_last_7d: 12,
                claim_amount: 2000,
                avg_daily_income: 300,
                disruption_type: 'heavy_rain',
                user_age_days: 3,
              })}
              disabled={loading.fraud}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              🚨 Test Fraudulent Claim
            </button>
          </div>

          {loading.fraud && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Analyzing...</p>
            </div>
          )}

          {fraudResult && !loading.fraud && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${
                fraudResult.error
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                  : fraudResult.isSuspicious
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
              }`}
            >
              {fraudResult.error ? (
                <p className="text-red-600 dark:text-red-400 font-medium">{fraudResult.error}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
                    <span className="text-2xl font-bold">{fraudResult.riskScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Label</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      fraudResult.label === 'high' ? 'bg-red-200 text-red-800' :
                      fraudResult.label === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>{fraudResult.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Suspicious</span>
                    <span className="font-bold">{fraudResult.isSuspicious ? '🚨 YES' : '✅ NO'}</span>
                  </div>
                  {fraudResult.details && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Claim/Income Ratio</span>
                        <span className="font-mono">{fraudResult.details.claimToIncomeRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Hour of Day</span>
                        <span className="font-mono">{fraudResult.details.hourOfDay}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* RISK SCORING */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Risk Scoring</h2>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => testRisk({
                rain_mm: 10,
                aqi: 100,
                temperature: 30,
                traffic_ratio: 0.8,
                historical_claims: 1,
                avg_daily_income: 800,
                policy_type: 1,
                user_age_days: 120,
              })}
              disabled={loading.risk}
              className="w-full py-2.5 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              ☀️ Test Low Risk (Good Weather)
            </button>

            <button
              onClick={() => testRisk({
                rain_mm: 80,
                aqi: 350,
                temperature: 45,
                traffic_ratio: 0.25,
                historical_claims: 2,
                avg_daily_income: 800,
                policy_type: 1,
                user_age_days: 120,
              })}
              disabled={loading.risk}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              🌧️ Test High Risk (Severe Weather)
            </button>
          </div>

          {loading.risk && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Calculating...</p>
            </div>
          )}

          {riskResult && !loading.risk && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${
                riskResult.error
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                  : riskResult.severity === 'critical' || riskResult.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                  : riskResult.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
              }`}
            >
              {riskResult.error ? (
                <p className="text-red-600 dark:text-red-400 font-medium">{riskResult.error}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
                    <span className="text-2xl font-bold">{riskResult.riskScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Severity</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      riskResult.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      riskResult.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                      riskResult.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>{riskResult.severity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Claim Probability</span>
                    <span className="font-bold">{(riskResult.claimProbability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expected Payout</span>
                    <span className="font-bold">₹{riskResult.expectedPayout}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-Trigger Claim</span>
                    <span className="font-bold">{riskResult.shouldTriggerClaim ? '✅ YES' : '❌ NO'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-2">How to test:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Fraud Detection:</strong> Tests if a claim is suspicious based on user behavior</li>
              <li><strong>Risk Scoring:</strong> Predicts disruption risk based on weather/traffic conditions</li>
              <li>Both models run on <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">localhost:5002</code></li>
              <li>Results update in real-time from the ML service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
