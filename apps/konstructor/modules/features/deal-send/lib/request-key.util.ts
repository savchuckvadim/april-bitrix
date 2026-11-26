import { v4 as uuidv4 } from 'uuid';

/**
 * Ключ попытки создать сделку (UUID). Бэк по нему не заводит вторую сделку:
 * повтор после обрыва связи с тем же ключом возвращает уже созданную. Новая
 * попытка после успеха получает новый ключ.
 */
export const createRequestKey = (): string => uuidv4();

/**
 * Ключ для отправки. Сделка уже есть — ключ не нужен (null). Создание: ключ
 * незавершённой попытки сохраняется для повтора, иначе заводится новый.
 */
export const resolveRequestKey = (
    dealId: number | null,
    pendingKey: string | null,
): string | null => {
    if (dealId) return null;
    return pendingKey ?? createRequestKey();
};
