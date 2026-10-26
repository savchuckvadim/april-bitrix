'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { SupportHelper } from '../api/support-helper';

const helper = new SupportHelper();

/** Общий префикс ключей кэша раздела «Поддержка клиентов». */
export const SUPPORT_QUERY_KEY = ['support'] as const;

/** Путеводитель: тексты статичны, чек-лист живой — недолгий кэш. */
export const useSupportGuide = (domain?: string) =>
    useQuery({
        queryKey: [...SUPPORT_QUERY_KEY, 'guide', domain ?? ''],
        queryFn: () => helper.getGuide(domain),
        staleTime: 30_000,
    });

/** «Проверить линию сейчас»: по кнопке, без кэша. */
export const useSupportPreview = () =>
    useMutation({
        mutationFn: (domain: string) => helper.preview(domain),
    });
