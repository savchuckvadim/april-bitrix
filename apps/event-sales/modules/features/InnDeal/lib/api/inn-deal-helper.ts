import { customAxios } from '@workspace/nest-event-sales-api';
import { withRetry } from '@/modules/shared/lib/with-retry';
import type {
    InnChooseRequest,
    InnHideRequest,
    InnSnapshot,
} from '../../model';

/** Префикс ручек ИНН на бэке event-sales. */
const INN_URL = '/api/inn/deal';

/**
 * Единственное место слайса, которое знает про транспорт.
 *
 * Клиент из orval для этих ручек ещё не сгенерирован (генерация требует
 * поднятого бэка), поэтому вызовы идут тем же мутатором `customAxios`, что
 * и весь пакет: базовый адрес и разбор конверта `{resultCode, data}` — его
 * работа. После `pnpm run generate` тела методов заменятся вызовами
 * `getInn()`, а сигнатуры останутся прежними.
 */
export class InnDealHelper {
    /** Снимок ИНН сделки: текущий, кандидаты, реквизиты, расхождения. */
    async getSnapshot(domain: string, dealId: number): Promise<InnSnapshot> {
        return withRetry(() =>
            customAxios<InnSnapshot>({
                url: `${INN_URL}/${dealId}`,
                method: 'GET',
                params: { domain },
            }),
        );
    }

    /**
     * Выбрать текущий ИНН договора. Без `withRetry`: запись оставляет след в
     * таймлайне, и повтор после ответа 409 только запутал бы историю.
     */
    async choose(
        dealId: number,
        request: InnChooseRequest,
    ): Promise<InnSnapshot> {
        return customAxios<InnSnapshot>({
            url: `${INN_URL}/${dealId}/choose`,
            method: 'POST',
            data: request,
        });
    }

    /** Скрыть вариант («это не наш ИНН») или вернуть его обратно. */
    async hide(dealId: number, request: InnHideRequest): Promise<InnSnapshot> {
        return customAxios<InnSnapshot>({
            url: `${INN_URL}/${dealId}/hide`,
            method: 'POST',
            data: request,
        });
    }
}
