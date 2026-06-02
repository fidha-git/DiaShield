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

function HealthTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0F2FE',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#0F172A',
        minWidth: '180px',
        boxShadow: '0 4px 24px rgba(14,165,233,0.08)',
      }}
    >
      <p style={{ color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{d.date}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span><span style={{ color: '#0EA5E9' }}>Blood Sugar:</span> {d.glucose} mg/dL</span>
        {d.blood_pressure && d.blood_pressure !== 'N/A' && (
          <span><span style={{ color: '#6366f1' }}>Blood Pressure:</span> {d.blood_pressure}</span>
        )}
        {d.heart_rate && d.heart_rate !== 'N/A' && (
          <span><span style={{ color: '#f472b6' }}>Heart Rate:</span> {d.heart_rate} bpm</span>
        )}
        {d.bmi && d.bmi !== 'N/A' && (
          <span><span style={{ color: '#22c55e' }}>BMI:</span> {d.bmi}</span>
        )}
      </div>
    </div>
  );
}

export default function HealthTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">No Health Records Available</span>
      </div>
    );
  }

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
          <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#E0F2FE' }}
            tickLine={false}
            height={40}
            tickMargin={10}
          />
          <YAxis
            allowDecimals={false}
            width={38}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#E0F2FE' }}
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
            stroke="#0EA5E9"
            strokeWidth={2.5}
            dot={<Dot r={4} fill="#0EA5E9" stroke="#FFFFFF" strokeWidth={2} />}
            activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
