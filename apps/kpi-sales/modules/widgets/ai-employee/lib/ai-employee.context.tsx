'use client';

import { createContext, useContext } from 'react';
import type {
    AiAttention,
    AiCallType,
    AiDossier,
    AiJobStatus,
    AiManagerRow,
    AiManagerTrends,
    AiPlanFact,
    AiPlanFactRow,
    AiPulse,
    AiStatus,
    AiStyleCard,
    AiYoy,
} from '@/modules/entities/ai-analytics';
import type { AiEmployeeBrief } from './ai-employee-brief.util';

/**
 * Собранные данные AI-раздела страницы сотрудника (use-ai-employee) —
 * подвкладки читают их из контекста, не повторяя выборки из стора.
 */
export interface AiEmployeeContextValue {
    managerId: string;
    isSelf: boolean;
    isLeader: boolean;
    canViewAll: boolean;
    canConfigure: boolean;
    kpiOnly: boolean;
    /** Период обзора (фильтр отчёта, обрезанный до лимита); null — не задан. */
    period: { from: string; to: string } | null;
    /** Месяц план-факта (конец периода отчёта, иначе текущий). */
    monthKey: string;
    overview: {
        status: AiStatus;
        jobStatus: AiJobStatus;
        error: string | null;
        retry: () => void;
    };
    /** Строка сотрудника в обзоре; null — обзора нет или сотрудника в нём нет. */
    row: AiManagerRow | null;
    /** Обзор готов, а строки сотрудника в нём нет. */
    rowMissing: boolean;
    attention: AiAttention | null;
    pulse: AiPulse | null;
    planFact: {
        status: AiStatus;
        error: string | null;
        data: AiPlanFact | null;
        /** Строки показателей сотрудника (из ручки, иначе из досье). */
        rows: AiPlanFactRow[];
        retry: () => void;
    };
    dossier: {
        status: AiStatus;
        jobStatus: AiJobStatus;
        error: string | null;
        data: AiDossier | null;
        months: number;
        setMonths: (months: number) => void;
        rebuild: () => void;
    };
    style: {
        status: AiStatus;
        error: string | null;
        data: AiStyleCard | null;
        retry: () => void;
    };
    brief: AiEmployeeBrief;
    trends: AiManagerTrends | null;
    yoy: AiYoy | null;
    callTypes: AiCallType[];
}

const AiEmployeeContext = createContext<AiEmployeeContextValue | null>(null);

export const AiEmployeeProvider = AiEmployeeContext.Provider;

export const useAiEmployeeContext = (): AiEmployeeContextValue => {
    const value = useContext(AiEmployeeContext);
    if (!value) {
        throw new Error('useAiEmployeeContext вне AiEmployeeProvider');
    }
    return value;
};
