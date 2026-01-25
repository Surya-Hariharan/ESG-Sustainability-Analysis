import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refetchInterval?: number;
  cacheTime?: number;
}

interface UseApiState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  isFetching: boolean;
}

interface UseApiActions {
  refetch: () => Promise<void>;
  reset: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useApi<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiState<T> & UseApiActions {
  const {
    initialData,
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    isLoading: enabled,
    isError: false,
    error: null,
    isSuccess: false,
    isFetching: false,
  });

  const mountedRef = useRef(true);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setState((prev: ApiState<T>) => ({
        ...prev,
        data: cached.data as T,
        isLoading: false,
        isSuccess: true,
        isFetching: false,
      }));
      return;
    }

    setState((prev: ApiState<T>) => ({ ...prev, isFetching: true, isError: false, error: null }));

    try {
      const data = await fetcher();

      if (!mountedRef.current) return;

      // Update cache
      cache.set(key, { data, timestamp: Date.now() });

      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        isFetching: false,
      });

      onSuccess?.(data);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));

      setState({
        data: initialData,
        isLoading: false,
        isError: true,
        error,
        isSuccess: false,
        isFetching: false,
      });

      onError?.(error);
    }
  }, [key, fetcher, cacheTime, initialData, onSuccess, onError]);

  const reset = useCallback(() => {
    cache.delete(key);
    setState({
      data: initialData,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      isFetching: false,
    });
  }, [key, initialData]);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [enabled, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    reset,
  };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

interface UseMutationState<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
) {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<UseMutationState<TData>>({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        isSuccess: false,
      });

      try {
        const data = await mutationFn(variables);

        if (!mountedRef.current) return;

        setState({
          data,
          isLoading: false,
          isError: false,
          error: null,
          isSuccess: true,
        });

        onSuccess?.(data, variables);
        onSettled?.(data, null, variables);

        return data;
      } catch (err) {
        if (!mountedRef.current) return;

        const error = err instanceof Error ? err : new Error(String(err));

        setState({
          data: undefined,
          isLoading: false,
          isError: true,
          error,
          isSuccess: false,
        });

        onError?.(error, variables);
        onSettled?.(undefined, error, variables);

        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync: mutate,
    reset,
  };
}
