/**
 * Запись ИНН на бэке: `POST /api/konstructor/inn/set`. Ручка отдаёт те же
 * правила, что `POST /api/inn/set` приложения event-sales (единственный
 * писатель `op_inn` / `op_inn_pool`, `InnManualSetService` из
 * `@lib/portal-lib/pbx-inn`): открытая сделка получает текущий ИНН и пул
 * объединением, компания поверх, запись в ленте сделки. Формы описаны руками:
 * ручка конструктора ещё не попала в orval, после `pnpm generate` правка
 * сводится к смене импорта.
 */
export interface InnSetRequest {
    domain: string;
    /** Цифры, контрольная сумма сходится. */
    inn: string;
    dealId?: number;
    companyId?: number;
    /** Кто выбрал: запись в ленте сделки. */
    userId?: number;
}

/** Куда лёг ИНН: сделка (и за ней компания), только компания или заявка. */
export type InnSetEntity = 'deal' | 'company' | 'lead';

export interface InnSetResult {
    inn: string;
    entity: InnSetEntity;
    warnings: string[];
}

/** Носитель текущего ИНН и пула: сделка или компания. */
export interface InnCarrier {
    id: number;
    /** Ключ поля `op_inn`, `UF_CRM_<bitrixId>`. */
    innKey: string;
    /** Ключ поля `op_inn_pool`; поля на портале нет — null. */
    poolKey: string | null;
    storedInn: string;
    pool: string[];
}

/** Что и куда записать, чтобы текущий реквизит и ИНН сущностей совпали. */
export interface InnSyncPlan {
    inn: string;
    request: InnSetRequest;
    deal: InnCarrier | null;
    company: InnCarrier | null;
}

/** Итог выравнивания. */
export type InnSyncResult = 'written' | 'skipped' | 'unavailable' | 'failed';
