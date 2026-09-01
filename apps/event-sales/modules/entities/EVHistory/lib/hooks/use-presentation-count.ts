'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { loadEventSalesHistory } from '../../model/EVHistoryThunk';
import { countDonePresentations } from '../presentation-count';

/**
 * Счётчик проведённых презентаций для постоянной шапки.
 *
 * История грузится лениво — по первому показу секции (Б5), но бейдж живёт
 * в шапке и виден с первого кадра: без собственного триггера он молчал бы,
 * пока менеджер сам не доскроллит до карточки «История» (на широком борде
 * она третья в колонке и в типовой вьюпорт не попадает), а на встройках
 * ниже фолда родительской страницы — вечно. Поэтому бейдж сам заказывает
 * историю тем же thunk'ом: status-гварды не дадут второго запроса, когда
 * секция всё же покажется, а details он берёт из стора листенера RelatedCrm
 * — дубля `/duplicates/details` тоже нет. Ленивость Б5 сохраняется там, где
 * бейджа нет: на компактных встройках EntityBar не рендерится вовсе (гейт
 * в EntityHeader).
 *
 * Ждём слепок портала: без него thunk принял бы «портал ещё не пришёл» за
 * «списка нет» и застолбил isListMissing до ручного повтора. Обычно слепок
 * приходит из кэша ДО setAppData, так что ожидание ничего не задерживает.
 */
export const usePresentationCount = (): number => {
    const dispatch = useAppDispatch();
    const records = useAppSelector(s => s.eventHistory.records);
    const hasPortal = useAppSelector(s => !!s.portal.portal);

    useEffect(() => {
        if (!hasPortal) return;
        dispatch(loadEventSalesHistory());
    }, [dispatch, hasPortal]);

    return countDonePresentations(Object.values(records));
};
