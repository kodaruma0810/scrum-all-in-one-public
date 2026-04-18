import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardSummary } from '../types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardSummary }>('/dashboard/summary');
      return res.data.data;
    },
    refetchInterval: 60_000,
  });
}
