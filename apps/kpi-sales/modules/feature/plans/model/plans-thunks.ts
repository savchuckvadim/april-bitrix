import type { AppThunk } from '@/modules/app/model/store';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import { selectAccessContext } from '@/modules/app/lib/access/use-access';
import { PlansHelper } from '../lib/api/plans-helper';
import { plansActions } from './plans-slice';
import type { PlansConfig, PlanTargetSaveItem } from './index';

const helper = new PlansHelper();

/** Bitrix id всех сотрудников структуры (планы читаем для всех видимых). */
const structureUserIds = (
    items: { ID?: string | number }[] | undefined,
): number[] =>
    [...new Set((items ?? []).map(item => Number(item?.ID)).filter(id => id > 0))];

/**
 * Ленивая загрузка планов (idle-guard): каталог+конфиг портала и цели
 * сотрудников видимой структуры. Публичная /share и выключенная фича —
 * не грузим (блоки и так скрыты гейтами).
 */
export const loadPlansData = (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    if (state.plans.status !== 'idle') return;
    if (!state.app.domain || state.app.isPublic) return;
    if (!checkAccess(EAccessFeature.PLANS_VIEW, selectAccessContext(state))) {
        return;
    }

    dispatch(plansActions.loading());
    try {
        const { catalog, config } = await helper.getConfig(state.app.domain);
        const hasEnabled = config.indicators.some(item => item.enabled);
        // Цели тянем только если планы вообще настроены на портале.
        const targetsByUser = hasEnabled
            ? await helper.getTargets(
                  state.app.domain,
                  structureUserIds(getState().department.items),
              )
            : {};
        dispatch(plansActions.ready({ catalog, config, targetsByUser }));
    } catch {
        dispatch(plansActions.error());
    }
};

/**
 * Сохранение из диалога настроек (только PLANS_CONFIGURE — гейт UI +
 * повторная проверка здесь): конфиг портала + изменённые цели, затем
 * перечитка целей (правда из Bitrix).
 */
export const savePlans =
    (
        config: PlansConfig,
        targets: PlanTargetSaveItem[],
    ): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const ctx = selectAccessContext(state);
        if (!state.app.domain || state.app.isPublic) return false;
        if (!checkAccess(EAccessFeature.PLANS_CONFIGURE, ctx)) return false;

        dispatch(plansActions.saving());
        try {
            const savedConfig = await helper.saveConfig(
                state.app.domain,
                config,
            );
            await helper.saveTargets(state.app.domain, targets);
            const targetsByUser = await helper.getTargets(
                state.app.domain,
                structureUserIds(getState().department.items),
            );
            dispatch(
                plansActions.saved({ config: savedConfig, targetsByUser }),
            );
            return true;
        } catch (error) {
            dispatch(
                plansActions.saveError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить планы',
                ),
            );
            return false;
        }
    };
