import { getKonstructorDeal } from '@workspace/nest-konstructor-api';

type InnerDealApi = ReturnType<typeof getKonstructorDeal>;
type FindParams = Parameters<InnerDealApi['innerDealFind']>[0];
type FindResult = Awaited<ReturnType<InnerDealApi['innerDealFind']>>;

const inFlight = new Map<string, Promise<FindResult>>();

const keyOf = (params: FindParams): string =>
    `${params.domain}:${params.dealId}:${params.serviceSmartId ?? ''}`;

/**
 * Запись сделки по домену и номеру. На входе её спрашивают двое разом —
 * восстановление слепка и настройки вариантов: пока первый запрос в пути,
 * второй такой же к нему присоединяется. Ответ не запоминается: следующий
 * запрос после ответа идёт на сервер, так что устареть тут нечему.
 */
export const findInnerDeal = (params: FindParams): Promise<FindResult> => {
    const key = keyOf(params);
    const pending = inFlight.get(key);
    if (pending) return pending;

    const request = getKonstructorDeal()
        .innerDealFind(params)
        .finally(() => {
            if (inFlight.get(key) === request) inFlight.delete(key);
        });
    inFlight.set(key, request);
    return request;
};
