import type { RelatedDeal } from '../model';

/**
 * Правило владения сделкой (задача владельца 2508: автопереключение только
 * на СВОЮ сделку).
 *
 * «Своя» — ответственный совпадает с пользователем фрейма. Fail-open в обе
 * стороны неизвестности:
 *  - пользователь фрейма неизвестен (dev вне фрейма, бут) — правило выключено,
 *    все сделки считаются своими: лучше прежнее поведение, чем пустая шапка;
 *  - у сделки не пришёл ответственный (привязки задач из портального
 *    дозапроса `responsible` не возят) — считаем своей: привязанные к СВОЕЙ
 *    задаче сделки и есть сделки текущей работы.
 */
export const isOwnDeal = (
    deal: RelatedDeal,
    userId: number | null | undefined,
): boolean => {
    const uid = Number(userId ?? 0);
    if (!uid) return true;
    const responsibleId = Number(deal.responsible?.id ?? 0);
    if (!responsibleId) return true;
    return responsibleId === uid;
};
