# DeliverGuard AI — Architecture

## System Overview

```
[React Frontend] <---> [Express Backend] <---> [MongoDB]
                              |
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       [OpenWeather]       [WAQI]        [TomTom]
                              |
                    [Razorpay Payments]
                              |
                  [Python ML Microservice] (future)
```

## Backend Architecture (MVC)

- **Routes** → define API endpoints
- **Controllers** → handle request/response logic
- **Services** → business logic, external API calls
- **Models** → Mongoose schemas
- **Middleware** → auth, error handling
- **Cron** → scheduled risk monitoring every 5 minutes

## Risk Engine Flow

1. Cron job fetches Weather, AQI, Traffic data every 5 min
2. Checks against thresholds in `shared/constants/riskThresholds.js`
3. If disruption detected → creates `RiskEvent`
4. Finds workers in affected zone with active policy
5. Auto-creates `Claim` → calculates income loss → initiates payout

## Income Loss Formula

```
expectedIncome = avgDailyIncome * workingHoursFactor
incomeLoss = expectedIncome * disruptionSeverity
```

## Future ML Integration

POST `/ai/risk-score` → Python microservice
- Input: zone, weather history, AQI trends, traffic data
- Output: risk score, recommended premium
