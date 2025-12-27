'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AdminClientGetAllClientsParams,
    ClientResponseDto,
    CreateClientDto,
    UpdateClientDto,
} from '@workspace/nest-api';
import { ClientHelper } from '../api/client-helper';

const clientHelper = new ClientHelper();

export const useClients = (params?: AdminClientGetAllClientsParams) => {
    return useQuery<ClientResponseDto[], Error>({
        queryKey: ['clients', params],
        queryFn: async () => {
            const response = await clientHelper.getClients(
                params || { status: '', is_active: '' },
            );
            return response;
        },
    });
};

export const useClient = (id: number) => {
    return useQuery<ClientResponseDto, Error>({
        queryKey: ['client', id],
        queryFn: async () => {
            const response = await clientHelper.getClientById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();

    return useMutation<ClientResponseDto, Error, CreateClientDto>({
        mutationFn: async (dto: CreateClientDto) => {
            const response = await clientHelper.createClient(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ClientResponseDto,
        Error,
        { id: number; dto: UpdateClientDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await clientHelper.updateClient(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({
                queryKey: ['client', variables.id],
            });
        },
    });
};

export const useDeleteClient = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await clientHelper.deleteClient(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
};

export const useClientByEmail = (email: string) => {
    return useQuery<ClientResponseDto, Error>({
        queryKey: ['client', 'email', email],
        queryFn: async () => {
            const response = await clientHelper.getClientByEmail(email);
            return response;
        },
        enabled: !!email,
    });
};

