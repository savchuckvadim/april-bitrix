'use client';

import { useState } from 'react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import {
    isValidProbeMonths,
    parseAuditMonths,
} from '../../../lib/audit-months.util';
import { useStageHistoryProbe } from '../../../lib/hooks/use-ai-analytics-audit';
import {
    buildStageHistoryProbeView,
    type StageHistoryProbeView,
} from '../../../lib/stage-history-probe.util';
import { AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS } from '../../../model';
import type {
    StageHistoryProbeControls,
    StageHistoryProbeFormState,
} from '../types';

/**
 * Логика блока «История стадий сделок»: окно в месяцах, запуск пробы по
 * кнопке, результат и ошибка. Домен общий с формой аудита и приходит
 * снаружи; результат показывается только для домена, по которому проба
 * запрошена — после смены портала чужой ответ под новым выбором не висит.
 *
 * «Недоступно» — штатный ответ (available = false с текстом в error), а не
 * ошибка запроса; ошибка мутации — сбой самой ручки (валидация, сеть, 403).
 */
export const useStageHistoryProbePanel = (domain: string | undefined) => {
    const [monthsRaw, setMonthsRaw] = useState(
        String(AI_ANALYTICS_STAGE_HISTORY_PROBE_DEFAULTS.months),
    );
    const [requestedDomain, setRequestedDomain] = useState<
        string | undefined
    >(undefined);
    const probe = useStageHistoryProbe();

    const months = parseAuditMonths(monthsRaw);
    const isMonthsValid = isValidProbeMonths(months);
    const isForCurrentDomain = !!domain && requestedDomain === domain;

    const run = () => {
        if (!domain || !isMonthsValid) return;
        setRequestedDomain(domain);
        probe.mutate({ domain, months });
    };

    const view: StageHistoryProbeView | null =
        isForCurrentDomain && probe.data
            ? buildStageHistoryProbeView(probe.data)
            : null;
    const errorMessage =
        isForCurrentDomain && probe.isError
            ? getApiErrorMessage(probe.error)
            : null;

    const form: StageHistoryProbeFormState = { monthsRaw, isMonthsValid };
    const controls: StageHistoryProbeControls = {
        canProbe: !!domain && isMonthsValid && !probe.isPending,
        isProbing: probe.isPending,
        probe: run,
    };

    return { form, setMonthsRaw, controls, view, errorMessage };
};
