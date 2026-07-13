'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FieldHelper } from '../api/field-helper';
import type { Field, FieldCreate, FieldUpdate } from '../../model';

const helper = new FieldHelper();
const KEY = ['konstructor-fields'] as const;

/** Весь глобальный справочник полей конструктора. */
export const useFields = () =>
    useQuery<Field[], Error>({
        queryKey: KEY,
        queryFn: () => helper.list(),
    });

/** Одно поле по id. */
export const useField = (id?: number) =>
    useQuery<Field, Error>({
        queryKey: [...KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });

/** Создать поле. */
export const useCreateField = () => {
    const qc = useQueryClient();
    return useMutation<Field, Error, FieldCreate>({
        mutationFn: (dto) => helper.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Частично обновить поле по id. */
export const useUpdateField = () => {
    const qc = useQueryClient();
    return useMutation<Field, Error, { id: number; dto: FieldUpdate }>({
        mutationFn: (vars) => helper.update(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить поле по id. */
export const useDeleteField = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
