'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CorrectnessChartProps {
  correct: number;
  incorrect: number;
  unanswered?: number;
}

const COLORS = {
  correct: '#22c55e',
  incorrect: '#ef4444',
  unanswered: '#94a3b8',
};

export function CorrectnessChart({ correct, incorrect, unanswered = 0 }: CorrectnessChartProps) {
  const data = [
    { name: 'Correct', value: correct, color: COLORS.correct },
    { name: 'Incorrect', value: incorrect, color: COLORS.incorrect },
  ];

  if (unanswered > 0) {
    data.push({ name: 'Unanswered', value: unanswered, color: COLORS.unanswered });
  }

  const total = correct + incorrect + unanswered;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-4xl font-bold">{percentage}%</p>
        <p className="text-sm text-muted-foreground">Accuracy</p>
      </div>
    </div>
  );
}

