import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../model/store';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';

/**
 * Откуда открыто приложение и какие сущности при этом известны.
 *
 * Единственный источник правды о контексте: раньше «мы в лиде?» считалось по
 * placement-строке, а `from` жил сам по себе — два расходящихся ответа на один
 * вопрос. Теперь всё считается от `from`, который выставляет placement-util.
 */
export interface DuplicateContext {
    from: APP_FROM_ENUM | null;
    companyId: number | null;
    leadId: number | null;
    dealId: number | null;
    /** Сделка без компании — отдельный случай: искать не от кого, кроме самой сделки. */
    hasCompany: boolean;
}

const toId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/**
 * Мемоизирован: возвращает новый объект, и без createSelector любой
 * useAppSelector(getDuplicateContext) перерисовывался бы на каждый экшен.
 */
export const getDuplicateContext = createSelector(
    [
        (state: RootState) => state.app.bitrix.from,
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.app.bitrix.lead,
        (state: RootState) => state.app.bitrix.deal,
    ],
    (from, company, lead, deal): DuplicateContext => {
        const companyId = toId(company?.ID);
        return {
            from,
            companyId,
            leadId: toId(lead?.ID),
            dealId: toId(deal?.ID),
            hasCompany: !!companyId,
        };
    },
);

/** Открыты из лида — компании ещё нет, работаем с сигналами самого лида. */
export const getIsLeadContext = (state: RootState): boolean =>
    state.app.bitrix.from === APP_FROM_ENUM.LEAD;

/**
 * Контекст клиента для правил приложения (типы планирования, виджеты,
 * гейты валидации). «Сделка без компании» — отдельный первоклассный кейс:
 * похож на лид, но со своими правами (см. plan-rules).
 *
 * ЕДИНСТВЕННЫЙ источник ответа «есть ли компания»: раньше `!!company`
 * дерривился в четырёх местах независимо и с разными таймингами.
 */
export type ClientContext = 'company' | 'dealNoCompany' | 'lead' | 'unknown';

export const getClientContext = (state: RootState): ClientContext => {
    const { company, deal, lead } = state.app.bitrix;
    if (company) return 'company';
    if (deal) return 'dealNoCompany';
    if (lead) return 'lead';
    // Сущности ещё не отрезолвлены (бут) или их нет вовсе — самый строгий набор.
    return 'unknown';
};

/** Режим отдела — ТМЦ? (единственное место чтения кода режима) */
export const getIsTmcMode = (state: RootState): boolean =>
    state.department[DEPARTAMENT_STATE_PROP.MODE].current?.code === 'tmc';
