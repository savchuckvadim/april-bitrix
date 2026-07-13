'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NumeratorHelper } from '../api/numerator-helper';
import type {
    DocumentNumber,
    Numerator,
    NumeratorCreate,
    NumeratorType,
} from '../../model';

const helper = new NumeratorHelper();
const KEY = ['konstructor-numerators'] as const;

/** Нумераторы реквизита (Rq) портала. */
export const useNumeratorsByRq = (rqId?: number) =>
    useQuery<Numerator[], Error>({
        queryKey: [...KEY, rqId],
        queryFn: () => helper.listByRq(rqId as number),
        enabled: !!rqId,
    });

/** Создать нумератор. */
export const useCreateNumerator = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, NumeratorCreate>({
        mutationFn: (dto) => helper.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить нумератор. */
export const useDeleteNumerator = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (counterId) => helper.remove(counterId),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Получить текущее значение номера (peek). */
export const usePeekNumber = () =>
    useMutation<DocumentNumber, Error, { rqId: number; type: NumeratorType }>({
        mutationFn: (vars) => helper.peek(vars.rqId, vars.type),
    });

/** Задать текущее значение счётчика. */
export const useSetCurrentNumber = () => {
    const qc = useQueryClient();
    return useMutation<
        DocumentNumber,
        Error,
        { rqId: number; type: NumeratorType; value: number }
    >({
        mutationFn: (vars) => helper.setCurrent(vars.rqId, vars.type, vars.value),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
