# DeliverGuard AI — API Documentation

## Base URL
`http://localhost:5000/api`

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register worker |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |

## User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get profile |
| PUT | `/user/profile` | Update profile |
| GET | `/user/policies` | Get user policies |

## Policy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get available plans |
| POST | `/policy/select` | Select a plan |
| GET | `/policy/active` | Get active policy |
| POST | `/policy/cancel` | Cancel policy |

## Claims

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/claims` | Get user claims |
| POST | `/claims/create` | Create claim |

## Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/monitoring/live` | Get live risk data |

## Payout

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payout/initiate` | Initiate payout |
| GET | `/payout/status` | Get payout status |

## Admin (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/policies` | All policies |
| GET | `/admin/claims` | All claims |
| GET | `/admin/fraud-alerts` | Fraud alerts |
| GET | `/admin/analytics` | Analytics data |

## AI (Future)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/risk-score` | Get ML risk score |
