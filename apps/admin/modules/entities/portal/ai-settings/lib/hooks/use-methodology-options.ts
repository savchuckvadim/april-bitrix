'use client';

import { useQuery } from '@tanstack/react-query';
import { AiSettingsHelper } from '../api/ai-settings-helper';

const helper = new AiSettingsHelper();
export const METHODOLOGY_OPTIONS_KEY = 'methodology-options';

/** Методики, доступные порталу: встроенные общего слоя и из таблицы, свои поверх общих. */
export const useMethodologyOptions = (domain: string | undefined) =>
    useQuery({
        queryKey: [METHODOLOGY_OPTIONS_KEY, domain ?? null],
        queryFn: () => helper.methodologyOptions(domain),
        staleTime: 60_000,
    });
