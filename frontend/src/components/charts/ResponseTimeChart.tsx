'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponseTimeChartProps {
  data: Array<{ questionNumber: number; avgTime: number; fastestTime?: number; slowestTime?: number }>;
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="questionNumber" label={{ value: 'Question', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgTime" fill="#3b82f6" name="Avg Time" />
          {data[0]?.fastestTime !== undefined && (
            <Bar dataKey="fastestTime" fill="#22c55e" name="Fastest" />
          )}
          {data[0]?.slowestTime !== undefined && (
            <Bar dataKey="slowestTime" fill="#ef4444" name="Slowest" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

