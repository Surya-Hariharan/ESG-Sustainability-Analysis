import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

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

export interface HighControversyCompany {
  symbol: string;
  name: string;
  controversy_score: number;
  controversy_level: string;
}

export interface ESGPredictionRequest {
  environment_risk_score: number;
  social_risk_score: number;
  governance_risk_score: number;
  controversy_score: number;
  full_time_employees: number;
}

export interface ESGPredictionResponse {
  risk_level: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface BatchPredictionRequest {
  items: ESGPredictionRequest[];
}

export interface BatchPredictionResponse {
  predictions: ESGPredictionResponse[];
  count: number;
}

export interface ModelInfo {
  status: string;
  type: string;
  device: string;
  classes: string[];
  features: string[];
  metadata: Record<string, any>;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  database: {
    status: string;
    database: string;
  };
  cache: {
    status: string;
  };
}

class ApiClient {
  private client: AxiosInstance;
  private requestQueue: Map<string, AbortController>;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.requestQueue = new Map();

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const requestId = `${config.method}-${config.url}`;
        this.requestQueue.set(requestId, new AbortController());
        config.signal = this.requestQueue.get(requestId)?.signal;
        
        if (config.headers) {
          config.headers['X-Request-ID'] = crypto.randomUUID();
          config.headers['X-Timestamp'] = new Date().toISOString();
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        const requestId = `${response.config.method}-${response.config.url}`;
        this.requestQueue.delete(requestId);
        return response;
      },
      async (error: AxiosError) => {
        const requestId = `${error.config?.method}-${error.config?.url}`;
        this.requestQueue.delete(requestId);

        if (error.code === 'ECONNABORTED') {
          console.error('Request timeout:', error.config?.url);
        }

        const config = error.config as ApiConfig;
        if (config && config.retry && config.retry > 0) {
          config.retry -= 1;
          const delay = config.retryDelay || 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  public cancelRequest(method: string, url: string): void {
    const requestId = `${method}-${url}`;
    const controller = this.requestQueue.get(requestId);
    if (controller) {
      controller.abort();
      this.requestQueue.delete(requestId);
    }
  }

  public cancelAllRequests(): void {
    this.requestQueue.forEach((controller) => controller.abort());
    this.requestQueue.clear();
  }

  private async request<T>(config: ApiConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.detail || error.message);
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        }
      }
      throw error;
    }
  }

  async getTopCompanies(limit: number = 10): Promise<Company[]> {
    return this.request<Company[]>({
      method: 'GET',
      url: '/analytics/companies/top',
      params: { limit },
      retry: 2,
    });
  }

  async getSectorAverages(): Promise<SectorAverage[]> {
    return this.request<SectorAverage[]>({
      method: 'GET',
      url: '/analytics/sectors/average',
      retry: 2,
    });
  }

  async getHighControversyCompanies(minScore: number = 50): Promise<HighControversyCompany[]> {
    return this.request<HighControversyCompany[]>({
      method: 'GET',
      url: '/analytics/companies/high-controversy',
      params: { min_score: minScore },
      retry: 2,
    });
  }

  async getCompanyDetail(symbol: string): Promise<CompanyDetail> {
    return this.request<CompanyDetail>({
      method: 'GET',
      url: `/analytics/companies/${encodeURIComponent(symbol)}`,
      retry: 2,
    });
  }

  async searchCompanies(
    query: string,
    sector?: string,
    limit: number = 20
  ): Promise<Company[]> {
    return this.request<Company[]>({
      method: 'GET',
      url: '/analytics/companies/search',
      params: { q: query, sector, limit },
      retry: 1,
    });
  }

  async predictRisk(request: ESGPredictionRequest): Promise<ESGPredictionResponse> {
    return this.request<ESGPredictionResponse>({
      method: 'POST',
      url: '/predict',
      data: request,
      retry: 1,
    });
  }

  async predictBatch(request: BatchPredictionRequest): Promise<BatchPredictionResponse> {
    return this.request<BatchPredictionResponse>({
      method: 'POST',
      url: '/predict/batch',
      data: request,
      retry: 1,
    });
  }

  async getModelInfo(): Promise<ModelInfo> {
    return this.request<ModelInfo>({
      method: 'GET',
      url: '/predict/model/info',
      retry: 2,
    });
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return this.request<HealthStatus>({
      method: 'GET',
      url: '/health',
      retry: 0,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
