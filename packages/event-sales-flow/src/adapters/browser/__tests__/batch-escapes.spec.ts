/**
 * ОДИН ОТЧЁТ — ОДНО СОДЕРЖИМОЕ ПОЛЯ, КТО БЫ ЕГО НИ ИСПОЛНИЛ.
 *
 * Флоу — один и тот же код на сервере и во вкладке, но провода под ним
 * РАЗНЫЕ, и экранирование — свойство провода:
 *  - БЭК склеивает query-строку `cmd` руками и вклеивает значения СЫРЫМИ
 *    (`BatchApiService.dictToQueryString`), поэтому текст обязан приехать
 *    туда уже в batch-виде (`toBatchSafeText`);
 *  - ВКЛАДКА ВО ФРЕЙМЕ отдаёт команды b24jssdk, а тот строит строку сам —
 *    `qs.stringify(command.query)` с `encode: true`
 *    (`core/interaction/batch/processing/v2/abstract-processing.mjs`).
 *    Без снятия batch-вида `%` уехал бы как `%25`, Битрикс декодировал бы
 *    один раз, и в поле легло бы ЛИТЕРАЛЬНОЕ `%0A` вместо переноса;
 *  - ВКЛАДКА ВНЕ ФРЕЙМА (dev/standalone) уходит на бэк-прокси, который
 *    склеивает строку сам и сырыми значениями — то есть ведёт себя как бэк.
 *
 * Поэтому проверяем не «значение непустое», а СХОДИМОСТЬ: прогоняем один и
 * тот же набор полей через модель проводов и сверяем, что Битрикс сохранит
 * ОДИН И ТОТ ЖЕ текст — ровно тот, который набрал менеджер.
 *
 * `backWire`/`sdkWire`/`bitrixParse` ниже — модель проводов, а не их код:
 * склейка повторяет обе реализации построчно, разбор — единственный проход
 * url-декодирования на стороне Битрикса.
 */
import { describe, expect, it, vi } from 'vitest';

const { getServiceMock } = vi.hoisted(() => ({ getServiceMock: vi.fn() }));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: getServiceMock },
}));

import type { BitrixService } from '@workspace/bitrix';
import {
    BitrixFlowTransport,
    decodeBatchEscapedText,
} from '../bitrix-flow-transport';
import { toBatchSafeText, toBatchText } from '../../../shared/batch/batch-text';
import { EventReportEntityFieldsModel } from '../../../services/entity/event-report-entity-fields.model';
import { EEventReportEntityType } from '../../../services/init/event-report-init.types';
import { normalizePresentationSurvey } from '../../../shared/presentation-survey';

const XVOST = 'UF_CRM_OP_PRESENTATION_XVOST';
const CLIENT_BLOCK = 'UF_CRM_OP_5K_CLIENT';

/**
 * Ответ менеджера со всеми четырьмя опасными символами: `&` режет
 * query-строку на параметры, `+` декодируется пробелом, `%` открывает
 * escape-последовательность, перенос доезжает подчёркиванием.
 */
const XVOST_ANSWER =
    'Сравнивают с Гарантом & КонсультантПлюс\nскидка 50% при оплате\nтел. +7 900 123-45-67';
const CLIENT_ANSWER = 'Хочет замену\nбюджет 100% + НДС';

/** Портал: анкета заведена на лиде. */
const makePortal = () => ({
    getTimezone: () => 'Europe/Moscow',
    getEntityFieldByCode: (entity: string, code: string) => {
        const isSurvey =
            code === 'op_presentation_xvost' ||
            code === 'op_presentation_5k' ||
            code.startsWith('op_5k_') ||
            code.startsWith('op_xvost_');
        if (!isSurvey || entity !== 'lead') return undefined;
        return { bitrixId: code.toUpperCase(), items: [] };
    },
    getFieldBitrixId: (field: { bitrixId: string }) =>
        `UF_CRM_${field.bitrixId}`,
    getPortal: () => ({ domain: 'd.b24.ru' }),
});

/** Контекст отчёта: анкета проведённой презентации из payload. */
const makeCtx = () => ({
    isPresentationDone: true,
    presentationSurvey: normalizePresentationSurvey({
        xvost: XVOST_ANSWER,
        fiveK: { op_5k_client: CLIENT_ANSWER },
    }),
});

/** Поля анкеты ровно в том виде, в каком их отдаёт флоу обоим проводам. */
const surveyFields = (): Record<string, string> =>
    new EventReportEntityFieldsModel(
        makePortal() as never,
        makeCtx() as never,
        EEventReportEntityType.LEAD,
    ).toPresentationSurveyFields() as Record<string, string>;

/**
 * Фейк BitrixService: batch.lead.update кладёт команду в cmdBatch так же,
 * как addCmdBatchType (структурой `{ method, params }`).
 */
const makeService = (inFrame: boolean) => {
    const cmdBatch: Record<string, { method: string; params: unknown[] }> = {};
    const service = {
        api: {
            getInitializedData: () => ({ inFrame }),
            getCmdBatch: () => cmdBatch,
            callBatch: async () => ({}),
        },
        batch: {
            lead: {
                update: (...args: unknown[]) => {
                    cmdBatch[String(args[0])] = {
                        method: 'crm.lead.update',
                        params: args.slice(1),
                    };
                },
            },
        },
    };
    return { cmdBatch, service: service as unknown as BitrixService };
};

