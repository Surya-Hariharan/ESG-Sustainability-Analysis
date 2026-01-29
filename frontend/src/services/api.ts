/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  total_esg_risk_score: number;
}

export interface CompanyDetail extends Company {
  industry?: string;
  environment_risk_score?: number;
  social_risk_score?: number;
  governance_risk_score?: number;
  controversy_score?: number;
  controversy_level?: string;
  esg_risk_level?: string;
}

export interface SectorAverage {
  sector: string;
  avg_esg_score: number;
  company_count: number;
}

export interface ControversyCompany {
  symbol: string;
  name: string;
  controversy_score: number;
  controversy_level: string;
}

export interface PredictionRequest {
  environment_risk_score: number;
  social_risk_score: number;
  governance_risk_score: number;
  controversy_score: number;
  full_time_employees: number;
}

export interface PredictionResponse {
  risk_level: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  database: { status: string };
  cache: { status: string };
}

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private client: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          status: error.response?.status,
        };

        if (error.response?.data) {
          const data = error.response.data as { detail?: string };
          apiError.message = data.detail || error.message;
        } else if (error.code === 'ECONNABORTED') {
          apiError.message = 'Request timed out. Please try again.';
        } else if (!error.response) {
          apiError.message = 'Unable to connect to server. Please check your connection.';
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getAbortSignal(key: string): AbortSignal {
    this.abortControllers.get(key)?.abort();
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller.signal;
  }

  cancelRequest(key: string): void {
    this.abortControllers.get(key)?.abort();
    this.abortControllers.delete(key);
  }

  async getHealth(): Promise<HealthStatus> {
    const { data } = await this.client.get<HealthStatus>('/health');
    return data;
  }

  async getTopCompanies(limit = 10): Promise<Company[]> {
    const { data } = await this.client.get<Company[]>('/api/analytics/companies/top', {
      params: { limit },
      signal: this.getAbortSignal('topCompanies'),
    });
    return data;
  }

  async getSectorAverages(): Promise<SectorAverage[]> {
    const { data } = await this.client.get<SectorAverage[]>('/api/analytics/sectors/average', {
      signal: this.getAbortSignal('sectorAverages'),
    });
    return data;
  }

  async getControversies(minScore = 50): Promise<ControversyCompany[]> {
    const { data } = await this.client.get<ControversyCompany[]>(
      '/api/analytics/companies/high-controversy',
      {
        params: { min_score: minScore },
        signal: this.getAbortSignal('controversies'),
      }
    );
    return data;
  }

  async getCompanyDetail(symbol: string): Promise<CompanyDetail> {
    const { data } = await this.client.get<CompanyDetail>(
      `/api/analytics/companies/${encodeURIComponent(symbol)}`
    );
    return data;
  }

  async searchCompanies(query: string, limit = 20): Promise<Company[]> {
    const { data } = await this.client.get<Company[]>('/api/analytics/companies/search', {
      params: { q: query, limit },
      signal: this.getAbortSignal('search'),
    });
    return data;
  }

  async predictRisk(request: PredictionRequest): Promise<PredictionResponse> {
    const { data } = await this.client.post<PredictionResponse>('/api/predict', request);
    return data;
  }

  async sendChatMessage(
    message: string,
    company?: string,
    history?: Array<{ role: string; content: string }>
  ): Promise<{ success: boolean; response: string; company?: string; model?: string }> {
    const { data } = await this.client.post('/api/agents/chat', {
      message,
      company,
      history,
    });
    return data;
  }

  async getAgentStatus(): Promise<{ groq_available: boolean; model?: string; status: string }> {
    const { data } = await this.client.get('/api/agents/status');
    return data;
  }
}

export const api = new ApiService();
export default api;

