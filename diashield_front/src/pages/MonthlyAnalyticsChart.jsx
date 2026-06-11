import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';

// Custom tooltip: month, avg blood sugar, record count
function AnalyticsTooltip({ active, payload, label }) {
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
        color: '#0F172A',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{ color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{d.month}</p>
      <p><span style={{ color: '#0EA5E9' }}>Avg Blood Sugar:</span> {d.avg_blood_sugar} mg/dL</p>
      <p><span style={{ color: '#94a3b8' }}>Records:</span> {d.record_count}</p>
    </div>
  );
}

export default function MonthlyAnalyticsChart({ data }) {
const monthlyRecords = Array.isArray(data)
    ? data
        .filter((item) => item && typeof item.month === 'string')
        .map((item) => ({
          month: item.month,
          avg_blood_sugar: Number(item.avg_blood_sugar) || 0,
          record_count: Number(item.record_count) || 0,
        }))
    : [];
if (!monthlyRecords.length) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center overflow-hidden">
        <span className="text-on-surface-variant font-label-md">No analytics data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[250px] max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyRecords}
          margin={{ top: 24, right: 20, left: 0, bottom: 30 }}
          barCategoryGap={monthlyRecords.length === 1 ? '75%' : '30%'}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            height={44}
            tickMargin={10}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#E0F2FE' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            width={38}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#E0F2FE' }}
            tickLine={false}
            domain={[0, 'auto']}
            label={{
              value: 'mg/dL',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fill: '#64748b', fontSize: 10 },
            }}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar
            dataKey="avg_blood_sugar"
            fill="#0EA5E9"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
            barSize={monthlyRecords.length === 1 ? 56 : 32}
          >
            <LabelList
              dataKey="avg_blood_sugar"
              position="top"
              style={{ fontSize: 11, fill: '#94a3b8' }}
              formatter={(v) => `${v}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

