'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CounterHelper } from '../api/counter-helper';
import type { Counter, CounterCreate, CounterUpdate } from '../../model';

const helper = new CounterHelper();
const KEY = ['konstructor-counters'] as const;

/** Весь глобальный справочник счётчиков конструктора. */
export const useCounters = () =>
    useQuery<Counter[], Error>({
        queryKey: KEY,
        queryFn: () => helper.list(),
    });

/** Один счётчик по id. */
export const useCounter = (id?: number) =>
    useQuery<Counter, Error>({
        queryKey: [...KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });

/** Создать счётчик. */
export const useCreateCounter = () => {
    const qc = useQueryClient();
    return useMutation<Counter, Error, CounterCreate>({
        mutationFn: (dto) => helper.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Частично обновить счётчик по id. */
export const useUpdateCounter = () => {
    const qc = useQueryClient();
    return useMutation<Counter, Error, { id: number; dto: CounterUpdate }>({
        mutationFn: (vars) => helper.update(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить счётчик по id. */
export const useDeleteCounter = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
