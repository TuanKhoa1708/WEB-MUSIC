import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import type { ArtistRequest, CreateArtistRequestInput } from '@/types/artistRequest.types';

export function useMyArtistRequest() {
  return useQuery({
    queryKey: ['artist-requests', 'my-request'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get<ArtistRequest>('/artist-requests/my-request');
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No request found
        }
        throw error;
      }
    },
  });
}

export function useApplyArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateArtistRequestInput) => {
      const { data } = await axiosInstance.post<ArtistRequest>('/artist-requests', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-requests', 'my-request'] });
    },
  });
}

export function useAdminArtistRequests(status?: string) {
  return useQuery({
    queryKey: ['artist-requests', 'admin', status],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ArtistRequest[]>('/artist-requests', {
        params: { status }
      });
      return data;
    },
  });
}

export function useApproveArtistRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.put(`/artist-requests/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-requests'] });
    },
  });
}

export function useRejectArtistRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, adminMessage }: { id: string; adminMessage?: string }) => {
      const { data } = await axiosInstance.put(`/artist-requests/${id}/reject`, { adminMessage });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-requests'] });
    },
  });
}

export function useApproveRevokeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.put(`/artist-requests/${id}/revoke-approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-requests'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
