import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, ESGPredictionRequest } from '@/lib/api';

// Query keys
export const queryKeys = {
  health: ['health'] as const,
  companies: (limit?: number) => ['companies', limit] as const,
  sectors: ['sectors'] as const,
  controversies: (minScore?: number) => ['controversies', minScore] as const,
  modelInfo: ['modelInfo'] as const,
  featureImportances: ['featureImportances'] as const,
};

// Custom hooks
export const useHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: apiService.getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTopCompanies = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.companies(limit),
    queryFn: () => apiService.getTopCompanies(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSectorAverages = () => {
  return useQuery({
    queryKey: queryKeys.sectors,
    queryFn: apiService.getSectorAverages,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHighControversyCompanies = (minScore: number = 50) => {
  return useQuery({
    queryKey: queryKeys.controversies(minScore),
    queryFn: () => apiService.getHighControversyCompanies(minScore),
    staleTime: 5 * 60 * 1000,
  });
};

export const useModelInfo = () => {
  return useQuery({
    queryKey: queryKeys.modelInfo,
    queryFn: apiService.getModelInfo,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeatureImportances = () => {
  return useQuery({
    queryKey: queryKeys.featureImportances,
    queryFn: apiService.getFeatureImportances,
    staleTime: 10 * 60 * 1000,
  });
};

export const useESGPrediction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ESGPredictionRequest) => apiService.predictESGRisk(data),
    onSuccess: () => {
      // Invalidate related queries if needed
    },
  });
};

export const useBatchESGPrediction = () => {
  return useMutation({
    mutationFn: (items: ESGPredictionRequest[]) => apiService.predictESGRiskBatch(items),
  });
};

export const useReloadModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.reloadModel,
    onSuccess: () => {
      // Invalidate all model-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.modelInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.featureImportances });
      queryClient.invalidateQueries({ queryKey: queryKeys.health });
    },
  });
};