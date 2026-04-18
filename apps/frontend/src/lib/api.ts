import axios from 'axios';
import { useAuthStore } from './auth';
import { useTeamStore } from './teamStore';

// VITE_API_URL が設定されていればバックエンドのベースURL（例: https://scrum-backend-xxx.onrender.com）
// 未設定なら開発時の Vite プロキシ経由（相対パス）
export const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const teamId = useTeamStore.getState().currentTeamId;
  if (teamId) {
    config.headers['X-Team-Id'] = teamId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().accessToken;
      // dev-token はUI確認用の偽トークンなのでログアウトしない
      if (token !== 'dev-token') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
