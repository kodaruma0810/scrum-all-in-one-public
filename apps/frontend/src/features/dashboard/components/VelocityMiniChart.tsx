import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VelocityEntry } from '../types';
import { useTerms } from '@/hooks/useTerms';

interface Props {
  data: VelocityEntry[];
}

export default function VelocityMiniChart({ data }: Props) {
  const t = useTerms();
  const chartData = data.map((entry) => ({
    name: entry.sprintName.length > 10 ? entry.sprintName.slice(-8) : entry.sprintName,
    velocity: entry.velocity ?? 0,
  }));

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card px-6 py-6">
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-5">
        ベロシティ推移
        {data.length > 0 && <span className="ml-2 font-normal normal-case text-muted-foreground/50">過去 {data.length} {t('sprint')}</span>}
      </p>
      {data.length === 0 ? (
        <p className="text-muted-foreground/70 text-sm">{`完了済み${t('sprint')}がありません`}</p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
              }}
              formatter={(value: number) => [`${value} SP`, 'ベロシティ']}
              labelFormatter={(label) => `Sprint: ${label}`}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="velocity" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === chartData.length - 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
