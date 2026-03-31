# DeliverGuard AI

AI-powered parametric insurance platform protecting gig delivery workers from income loss caused by external disruptions.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Router, Recharts, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Payments**: Razorpay (test mode)
- **APIs**: OpenWeather, WAQI (AQI), TomTom Traffic

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB
- API keys (see `.env.example`)

### Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Running the App

```bash
# From root — runs both frontend and backend
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## Project Structure

```
DeliverGuard-AI/
├── frontend/        # React + Vite app
├── backend/         # Node.js + Express API
├── shared/          # Shared constants
├── docs/            # Architecture & API docs
├── .env.example
└── package.json
```

## Disruption Triggers

| Type | Condition |
|------|-----------|
| Heavy Rain | Rain > 50 mm/hr |
| Extreme Heat | Temp > 42°C |
| AQI Hazard | AQI > 300 |
| Traffic Jam | Speed ratio < 0.4 |

## Insurance Plans

| Plan | Premium | Daily Coverage |
|------|---------|----------------|
| Basic | ₹15/week | ₹500 |
| Standard | ₹25/week | ₹1000 |
| Premium | ₹40/week | ₹2000 |
