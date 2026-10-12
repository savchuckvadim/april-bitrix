/**
 * ЕДИНСТВЕННЫЙ источник русских подписей для критериев подбора шаблонов
 * (договор / счёт / отчёт о поставке / Word КП).
 *
 * В проекте нет слоя i18n, поэтому подписи живут здесь, а не в каждой сущности.
 * Любая новая сущность шаблонов импортирует эти карты из
 * `@/modules/entities/konstructor/lib` и НЕ создаёт свою копию.
 *
 * Значения кодов совпадают со сгенерированными enum`ами konstructor-бэка
 * (`ContractLtype`, `DocumentSupplyReportGenerateDtoClientType`), поэтому
 * `satisfies` ниже ловит расхождение на этапе компиляции.
 */
import { ContractLtype } from '@workspace/nest-konstructor-api';

/** Тип договора (`contract_type` / `ltype`). */
export type ContractLtypeCode = 'service' | 'abon' | 'lic' | 'key';

/** Тип клиента (`client_types[]`). */
export type ClientTypeCode = 'org_state' | 'org' | 'ip' | 'fiz' | 'advokat';

/** Вид размещения / поставки (`supply_types[]`). */
export type SupplyTypeCode = 'internet' | 'proxima';

/** Подписи типов договора. */
export const CONTRACT_LTYPE_LABELS: Record<ContractLtypeCode, string> = {
    service: 'Договор услуг',
    abon: 'Абонентский',
    lic: 'Лицензионный',
    key: 'Передача ключа доступа',
};

/** Подписи типов клиента. */
export const CLIENT_TYPE_LABELS: Record<ClientTypeCode, string> = {
    org_state: 'Бюджетная организация',
    org: 'Организация',
    ip: 'ИП',
    fiz: 'Физлицо',
    advokat: 'Адвокатское образование',
};

/** Подписи видов размещения. */
export const SUPPLY_TYPE_LABELS: Record<SupplyTypeCode, string> = {
    internet: 'Интернет',
    proxima: 'Проксима',
};

/**
 * Коды типов договора в порядке отображения. Привязаны к сгенерированному
 * `ContractLtype`: если бэк добавит вариант, а карту подписей забудут
 * дополнить — упадёт `tsc`, а не прод.
 */
export const CONTRACT_LTYPE_CODES = [
    ContractLtype.service,
    ContractLtype.abon,
    ContractLtype.lic,
    ContractLtype.key,
] as const satisfies readonly ContractLtypeCode[];

/** Коды типов клиента в порядке отображения. */
export const CLIENT_TYPE_CODES = [
    'org_state',
    'org',
    'ip',
    'fiz',
    'advokat',
] as const satisfies readonly ClientTypeCode[];

/** Коды видов размещения в порядке отображения. */
export const SUPPLY_TYPE_CODES = ['internet', 'proxima'] as const satisfies readonly SupplyTypeCode[];

/** Опция для `FormFieldRenderer` (`select` / `multiselect`). */
export interface TemplateCriteriaOption {
    value: string;
    label: string;
}

/** Опции select`а «Тип договора». */
export const CONTRACT_LTYPE_OPTIONS: TemplateCriteriaOption[] = CONTRACT_LTYPE_CODES.map(
    (code) => ({ value: code, label: CONTRACT_LTYPE_LABELS[code] }),
);

/** Опции multiselect`а «Типы клиента». */
export const CLIENT_TYPE_OPTIONS: TemplateCriteriaOption[] = CLIENT_TYPE_CODES.map((code) => ({
    value: code,
    label: CLIENT_TYPE_LABELS[code],
}));

/** Опции multiselect`а «Виды размещения». */
export const SUPPLY_TYPE_OPTIONS: TemplateCriteriaOption[] = SUPPLY_TYPE_CODES.map((code) => ({
    value: code,
    label: SUPPLY_TYPE_LABELS[code],
}));

/** Подпись типа договора; неизвестный код показываем как есть. */
export const getContractLtypeLabel = (code: string | null | undefined): string =>
    code ? (CONTRACT_LTYPE_LABELS[code as ContractLtypeCode] ?? code) : '—';

/** Подпись типа клиента; неизвестный код показываем как есть. */
export const getClientTypeLabel = (code: string): string =>
    CLIENT_TYPE_LABELS[code as ClientTypeCode] ?? code;

/** Подпись вида размещения; неизвестный код показываем как есть. */
export const getSupplyTypeLabel = (code: string): string =>
    SUPPLY_TYPE_LABELS[code as SupplyTypeCode] ?? code;

/**
 * Пустой список критериев = «подходит любому» (на бэке NULL).
 * Поэтому `[]`/`null`/`undefined` рисуем одинаково, а не как «ничего не выбрано».
 */
export const ANY_CRITERIA_LABEL = 'Любой';

/** Строка для таблицы/карточки: список подписей либо «Любой». */
export function formatCriteriaList(
    codes: readonly string[] | null | undefined,
    toLabel: (code: string) => string,
): string {
    if (!codes || codes.length === 0) {
        return ANY_CRITERIA_LABEL;
    }
    return codes.map(toLabel).join(', ');
}

/** Хелпер-текст для multiselect`ов критериев. */
export const EMPTY_CRITERIA_HELPER_TEXT =
    'Ничего не выбрано — шаблон подходит любому значению (на бэке сохраняется как «без ограничения»).';

/**
 * Уровень привязки шаблона. В БД колонки нет — из него выводятся
 * `portal_id`/`agent_id`, поэтому это чисто UI-перечисление.
 */
export type TemplateScopeCode = 'common' | 'portal' | 'provider';

/** Подписи уровней привязки. */
export const TEMPLATE_SCOPE_LABELS: Record<TemplateScopeCode, string> = {
    common: 'Общий (для всех порталов)',
    portal: 'Портальный',
    provider: 'Портальный, под поставщика',
};

/** Коды уровней привязки в порядке отображения. */
export const TEMPLATE_SCOPE_CODES = [
    'common',
    'portal',
    'provider',
] as const satisfies readonly TemplateScopeCode[];

/** Опции select`а «Уровень привязки». */
export const TEMPLATE_SCOPE_OPTIONS: TemplateCriteriaOption[] =
    TEMPLATE_SCOPE_CODES.map((code) => ({
        value: code,
        label: TEMPLATE_SCOPE_LABELS[code],
    }));

/** Подпись уровня привязки; неизвестный код показываем как есть. */
export const getTemplateScopeLabel = (code: string | null | undefined): string =>
    code ? (TEMPLATE_SCOPE_LABELS[code as TemplateScopeCode] ?? code) : '—';
