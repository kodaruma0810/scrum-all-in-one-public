import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BurndownDataPoint } from '../types';

interface BurndownChartProps {
  data: BurndownDataPoint[];
  sprintId?: string;
}

export default function BurndownChart({ data, sprintId }: BurndownChartProps) {
  if (!sprintId || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-[var(--radius-md)] border border-dashed border-border">
        <p className="text-sm text-muted-foreground">データなし</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: string) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(label: string) => `日付: ${label}`}
            formatter={(value: number, name: string) => [
              value,
              name === 'ideal' ? '理想' : '実績',
            ]}
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
          />
          <Legend
            formatter={(value: string) => (value === 'ideal' ? '理想' : '実績')}
            wrapperStyle={{ color: 'rgba(255,255,255,0.4)' }}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="rgba(255,255,255,0.25)"
            strokeDasharray="5 5"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="rgba(255,255,255,0.6)"
            dot={{ r: 3 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
