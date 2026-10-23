import type {
  PropertyPredictionRequest,
  PredictionResponse,
  HealthResponse,
  ModelMetricsResponse,
  DatasetSummaryResponse,
  LocationItem,
  FAQItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        let errorMsg = `Server error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.detail) {
            errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {
          // fallback to statusText
          errorMsg = res.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      return await res.json();
    } catch (err: any) {
      console.warn(`API call failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  async getMetadata(): Promise<any> {
    return this.request<any>('/api/metadata');
  }

  async getModelMetrics(): Promise<ModelMetricsResponse> {
    return this.request<ModelMetricsResponse>('/api/model-metrics');
  }

  async getDatasetSummary(): Promise<DatasetSummaryResponse> {
    return this.request<DatasetSummaryResponse>('/api/dataset/summary');
  }

  async getLocations(query?: string): Promise<LocationItem[]> {
    const endpoint = query ? `/api/dataset/locations?q=${encodeURIComponent(query)}` : '/api/dataset/locations';
    return this.request<LocationItem[]>(endpoint);
  }

  async predictPrice(payload: PropertyPredictionRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getFaq(): Promise<FAQItem[]> {
    return this.request<FAQItem[]>('/api/faq');
  }
}

export const api = new ApiService();
