'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponseDistributionChartProps {
  data: Record<string, number>;
  title?: string;
}

export function ResponseDistributionChart({ data, title }: ResponseDistributionChartProps) {
  const chartData = Object.entries(data).map(([answer, count]) => ({
    answer: answer.replace(/"/g, '').substring(0, 20),
    count,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="answer" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" name="Responses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

