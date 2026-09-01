import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import { toCrmDate, toDateInputValue } from '@/modules/shared/lib/crm-date';

/**
 * Хвост-поля сделки (опросник после презентации) — данные и преобразования,
 * без UI.
 *
 * Штатно эти поля пишет CheckPresentation после проведённой презентации;
 * ручная карточка в модалке «Поля сущности» — для исключений (презентацию
 * закрыли мимо опросника, договорённость изменилась задним числом). Коды —
 * из реестра pbx-data; по владельческой таблице install (todo2508) весь
 * блок стоит ТОЛЬКО на сделке, поэтому и запись deal-only.
 *
 * С переделки 01.09.2026 от блока осталась одна дата: три галочки стали
 * частью текстового «ЧТО ПРЕДЛОЖИЛИ», а «согласование даты» и «дата похода
 * к руководителю» из состава ушли.
 */

export const XVOST_DATE_FIELDS = [
    {
        code: PBX_SALES_EVENT_FIELD_CODES.op_xvost_decision_call_date,
        label: 'Дата звонка по решению',
    },
] as const;

/*
 * Галочек в блоке больше нет (переделка 01.09.2026): «КП предложено»,
 * «наполнение озвучено» и «цена озвучена» растворились в связном тексте
 * «ЧТО ПРЕДЛОЖИЛИ» — сменился и смысл, и тип поля. Вместе с ними ушло и
 * понятие флага: пустой список типизировался бы как `never` и ломал бы
 * потребителей, а мёртвый код здесь никому не нужен. Вернётся флаг —
 * вернётся и список.
 */

export type XvostDateCode = (typeof XVOST_DATE_FIELDS)[number]['code'];
export type XvostFieldCode = XvostDateCode;

/**
 * `YYYY-MM-DD` для `<input type=date>` из того, что отдал портал —
 * общий нормализатор (`modules/shared/lib/crm-date`), тот же, что у
 * чек-листа и опросника.
 */
export const toInputDate = toDateInputValue;

/**
 * Значение контрола → значение портального поля. Даты уходят каноном CRM
 * (`DD.MM.YYYY`), флаги — своим диалектом `Y/N`. Пустая строка стирает поле
 * (здесь это осознанное действие: карточка правится вручную).
 * `null` — дата не разобралась, писать нечего.
 */
export const toXvostPortalValue = (
    code: XvostFieldCode,
    value: string,
): string | null => {
    if (!value) return '';
    return toCrmDate(value);
};


/**
 * Портальное значение ручной правки → значение ответа опросника
 * (id вопроса = код поля): даты едут той же строкой `YYYY-MM-DD`. Нужен для
 * синхронизации ручной записи в стор опросника, чтобы повторный submit не
 * откатывал правку.
 */
export const xvostToAnswerValue = (
    _code: XvostFieldCode,
    portalValue: string,
): string => portalValue;
