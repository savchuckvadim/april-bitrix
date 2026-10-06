'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { countDonePresentations } from '../presentation-count';

/**
 * Счётчик проведённых презентаций для постоянной шапки.
 *
 * Считается по уже загруженной истории и сам её НЕ заказывает (владелец,
 * 05.10.2026). Раньше бейдж запускал загрузку истории на каждом открытии
 * широкой встройки: пачка запросов в Битрикс по всем привязкам клиента плюс
 * граф связей — ради одной цифры в шапке, при том что фрейм открывают на
 * каждый звонок. Теперь цифра появляется, когда менеджер сам открыл
 * «Историю»; до этого бейджа нет (ноль не показываем — см. бейдж).
 */
export const usePresentationCount = (): number => {
    const records = useAppSelector(s => s.eventHistory.records);

    return countDonePresentations(Object.values(records));
};
