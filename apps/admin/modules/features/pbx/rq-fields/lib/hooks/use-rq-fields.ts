'use client';

import { useMemo } from 'react';
import {
    PbxCreateFieldDto,
    PbxCreateFieldsBulkDto,
    PbxUpdateFieldDto,
    useBitrixFields,
    useCreateBitrixField,
    useCreateBitrixFieldsBulk,
    useDeleteBitrixField,
    useUpdateBitrixField,
} from '@/modules/entities/portal-bitrix/bitrix-fields';
import { EntityFieldsContext } from '../../model/types';

export const useRqFields = (context: EntityFieldsContext) => {
    const query = useBitrixFields({
        entityType: context.entityType,
        entityId: context.entityId,
    });
    const createMutation = useCreateBitrixField();
    const updateMutation = useUpdateBitrixField();
    const deleteMutation = useDeleteBitrixField();
    const bulkMutation = useCreateBitrixFieldsBulk();
debugger
    const fields = useMemo(() => (Array.isArray(query.data) ? query.data : []), [query.data]);

    const createField = async (dto: Omit<PbxCreateFieldDto, 'entity_type' | 'entity_id' | 'parent_type'>) => {
        return createMutation.mutateAsync({
            ...dto,
            entity_type: context.entityType,
            entity_id: context.entityId,
            parent_type: context.parentType,
        });
    };

    const updateField = async (id: number, dto: PbxUpdateFieldDto) => {
        return updateMutation.mutateAsync({ id, dto });
    };

    const deleteField = async (id: number) => {
        return deleteMutation.mutateAsync(id);
    };

    const createBulk = async (fieldsInput: Omit<PbxCreateFieldDto, 'entity_type' | 'entity_id' | 'parent_type'>[]) => {
        const payload: PbxCreateFieldsBulkDto = {
            fields: fieldsInput.map((field) => ({
                ...field,
                entity_type: context.entityType,
                entity_id: context.entityId,
                parent_type: context.parentType,
            })),
        };
        return bulkMutation.mutateAsync(payload);
    };

    return {
        fields,
        isLoading: query.isLoading,
        createField,
        updateField,
        deleteField,
        createBulk,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isBulkCreating: bulkMutation.isPending,
    };
};
