'use client';

// ---- Types ----
export type PropertyType = 'apartment' | 'house' | 'villa' | 'commercial' | 'plot' | 'pg';
export type PropertyStatus = 'for_sale' | 'for_rent';
export type PropertyInputType = PropertyType;
export type PropertyInputStatus = PropertyStatus;
export type PropertyUpdateType = PropertyType;
export type PropertyUpdateStatus = PropertyStatus;

export const PropertyInputType = {
  apartment: 'apartment', house: 'house', villa: 'villa',
  commercial: 'commercial', plot: 'plot', pg: 'pg',
} as const;

export const PropertyInputStatus = {
  for_sale: 'for_sale', for_rent: 'for_rent',
} as const;

export const PropertyUpdateType = PropertyInputType;
export const PropertyUpdateStatus = PropertyInputStatus;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  city: string;
  locality: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images?: string[];
  amenities?: string[];
  isFurnished?: boolean;
  parkingAvailable?: boolean;
  ownerUserId: string;
  ownerName?: string;
  inquiryCount?: number;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  fromUserName?: string;
  fromUserPhone?: string;
  fromUserEmail?: string;
  message: string;
  createdAt: string;
}

export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

// ---- Auth token getter/setter ----
let _tokenGetter: (() => string | null) | null = null;
let _tokenSetter: ((token: string) => void) | null = null;
export function setAuthTokenGetter(fn: () => string | null) { _tokenGetter = fn; }
export function setAuthTokenSetter(fn: (token: string) => void) { _tokenSetter = fn; }

// ---- Base fetch with silent refresh ----
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

let _refreshPromise: Promise<string> | null = null;

async function tryRefresh(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('re_refresh_token') : null;
    if (!refreshToken) throw new Error('No refresh token');
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const { token } = await res.json();
    localStorage.setItem('re_token', token);
    _tokenSetter?.(token);
    return token;
  })().finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = _tokenGetter?.();
  const makeRequest = (t: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options?.headers,
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401 && token) {
    try {
      const newToken = await tryRefresh();
      res = await makeRequest(newToken);
    } catch {
      // refresh failed — let the error propagate naturally
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try { msg = JSON.parse(text)?.message ?? text; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ---- React Query hooks ----
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGetMe(enabled = true) {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiFetch<User>('/api/auth/me'),
    enabled,
    retry: false,
  });
}

export function useLoginUser() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<{ token: string; refreshToken: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; password: string }) =>
      apiFetch<{ token: string; refreshToken: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useGetFeaturedProperties(params?: { limit?: number }) {
  const qs = params?.limit ? `?limit=${params.limit}` : '';
  return useQuery<Property[]>({
    queryKey: ['featured-properties', qs],
    queryFn: () => apiFetch<Property[]>(`/api/properties/featured${qs}`),
  });
}

export function useGetStatsOverview() {
  return useQuery<{ totalProperties: number; forSaleCount: number; forRentCount: number; totalCities: number }>({
    queryKey: ['stats-overview'],
    queryFn: () => apiFetch('/api/stats/overview'),
  });
}

export function useGetTopCities() {
  return useQuery<{ city: string; count: number }[]>({
    queryKey: ['top-cities'],
    queryFn: () => apiFetch('/api/stats/top-cities'),
  });
}

export function useListProperties(params?: Record<string, string | number | undefined>) {
  const filteredParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') filteredParams[k] = String(v);
    });
  }
  const qs = Object.keys(filteredParams).length ? '?' + new URLSearchParams(filteredParams).toString() : '';
  return useQuery<PropertiesResponse>({
    queryKey: ['properties', qs],
    queryFn: () => apiFetch<PropertiesResponse>(`/api/properties${qs}`),
  });
}

export function useGetProperty(id?: string, enabled = true) {
  return useQuery<Property>({
    queryKey: ['property', id],
    queryFn: () => apiFetch<Property>(`/api/properties/${id}`),
    enabled: !!id && enabled,
  });
}

export function useGetSimilarProperties(id?: string, enabled = true) {
  return useQuery<Property[]>({
    queryKey: ['similar-properties', id],
    queryFn: () => apiFetch<Property[]>(`/api/properties/${id}/similar`),
    enabled: !!id && enabled,
  });
}

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (data: { propertyId: string; message: string }) =>
      apiFetch<{ id: string; message: string }>('/api/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  });
}

export function useGetMyListings(enabled = true) {
  return useQuery<Property[]>({
    queryKey: ['my-listings'],
    queryFn: () => apiFetch<Property[]>('/api/properties/my-listings'),
    enabled,
  });
}

export function useListInquiries(enabled = true) {
  return useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: () => apiFetch<Inquiry[]>('/api/inquiries'),
    enabled,
  });
}

export function useListSentInquiries(enabled = true) {
  return useQuery<Inquiry[]>({
    queryKey: ['sent-inquiries'],
    queryFn: () => apiFetch<Inquiry[]>('/api/inquiries/sent'),
    enabled,
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ message: string }>(`/api/properties/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Property, 'id' | 'ownerUserId' | 'ownerName' | 'inquiryCount' | 'createdAt'>) =>
      apiFetch<Property>('/api/properties', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Omit<Property, 'ownerUserId' | 'ownerName' | 'inquiryCount'>> & { id: string }) =>
      apiFetch<Property>(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });
}

export function useHealthCheck() {
  return useQuery<{ status: string; timestamp: string }>({
    queryKey: ['health'],
    queryFn: () => apiFetch('/api/health'),
  });
}

export function getGetMyListingsQueryKey() { return ['my-listings']; }
export function getGetPropertyQueryKey(id: string) { return ['property', id]; }
