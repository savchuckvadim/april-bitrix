'use client';

import { useQuery } from '@tanstack/react-query';
import { CabinetGuideHelper } from '../api/cabinet-guide-helper';

const helper = new CabinetGuideHelper();

/** Тексты статичны, чек-лист и счётчики живые — недолгий кэш. */
export const useCabinetGuide = () =>
    useQuery({
        queryKey: ['cabinet-guide'],
        queryFn: () => helper.get(),
        staleTime: 30_000,
    });
