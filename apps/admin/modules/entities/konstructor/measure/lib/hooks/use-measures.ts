'use client';

import { useQuery } from '@tanstack/react-query';
import { MeasureHelper } from '../api/measure-helper';
import type { Measure } from '../../model';

const helper = new MeasureHelper();
const KEY = ['konstructor-measures'] as const;

/** Весь глобальный справочник единиц измерения. */
export const useMeasures = () =>
    useQuery<Measure[], Error>({
        queryKey: KEY,
        queryFn: () => helper.list(),
    });

/** Одна единица измерения по id. */
export const useMeasure = (id?: number) =>
    useQuery<Measure, Error>({
        queryKey: [...KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });
