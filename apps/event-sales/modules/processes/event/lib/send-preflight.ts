import type { RootState } from '@/modules/app/model/store';
import { getCrmLinksFromRaw } from '@/modules/entities/EventTask/lib/task-links';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { isLeadMarkComplete } from '@/modules/features/LeadMarks/lib/lead-marks-view';
import { EV_ERROR_CODE } from '../types/event-types';
import { validateSend } from './send-validation';

/**
 * Что осталось заполнить перед отправкой — данными, для окна предпроверки.
 *
 * Валидация и раньше находила пустое, но сообщала об этом у самих полей — а
 * поля разбросаны по экрану, и статус компании стоит далеко от кнопки
 * «Отправить». Менеджер видел, что отправка не идёт, и не видел почему.
 * Окно собирает всё незаполненное в одном месте с РОДНЫМИ контролами:
 * заполнил — и отчёт уходит сразу, без второго нажатия.
 */

/** Какой контрол показать в окне по каждому пропуску. */
export type PreflightItemKind =
    | 'comment'
    | 'planName'
    | 'planType'
    | 'planDeadline'
    | 'postFailDate'
    | 'notCaType'
    | 'planChecklist'
    | 'companyColor'
    | 'leadMarks'
    /** Исправить в окне нельзя — только объяснить (продажа без компании). */
    | 'blocked';

export interface PreflightItem {
    kind: PreflightItemKind;
    label: string;
    /** Пояснение, когда контрола нет и человек должен уйти чинить в другое место. */
    hint?: string;
}

/**
 * Реестр пунктов окна: вид → подпись. Единственное место, где они описаны —
 * окно восстанавливает пункт по одному лишь `kind`, поэтому тексты не должны
 * жить в вёрстке.
 */
export const PREFLIGHT_ITEMS: Record<PreflightItemKind, PreflightItem> = {
    blocked: {
        kind: 'blocked',
        label: 'Продажа без компании',
        hint: 'Привяжите компанию к сделке — без неё сделка продажи не создастся.',
    },
    planType: { kind: 'planType', label: 'Тип звонка' },
    planName: { kind: 'planName', label: 'О чём договорились' },
    planDeadline: {
        kind: 'planDeadline',
        label: 'Срок следующего события',
        hint: 'Без срока задача не создаётся — клиент останется без следующего шага.',
    },
    postFailDate: { kind: 'postFailDate', label: 'Дата следующего звонка' },
    notCaType: {
        kind: 'notCaType',
        label: 'Тип «не ЦА»',
        hint: 'Почему клиент не целевой: без типа сделка не уедет в стадию «не ЦА».',
    },
    planChecklist: {
        kind: 'planChecklist',
        label: 'Чек-лист звонка',
        hint: 'Обязательные поля выбранного типа звонка — те же, что в колонке плана.',
    },
    comment: { kind: 'comment', label: 'Комментарий' },
    leadMarks: {
        kind: 'leadMarks',
        label: 'Заявки не закрыты',
        hint: 'Продажа и отказ закрывают судьбу заявок: отметьте статус каждой (у «не ЦА» — ещё и тип).',
    },
    companyColor: {
        kind: 'companyColor',
        label: 'Прогноз по компании',
        hint: 'Портал требует обновить прогноз при каждом результативном отчёте.',
    },
};

/** Ошибка валидации → пункт окна. Порядок = порядок в окне: сверху статусные. */
const ERROR_TO_ITEM: Partial<Record<EV_ERROR_CODE, PreflightItem>> = {
    [EV_ERROR_CODE.WORK_STATUS]: PREFLIGHT_ITEMS.blocked,
    [EV_ERROR_CODE.PLAN_TYPE]: PREFLIGHT_ITEMS.planType,
    [EV_ERROR_CODE.PLAN_NAME]: PREFLIGHT_ITEMS.planName,
    [EV_ERROR_CODE.PLAN_DEADLINE]: PREFLIGHT_ITEMS.planDeadline,
    [EV_ERROR_CODE.POST_FAIL_DATE]: PREFLIGHT_ITEMS.postFailDate,
    [EV_ERROR_CODE.NOT_CA_TYPE]: PREFLIGHT_ITEMS.notCaType,
    [EV_ERROR_CODE.PLAN_CHECKLIST]: PREFLIGHT_ITEMS.planChecklist,
    [EV_ERROR_CODE.COMMENT]: PREFLIGHT_ITEMS.comment,
};

export interface PreflightResult {
    items: PreflightItem[];
    /** Отправлять можно прямо сейчас. */
    isReady: boolean;
}

/** Лиды дела: контекстный плюс привязки задачи (L_xxx). */
const getReportLeadIds = (state: RootState): number[] => {
    const contextLeadId = Number(state.app.bitrix.lead?.ID ?? 0);
    const taskLeadIds = getCrmLinksFromRaw(
        state.eventTask.current?.ufCrmTask,
    ).leadIds;
    return [...new Set([contextLeadId, ...taskLeadIds].filter(id => id > 0))];
};

/**
 * Продажа, отказ и «не ЦА» обязаны закрывать судьбу связанных заявок: статус
 * («взята», «не ЦА»…), а у «не ЦА» — ещё и тип. Иначе заявка навсегда
 * остаётся «в воздухе», и отчётность по заявкам не сходится с продажами.
 *
 * Пометки грузятся лениво — пока не загружены, считаем незакрытыми:
 * окно предпроверки само их подтянет (LeadMarksList). Ошибка загрузки
 * НЕ блокирует отправку: наказывать менеджера за упавший запрос нельзя.
 */
export const hasIncompleteLeadMarks = (state: RootState): boolean => {
    const workStatus =
        state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code;
    if (
        workStatus !== 'success' &&
        workStatus !== 'fail' &&
        workStatus !== 'notCa'
    ) {
        return false;
    }

    const leadIds = getReportLeadIds(state);
    if (!leadIds.length) return false;
    if (state.leadMarks.status === 'error') return false;

    return leadIds.some(id => {
        const mark = state.leadMarks.byId[id];
        return !mark || !isLeadMarkComplete(mark);
    });
};

export const getSendPreflight = (state: RootState): PreflightResult => {
    const { result, isColorRequiredError } = validateSend(state);

    const items = Object.entries(result.errors)
        .filter(([, message]) => Boolean(message))
        .map(([code]) => ERROR_TO_ITEM[code as EV_ERROR_CODE])
        .filter((item): item is PreflightItem => Boolean(item));

    if (hasIncompleteLeadMarks(state)) items.push(PREFLIGHT_ITEMS.leadMarks);
    if (isColorRequiredError) items.push(PREFLIGHT_ITEMS.companyColor);

    return { items, isReady: items.length === 0 };
};

/**
 * Незакрытые пункты одной строкой — для подписки окна.
 *
 * Окно не может селектить сам результат: `getSendPreflight` собирает новый
 * объект на каждый вызов, и диалог перерисовывался бы на каждое нажатие
 * клавиши. Строка сравнивается по значению, поэтому рендер случается ровно
 * тогда, когда набор незаполненного реально изменился.
 */
export const getPreflightKindsKey = (state: RootState): string =>
    getSendPreflight(state)
        .items.map(item => item.kind)
        .join(',');
