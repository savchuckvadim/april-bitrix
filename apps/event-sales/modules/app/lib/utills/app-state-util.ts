import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../model/store';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';

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
