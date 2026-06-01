import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
} from 'recharts';

// Custom tooltip showing all health metrics on hover
function HealthTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#0f1f2e',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#f1f5f9',
        minWidth: '180px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{d.date}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span><span style={{ color: '#22d3ee' }}>Blood Sugar:</span> {d.glucose} mg/dL</span>
        {d.blood_pressure && d.blood_pressure !== 'N/A' && (
          <span><span style={{ color: '#818cf8' }}>Blood Pressure:</span> {d.blood_pressure}</span>
        )}
        {d.heart_rate && d.heart_rate !== 'N/A' && (
          <span><span style={{ color: '#f472b6' }}>Heart Rate:</span> {d.heart_rate} bpm</span>
        )}
        {d.bmi && d.bmi !== 'N/A' && (
          <span><span style={{ color: '#34d399' }}>BMI:</span> {d.bmi}</span>
        )}
      </div>
    </div>
  );
}

export default function HealthTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-on-surface-variant font-label-md">No Health Records Available</span>
      </div>
    );
  }

  // Pad single-point data so Recharts can render a visible line
  const chartData = data.length === 1
    ? [{ ...data[0], date: '' }, data[0], { ...data[0], date: '' }]
    : data;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 16, right: 20, left: 0, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            tickLine={false}
            height={40}
            tickMargin={10}
          />
          <YAxis
            allowDecimals={false}
            width={38}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            tickLine={false}
            domain={['auto', 'auto']}
            label={{
              value: 'mg/dL',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fill: '#64748b', fontSize: 10 },
            }}
          />
          <Tooltip content={<HealthTooltip />} />
          <Line
            type="monotone"
            dataKey="glucose"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={<Dot r={4} fill="#22d3ee" stroke="#0f1f2e" strokeWidth={2} />}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0f1f2e', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

