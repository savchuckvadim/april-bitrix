import { Bitrix, flattenBatchResults } from '@workspace/bitrix';
import { runExclusiveBatch } from '@/modules/app/lib/utills/bitrix-batch-queue';
import { uniqueIds } from './contact-sources';

/**
 * Батч-транспорт сбора контактов: один callBatch вместо последовательных
 * запросов по каждому источнику.
 *
 * ⚠️ cmdBatch — ОБЩЕЕ мутируемое поле синглтона BitrixService: два
 * параллельных callBatch перемешали бы команды. Отсюда два правила этого
 * модуля:
 *  1) наполнение cmdBatch и отправка идут строго синхронно, без await между
 *     ними (`fill` обязан быть синхронным);
 *  2) отправки выстроены в очередь — сбор контактов зовут три листенера
 *     почти одновременно (портал загружен, задачи приехали, компания
 *     появилась позже), и без очереди их батчи толкались бы локтями в одном
 *     cmdBatch.
 */

/** Страница crm.contact.list: больше 50 id в один фильтр не кладём. */
export const CONTACT_PAGE_SIZE = 50;

/** Команд в одном callBatch не больше 50 — дальше следующий батч. */
export const BATCH_CMD_LIMIT = 50;

/** Команды батча сбора: по этим же именам разбирается ответ. */
export const CONTACT_CMD = {
    /** crm.company.contact.items.get текущей компании. */
    COMPANY_ITEMS: 'contact_company_items',
    /** crm.deal.contact.items.get текущей сделки. */
    DEAL_ITEMS: 'contact_deal_items',
    /** crm.lead.list по лидам сделки и привязок задачи (ID, CONTACT_ID). */
    RELATED_LEADS: 'contact_related_leads',
    /** Чанк crm.contact.list: contact_page_0, contact_page_1, … */
    CONTACT_PAGE: 'contact_page_',
} as const;

export type ContactBitrix = ReturnType<typeof Bitrix.getService>;

/**
 * Наполнить cmdBatch и отправить ОДНИМ callBatch.
 *
 * `fill` синхронно добавляет команды через `bitrix.batch.*` и возвращает их
 * число (0 — в сеть не ходим). Ответ — плоская мапа cmd → значение
 * (одинаково во фрейме и в dev-режиме через бэк, см. flattenBatchResults).
 */
export const runContactBatch = async (
    fill: (bitrix: ContactBitrix) => number,
): Promise<Record<string, unknown>> => {
    // Общая очередь сериализует ВСЕХ пользователей cmdBatch (контакты,
    // история) и вычищает свои ключи при падении отправки — см.
    // bitrix-batch-queue.
    const raw = await runExclusiveBatch(fill);
    return Object.keys(raw).length
        ? flattenBatchResults(raw as never)
        : {};
};

/**
 * Значение команды батча → массив строк.
 *
 * Форма зависит от транспорта: во фрейме значение бывает голым массивом,
 * через обёртку — `{ result: [...] }`; битое или пустое значение отдаёт
 * пустой массив (гварды пустых ответов сущностей — как у одиночных вызовов).
 */
export const batchRows = (raw: unknown): unknown[] => {
    if (Array.isArray(raw)) return raw;
    const wrapped = (raw as { result?: unknown } | null | undefined)?.result;
    return Array.isArray(wrapped) ? wrapped : [];
};

/** id контактов из строк с CONTACT_ID (contact.items.get, crm.lead.list). */
export const contactIdsOfRows = (raw: unknown): number[] =>
    uniqueIds(
        batchRows(raw).map(row =>
            Number((row as { CONTACT_ID?: unknown } | null)?.CONTACT_ID),
        ),
    );
