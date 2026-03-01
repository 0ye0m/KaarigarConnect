'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Worker {
  id: string;
  skill_category: string;
  experience_years: number;
  hourly_rate: number;
  is_available: boolean;
  is_verified: boolean;
  total_jobs: number;
  rating: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  user?: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    city: string | null;
  } | null;
  reviews?: any[];
  distance?: number;
}

interface SearchParams {
  skill?: string;
  maxDistance?: number;
  minRating?: number;
  maxRate?: number;
  availableOnly?: boolean;
  lat?: number;
  lng?: number;
}

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWorkers = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.skill) queryParams.set('skill', params.skill);
      if (params.maxDistance) queryParams.set('maxDistance', params.maxDistance.toString());
      if (params.minRating) queryParams.set('minRating', params.minRating.toString());
      if (params.maxRate) queryParams.set('maxRate', params.maxRate.toString());
      if (params.availableOnly) queryParams.set('availableOnly', 'true');
      if (params.lat) queryParams.set('lat', params.lat.toString());
      if (params.lng) queryParams.set('lng', params.lng.toString());

      const response = await fetch(`/api/workers?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workers');
      }

      setWorkers(data.workers);
      return data.workers;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workers';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkerById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/workers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch worker');
      }

      return data.worker;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch worker';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    workers,
    isLoading,
    error,
    searchWorkers,
    getWorkerById,
  };
}
