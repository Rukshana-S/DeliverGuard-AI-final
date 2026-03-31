import { useEffect, useState } from 'react';
import api from '../services/api';
import ChartCard from '../components/ChartCard';
import { formatCurrency } from '../utils/helpers';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CITY_RISK = [
  { city: 'Chennai',         risk: 82 },
  { city: 'Coimbatore',      risk: 55 },
  { city: 'Madurai',         risk: 61 },
  { city: 'Trichy',          risk: 48 },
  { city: 'Salem',           risk: 43 },
  { city: 'Tirunelveli',     risk: 38 },
];

const PAYOUT_DIST = [
  { name: 'Heavy Rain',  value: 45 },
  { name: 'Traffic Jam', value: 35 },
  { name: 'AQI Hazard',  value: 15 },
  { name: 'Extreme Heat',value: 5  },
];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Disruption Frequency */}
        <ChartCard title="Disruption Frequency by Type">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.claimsByType?.map((d) => ({
              name: d._id?.replace(/_/g, ' ') || 'Unknown',
              claims: d.count,
              loss: d.total,
            })) || []}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v, n) => n === 'loss' ? formatCurrency(v) : v} />
              <Legend />
              <Bar dataKey="claims" fill="#3b82f6" radius={[4,4,0,0]} name="Claims" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payout Distribution */}
        <ChartCard title="Payout Distribution by Event">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PAYOUT_DIST} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {PAYOUT_DIST.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* City Risk Score */}
        <ChartCard title="City Risk Score — Tamil Nadu">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={CITY_RISK}>
              <PolarGrid />
              <PolarAngleAxis dataKey="city" tick={{ fontSize: 11 }} />
              <Radar name="Risk Score" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Daily Claim Trend */}
        <ChartCard title="Daily Claim Trend (Last 14 Days)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics?.weeklyTrend?.map((d) => ({ date: d._id, count: d.count })) || []}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Claims" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Payout by City */}
      <ChartCard title="Total Payouts by City">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics?.payoutsByCity?.map((d) => ({ city: d._id || 'Unknown', total: d.total })) || []}>
            <XAxis dataKey="city" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="total" radius={[4,4,0,0]} name="Payouts">
              {(analytics?.payoutsByCity || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Plan Distribution */}
      <ChartCard title="Active Policy Plan Distribution">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart layout="vertical"
            data={analytics?.planDist?.map((d) => ({ plan: d._id, count: d.count })) || []}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="plan" type="category" tick={{ fontSize: 11 }} width={70} />
            <Tooltip />
            <Bar dataKey="count" radius={[0,4,4,0]} name="Policies">
              {(analytics?.planDist || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
