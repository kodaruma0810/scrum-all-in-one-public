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
import { useBurndownData } from '@/features/tickets/hooks/useTickets';

interface BurndownChartProps {
  sprintId: string;
}

export default function BurndownChart({ sprintId }: BurndownChartProps) {
  const { data, isLoading } = useBurndownData(sprintId);

  if (isLoading) {
    return <div className="h-48 bg-muted animate-pulse rounded-[var(--radius-sm)]" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        バーンダウンデータがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'SP', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: 'rgba(255,255,255,0.25)' } }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            value,
            name === 'ideal' ? '理想' : '実績',
          ]}
          labelFormatter={(label: string) => {
            const d = new Date(label);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.8)',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
        />
        <Legend
          formatter={(value) => (value === 'ideal' ? '理想線' : '実績線')}
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
  );
}
