// API service layer for ESG backend communication
const API_BASE_URL = 'http://localhost:8000';

// Types
export interface Company {
  symbol: string;
  name: string;
  sector: string;
  total_esg_risk_score: number;
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
  probability: number;
}

export interface ModelInfo {
  version: number;
  generated_at: string;
  classes: string[];
  features: string[];
  feature_importances: Record<string, number>;
  sklearn_version_runtime: string;
  sklearn_version_trained?: string;
}

export interface HealthStatus {
  status: string;
  database: string;
  model_loaded: boolean;
  version: string;
  sklearn_runtime: string;
}

// API functions
export const apiService = {
  // Health check
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Failed to fetch health status');
    return response.json();
  },

  // Companies
  async getTopCompanies(limit: number = 10): Promise<Company[]> {
    const response = await fetch(`${API_BASE_URL}/companies/top?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top companies');
    return response.json();
  },

  // Sectors
  async getSectorAverages(): Promise<SectorAverage[]> {
    const response = await fetch(`${API_BASE_URL}/sectors/average`);
    if (!response.ok) throw new Error('Failed to fetch sector averages');
    return response.json();
  },

  // High controversy companies
  async getHighControversyCompanies(minScore: number = 50): Promise<HighControversyCompany[]> {
    const response = await fetch(`${API_BASE_URL}/companies/high-controversy?min_score=${minScore}`);
    if (!response.ok) throw new Error('Failed to fetch high controversy companies');
    return response.json();
  },

  // ESG Prediction
  async predictESGRisk(data: ESGPredictionRequest): Promise<ESGPredictionResponse> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Prediction failed');
    }
    return response.json();
  },

  // Batch prediction
  async predictESGRiskBatch(items: ESGPredictionRequest[]): Promise<{ predictions: ESGPredictionResponse[] }> {
    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Batch prediction failed');
    }
    return response.json();
  },

  // Model info
  async getModelInfo(): Promise<ModelInfo> {
    const response = await fetch(`${API_BASE_URL}/model/info`);
    if (!response.ok) throw new Error('Failed to fetch model info');
    return response.json();
  },

  // Feature importances
  async getFeatureImportances(): Promise<{ features: string[]; feature_importances: Record<string, number> }> {
    const response = await fetch(`${API_BASE_URL}/model/feature-importances`);
    if (!response.ok) throw new Error('Failed to fetch feature importances');
    return response.json();
  },

  // Reload model
  async reloadModel(): Promise<{ reloaded: boolean; model_loaded: boolean }> {
    const response = await fetch(`${API_BASE_URL}/model/reload`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reload model');
    return response.json();
  },
};

export default apiService;