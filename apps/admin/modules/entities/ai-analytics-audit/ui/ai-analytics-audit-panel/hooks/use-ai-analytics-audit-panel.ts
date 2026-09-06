'use client';

import { useState } from 'react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { usePortals } from '@/modules/entities/portal/hooks';
import { isForbiddenError, isNotFoundError } from '../../../lib/audit-error.util';
import { isValidAuditMonths, parseAuditMonths } from '../../../lib/audit-months.util';
import {
    useAuditAbout,
    useLatestAudit,
    useRunAudit,
} from '../../../lib/hooks/use-ai-analytics-audit';
import {
    findPortalSettingsHref,
    toPortalOptions,
} from '../../../lib/portal-options.util';
import {
    AI_ANALYTICS_AUDIT_RUN_DEFAULTS,
    type AiAnalyticsAuditAbout,
    type AiAnalyticsAuditResult,
} from '../../../model';
import type {
    AuditFormActions,
    AuditFormState,
    AuditPortalState,
    AuditRunControls,
} from '../types';

/** Откуда показанный результат: свежий запуск или прочитанный снапшот. */
type AuditResultOrigin = 'run' | 'latest' | null;

/**
 * Логика панели аудита: форма запуска, состояние портала, какой результат
 * показывать (последнее действие владельца побеждает), ошибки по видам.
 *
 * Портальный гейт двухуровневый: выключенная AI-аналитика портала
 * (`aiAnalyticsEnabled`) прячет форму запуска целиком, выключенный
 * признак аудита (`auditEnabled`) только блокирует кнопку; последний
 * снапшот читается в обоих случаях.
 *
 * Снапшот читается только по кнопке — при каждом выборе портала его тянуть
 * незачем. Смена портала сбрасывает показанный результат и ошибки: отчёт
 * другого домена под новым выбором вводил бы в заблуждение.
 */
export const useAiAnalyticsAuditPanel = () => {
    const [domain, setDomain] = useState<string | undefined>(undefined);
    const [monthsRaw, setMonthsRaw] = useState(
        String(AI_ANALYTICS_AUDIT_RUN_DEFAULTS.months),
    );
    const [timeZone, setTimeZone] = useState<string>(
        AI_ANALYTICS_AUDIT_RUN_DEFAULTS.timeZone,
    );
    const [save, setSave] = useState<boolean>(
        AI_ANALYTICS_AUDIT_RUN_DEFAULTS.save,
    );
    const [latestRequested, setLatestRequested] = useState(false);
    const [origin, setOrigin] = useState<AuditResultOrigin>(null);
    const [aboutOpen, setAboutOpen] = useState(true);

    const { data: portals } = usePortals();
    const about = useAuditAbout(domain);
    const latest = useLatestAudit(domain, latestRequested);
    const runAudit = useRunAudit();

    const months = parseAuditMonths(monthsRaw);
    const isMonthsValid = isValidAuditMonths(months);

    // placeholderData держит ответ прежнего домена, пока едет новый —
    // состояние портала берём только когда оно про выбранный домен.
    const portalStatus =
        domain && about.data?.portal?.domain.toLowerCase() === domain.toLowerCase()
            ? about.data.portal
            : null;
    const isPortalAiDisabled = portalStatus?.aiAnalyticsEnabled === false;
    const isAuditForbidden = portalStatus?.auditEnabled === false;

    const selectDomain = (next: string) => {
        setDomain(next);
        setLatestRequested(false);
        setOrigin(null);
        runAudit.reset();
    };

    const run = () => {
        if (!domain || !isMonthsValid) return;
        setAboutOpen(false);
        setOrigin('run');
        runAudit.mutate({ domain, months, timeZone, save });
    };

    const showLatest = () => {
        if (!domain) return;
        setAboutOpen(false);
        setOrigin('latest');
        if (latestRequested) {
            void latest.refetch();
        } else {
            setLatestRequested(true);
        }
    };

    const result: AiAnalyticsAuditResult | null =
        origin === 'run'
            ? (runAudit.data ?? null)
            : origin === 'latest'
              ? (latest.data ?? null)
              : null;

    // Описание — из ручки about (есть и до первого запуска); если она
    // не ответила, годится то же самоописание из тела результата.
    const aboutData: AiAnalyticsAuditAbout | null =
        about.data?.about ?? result?.about ?? null;

    const isLatestNotFound =
        origin === 'latest' && latest.isError && isNotFoundError(latest.error);
    const latestErrorMessage =
        origin === 'latest' && latest.isError && !isLatestNotFound
            ? getApiErrorMessage(latest.error)
            : null;
    const runErrorMessage =
        origin === 'run' && runAudit.isError
            ? getApiErrorMessage(runAudit.error)
            : null;
    const isRunForbidden = origin === 'run' && isForbiddenError(runAudit.error);

    const form: AuditFormState = {
        domain,
        monthsRaw,
        timeZone,
        save,
        isMonthsValid,
        portalOptions: toPortalOptions(portals),
    };
    const formActions: AuditFormActions = {
        selectDomain,
        setMonthsRaw,
        setTimeZone,
        setSave,
    };
    const controls: AuditRunControls = {
        canRun:
            !!domain &&
            isMonthsValid &&
            !isPortalAiDisabled &&
            !isAuditForbidden &&
            !runAudit.isPending,
        canShowLatest: !!domain && !latest.isFetching,
        isRunning: runAudit.isPending,
        isLatestLoading: origin === 'latest' && latest.isFetching,
        run,
        showLatest,
    };
    const portal: AuditPortalState = {
        status: portalStatus,
        isLoading: !!domain && !portalStatus && about.isFetching,
        settingsHref: findPortalSettingsHref(portals, domain),
        accessText: aboutData?.access ?? null,
    };

    return {
        form,
        formActions,
        controls,
        portal,
        about: aboutData,
        isAboutLoading: about.isLoading,
        isAboutError: about.isError && !aboutData,
        aboutOpen,
        setAboutOpen,
        result,
        isLatestNotFound,
        latestErrorMessage,
        runErrorMessage,
        isRunForbidden,
    };
};
