'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { findUfKey } from '@workspace/pbx';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ZprRef } from '../../model';
import {
    ZPR_REFS_FIELD_CODE,
    mergeZprRefs,
    parseZprRefs,
} from '../zpr-ref';
import { ZprCallsHelper } from '../api/zpr-calls-helper';
import { ZPR_QUERY_ROOT } from './zpr-query-keys';

const helper = new ZprCallsHelper();

/** Ссылки не протухают сами: свежесть приносит WS-инвалидация. */
const REFS_STALE_TIME_MS = 5 * 60 * 1000;

export interface ZprRefsState {
    refs: ZprRef[];
    /** Поле op_zprs установлено хотя бы на одной сущности контекста. */
    hasField: boolean;
}

/**
 * Обратные ссылки op_zprs клиента.
 *
 * Стартовые значения — бесплатно из уже загруженных сущностей контекста
 * (`app.bitrix.deal/company` несут все UF-поля), ключ поля — по доктрине
 * «код → слепок → bitrixId» (`findUfKey` слепка портала). Запрос в Битрикс
 * НЕ уходит, пока ссылки не понадобилось освежить: initialData считается
 * свежей, сеть трогает только WS-инвалидация (`zpr-flow:done`) — сайд-очередь
 * дописывает обратную ссылку ПОСЛЕ основного отчёта, и только тогда сторовые
 * значения устаревают.
 *
 * Self-gate: поле не установлено или сущностей нет — запрос выключен,
 * ссылок нет, слайс молчит.
 */
export const useZprRefs = (): ZprRefsState => {
    const domain = useAppSelector(s => s.app.domain);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const company = useAppSelector(s => s.app.bitrix.company);
    const dealFields = useAppSelector(
        s => s.portal.portal?.bitrixDeal?.bitrixfields,
    );
    const companyFields = useAppSelector(
        s => s.portal.portal?.company?.bitrixfields,
    );

    const dealUfKey = findUfKey(dealFields, ZPR_REFS_FIELD_CODE);
    const companyUfKey = findUfKey(companyFields, ZPR_REFS_FIELD_CODE);
    const dealId = Number(deal?.ID) || null;
    const companyId = Number(company?.ID) || null;
    const hasField = Boolean(
        (dealId && dealUfKey) || (companyId && companyUfKey),
    );

    // Стартовые ссылки из стора: сущности уже загружены со всеми UF-полями.
    const initialRefs = useMemo(() => {
        const fromDeal = dealUfKey
            ? parseZprRefs(
                  (deal as unknown as Record<string, unknown> | null)?.[
                      dealUfKey
                  ],
              )
            : [];
        const fromCompany = companyUfKey
            ? parseZprRefs(
                  (company as unknown as Record<string, unknown> | null)?.[
                      companyUfKey
                  ],
              )
            : [];
        return mergeZprRefs(fromDeal, fromCompany);
    }, [deal, company, dealUfKey, companyUfKey]);

    const query = useQuery({
        // Ключи полей в queryKey: до прихода слепка запись в кэше не
        // создаётся с пустой initialData под «настоящим» ключом.
        queryKey: [
            ZPR_QUERY_ROOT,
            'refs',
            domain,
            dealId,
            companyId,
            dealUfKey,
            companyUfKey,
        ],
        queryFn: () =>
            helper.fetchRefs({ dealId, companyId, dealUfKey, companyUfKey }),
        enabled: hasField,
        initialData: initialRefs,
        initialDataUpdatedAt: () => Date.now(),
        staleTime: REFS_STALE_TIME_MS,
    });

    // Свежесть двунаправленная: WS освежает запрос, reloadApp — стор.
    const refs = useMemo(
        () => mergeZprRefs(query.data ?? [], initialRefs),
        [query.data, initialRefs],
    );

    return { refs, hasField };
};
