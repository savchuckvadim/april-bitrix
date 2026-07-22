'use client';

import { useQuery } from '@tanstack/react-query';
import { SmartsAdminHelper } from '../api/smarts-admin-helper';

const adminHelper = new SmartsAdminHelper();

/** Ключ кэша реестра const-смартов (реестр статичен — из констант бэка). */
export const CONST_SMART_REGISTRY_KEY = ['pbx-smart-registry'] as const;

/**
 * Реестр const-смартов, доступных к установке. Реестр собирается на бэке из
 * констант и не зависит от портала, поэтому кэшируется навсегда
 * (`staleTime: Infinity`). Живёт в db-сегменте (а не gallery), потому что
 * нужен и таблице БД, и галерее, и странице процесса — для роутинга и label.
 */
export const useConstSmartRegistry = () =>
    useQuery({
        queryKey: CONST_SMART_REGISTRY_KEY,
        queryFn: () => adminHelper.getRegistry(),
        staleTime: Infinity,
    });
