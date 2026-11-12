'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AdminClientGetAllClientsParams,
    ClientResponseDto,
    ClientWithRelationsResponseDto,
    CreateClientDto,
    UpdateClientDto
} from '@workspace/nest-admin-api';
import { ClientHelper } from '../api/client-helper';
import type { ClientOverview } from '../../model/overview';

const clientHelper = new ClientHelper();

/** Сводка организации для страницы клиента: порталы, владельцы, люди. */
export const useClientOverview = (id: number) =>
    useQuery<ClientOverview, Error>({
        queryKey: ['client-overview', id],
        queryFn: () => clientHelper.getOverview(id),
        enabled: Number.isInteger(id) && id > 0,
    });

export const useClients = (params: AdminClientGetAllClientsParams) => {
    return useQuery<ClientResponseDto[], Error>({
        queryKey: ['clients', params],
        queryFn: async () => {
            const response = await clientHelper.getClients(
                params || ({} as Partial<AdminClientGetAllClientsParams>) as AdminClientGetAllClientsParams,
            );
            console.log(response);
            ;
            return response;
        },
        enabled: !!params,
    });
};

export const useClient = (id: number) => {
    return useQuery<ClientWithRelationsResponseDto, Error>({
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