/** Что реально уходит в нижележащий провод после транспорта. */
const handedToWire = (inFrame: boolean): Record<string, string> => {
    const { cmdBatch, service } = makeService(inFrame);
    const transport = new BitrixFlowTransport({ service });
    transport.batch.lead.update('survey_lead_42', 42, surveyFields() as never);
    return cmdBatch.survey_lead_42.params[1] as Record<string, string>;
};

/** БЭКОВЫЙ провод: `${key}=${value}` сырыми, join('&'). */
const backWire = (params: Record<string, string>): string =>
    Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

/** Провод b24jssdk: qs.stringify с encode: true — кодирует значения сам. */
const sdkWire = (params: Record<string, string>): string =>
    Object.entries(params)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join('&');

/** Разбор на стороне Битрикса: ровно один проход url-декодирования. */
const bitrixParse = (query: string): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const part of query.split('&')) {
        const eq = part.indexOf('=');
        if (eq < 0) continue;
        out[decodeURIComponent(part.slice(0, eq))] = decodeURIComponent(
            part.slice(eq + 1).replace(/\+/g, ' '),
        );
    }
    return out;
};

describe('Снятие batch-экранирования: обратное toBatchSafeText', () => {
    it.each([
        'Гарант & КонсультантПлюс',
        'скидка 50% при оплате',
        'тел. +7 900 123-45-67',
        'первая строка\nвторая строка',
        'CRLF\r\nтоже перенос'.replace('\r\n', '\n'),
        // Литералы, которые менеджер набрал руками: экранирование их
        // удваивает, снятие обязано вернуть ровно их же.
        '%0A',
        '%25',
        '%2B',
        '%26',
        'смесь: 100%25 & %0A + конец',
    ])('«%s» переживает экранирование и снятие без потерь', text => {
        expect(decodeBatchEscapedText(toBatchSafeText(text))).toBe(text);
    });

    /*
     * Слабый вариант экранирует только переносы — снятие обязано быть
     * обратным и ему, иначе комментарии и история поехали бы с
     * литеральными `%0A`.
     */
    it('снимает и слабое экранирование (toBatchText)', () => {
        expect(decodeBatchEscapedText(toBatchText('строка 1\nстрока 2'))).toBe(
            'строка 1\nстрока 2',
        );
    });

    it('не трогает то, чего не экранировали: $result-чейны и id', () => {
        expect(decodeBatchEscapedText('$result[add_deal][ID]')).toBe(
            '$result[add_deal][ID]',
        );
    });
});

describe('Прямой путь пишет в поле то же, что и сервер', () => {
    it('во фрейме транспорт отдаёт SDK ПЛОСКИЙ текст — SDK кодирует сам', () => {
        const params = handedToWire(true);

        // Ровно то, что набрал менеджер: ни одного нашего escape'а.
        expect(params[XVOST]).toBe(XVOST_ANSWER);
        expect(params[CLIENT_BLOCK]).toBe(CLIENT_ANSWER);
    });

    it('вне фрейма (бэк-прокси клеит строку сам) экранирование остаётся', () => {
        const params = handedToWire(false);

        // Провод там бэковый: значение обязано приехать уже в batch-виде.
        expect(params[XVOST]).toBe(surveyFields()[XVOST]);
        expect(params[XVOST]).not.toContain('&');
        expect(params[XVOST]).not.toMatch(/[\r\n]/);
    });

    /*
     * Главная проверка замечания: три исполнителя одного отчёта — сервер,
     * вкладка во фрейме, вкладка вне фрейма — обязаны оставить в поле ОДИН
     * И ТОТ ЖЕ текст. Сверка после моделируемого декодирования Битриксом,
     * то есть по тому, что реально ляжет в карточку.
     */
    it('сервер, фрейм и standalone кладут в поле одинаковый текст', () => {
        const onServer = bitrixParse(backWire(surveyFields()));
        const inFrame = bitrixParse(sdkWire(handedToWire(true)));
        const standalone = bitrixParse(backWire(handedToWire(false)));

        expect(onServer[XVOST]).toBe(XVOST_ANSWER);
        expect(onServer[CLIENT_BLOCK]).toBe(CLIENT_ANSWER);
        expect(inFrame).toEqual(onServer);
        expect(standalone).toEqual(onServer);
    });

    /*
     * Регресс на двойное кодирование: отдай мы SDK batch-вид как есть, `%`
     * уехал бы как `%25`, и в поле легло бы литеральное `%0A` вместо
     * переноса — расхождение, видимое менеджеру прямо в карточке.
     */
    it('двойного кодирования нет: в поле переносы, а не литералы %0A', () => {
        const inFrame = bitrixParse(sdkWire(handedToWire(true)));

        expect(inFrame[XVOST]).toContain('\n');
        expect(inFrame[XVOST]).not.toContain('%0A');
        expect(inFrame[XVOST]).toContain('&');
        expect(inFrame[XVOST]).toContain('+7 900');
    });
});
