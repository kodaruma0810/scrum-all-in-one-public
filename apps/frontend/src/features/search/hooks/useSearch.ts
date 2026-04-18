import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchResults } from '../types';

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      const res = await api.get<{ data: SearchResults }>('/search', { params: { q } });
      return res.data.data;
    },
    enabled: q.trim().length >= 1,
    staleTime: 30_000,
  });
}
