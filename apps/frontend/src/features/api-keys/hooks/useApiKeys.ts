import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ApiKeyDto {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  key: string;
}

// GET /api/api-keys
export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get<{ data: ApiKeyDto[] }>('/api-keys');
      return res.data.data;
    },
  });
}

// POST /api/api-keys
export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; expiresAt?: string }) => {
      const res = await api.post<{ data: ApiKeyCreatedDto }>('/api-keys', data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

// DELETE /api/api-keys/:id
export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}
