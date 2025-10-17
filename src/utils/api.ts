const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export const apiClient = {
  get: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: 'Request failed', status: 500 };
    }
  },
  
  post: async <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: 'Request failed', status: 500 };
    }
  },
  
  put: async <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: 'Request failed', status: 500 };
    }
  },
  
  delete: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: 'Request failed', status: 500 };
    }
  },
};
