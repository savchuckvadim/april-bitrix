import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { documentProvidertAC } from '@/modules/entities/provider';
import { applySetTaxChange, rowSetActions } from '@/modules/entities/row-set';
import type { AppDispatch, RootState } from '../store';

/**
 * Смена поставщика → массовый пересчёт налога ×1.05/÷1.05 по всем сетам
 * (легаси changeProviderTax): LIC и бесплатные строки пропускаются,
 * ручные скидки сохраняются, слепки не пересобираются по каталогу.
 * Живёт в слое приложения: row-set о поставщике не знает, у публичной версии
 * поставщика нет.
 */
export function setupProviderTaxListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
        matcher: isAnyOf(
            documentProvidertAC.setCurrent,
            documentProvidertAC.setFetched,
        ),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const nowTaxed = Boolean(state.documentProvider.current?.withTax);
            const wasTaxed = state.rowSet.context.withTax;
            if (nowTaxed === wasTaxed) return;

            const { catalog } = state.catalog;
            listenerApi.dispatch(rowSetActions.setWithTax(nowTaxed));
            for (const set of [
                state.rowSet.general,
                ...state.rowSet.alternative,
            ]) {
                if (!set.rows.length) continue;
                listenerApi.dispatch(
                    rowSetActions.writeSyncedSet(
                        applySetTaxChange(set, catalog, wasTaxed, nowTaxed),
                    ),
                );
            }
        },
    });
}
