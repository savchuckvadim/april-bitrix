/**
 * Конфигурация полей формы шаблона счёта для `FormFieldRenderer`.
 *
 * Поля критериев — `multiselect`: `FormFieldRenderer` уже умеет этот тип
 * (группа чекбоксов по `options`), своего мульти-селекта здесь не появляется.
 *
 * Опции критериев берутся из ЕДИНСТВЕННОГО словаря подписей
 * (`@/modules/entities/konstructor/lib`), а не объявляются здесь заново.
 *
 * Портал и поставщик — селекты: опции приходят из формы
 * (`usePortalOptions` / `useProviderOptions`), сама конфигурация остаётся чистой.
 */
import type { FormFieldConfig } from '@/modules/shared/ui/form-field-renderer';
import {
    CLIENT_TYPE_OPTIONS,
    EMPTY_CRITERIA_HELPER_TEXT,
    SUPPLY_TYPE_OPTIONS,
    type SelectOption,
} from '@/modules/entities/konstructor/lib';
import { INVOICE_TEMPLATE_TYPE, INVOICE_TEMPLATE_VISIBILITY } from '../model';

/** Подписи видимости. У шаблонов счетов колонка `visibility` есть. */
export const INVOICE_TEMPLATE_VISIBILITY_LABELS: Record<string, string> = {
    [INVOICE_TEMPLATE_VISIBILITY.public]: 'Общий (для всех порталов)',
    [INVOICE_TEMPLATE_VISIBILITY.portal]: 'Портал',
    [INVOICE_TEMPLATE_VISIBILITY.provider]: 'Поставщик',
};

export const INVOICE_TEMPLATE_VISIBILITY_OPTIONS = Object.entries(
    INVOICE_TEMPLATE_VISIBILITY_LABELS,
).map(([value, label]) => ({ value, label }));

/** Подписи типа файла шаблона. */
export const INVOICE_TEMPLATE_TYPE_LABELS: Record<string, string> = {
    [INVOICE_TEMPLATE_TYPE.word]: 'Word (.docx)',
    [INVOICE_TEMPLATE_TYPE.excel]: 'Excel',
    [INVOICE_TEMPLATE_TYPE.pdf]: 'PDF',
    [INVOICE_TEMPLATE_TYPE.html]: 'HTML',
    [INVOICE_TEMPLATE_TYPE.other]: 'Другой',
};

export const INVOICE_TEMPLATE_TYPE_OPTIONS = Object.entries(
    INVOICE_TEMPLATE_TYPE_LABELS,
).map(([value, label]) => ({ value, label }));

/** Подпись видимости; неизвестный код показываем как есть. */
export const getInvoiceTemplateVisibilityLabel = (
    code: string | null | undefined,
): string =>
    code ? (INVOICE_TEMPLATE_VISIBILITY_LABELS[code] ?? code) : '—';

/** Подпись типа файла; неизвестный код показываем как есть. */
export const getInvoiceTemplateTypeLabel = (
    code: string | null | undefined,
): string => (code ? (INVOICE_TEMPLATE_TYPE_LABELS[code] ?? code) : '—');

export interface InvoiceTemplateFormFieldsOptions {
    /** Портальное дерево: портал уже известен, поле не редактируется. */
    portalLocked: boolean;
    /** Показывать поле поставщика (visibility=provider). */
    showAgent: boolean;
    /** Справочник порталов для селекта. */
    portalOptions: SelectOption[];
    portalsLoading?: boolean;
    /** Поставщики выбранного портала; пусто, пока портал не выбран. */
    providerOptions: SelectOption[];
    providersLoading?: boolean;
    /** Выбран ли портал — без него поставщиков взять неоткуда. */
    hasPortal: boolean;
}

/**
 * Поля формы. Обязательность портала/поставщика зависит от выбранной
 * видимости и проверяется в `validateInvoiceTemplateScope`
 * (ошибка поля, не 400 с бэка).
 */
export const invoiceTemplateFormFields = (
    options: InvoiceTemplateFormFieldsOptions,
): FormFieldConfig[] => [
    {
        name: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Счёт на оплату',
    },
    {
        name: 'visibility',
        label: 'Видимость',
        type: 'select',
        required: true,
        options: INVOICE_TEMPLATE_VISIBILITY_OPTIONS,
        helperText:
            '«Общий» — шаблон виден всем порталам. «Портал» требует портал, «Поставщик» — ещё и поставщика.',
    },
    {
        name: 'portal_id',
        label: 'Портал',
        type: 'select',
        options: options.portalOptions,
        disabled: options.portalLocked,
        placeholder: options.portalsLoading ? 'Загружаем порталы…' : 'Выберите портал',
        helperText: options.portalLocked
            ? 'Портал определён разделом и не меняется здесь.'
            : 'Обязателен для видимости «Портал» и «Поставщик».',
    },
    ...(options.showAgent
        ? ([
              {
                  name: 'agent_id',
                  label: 'Поставщик',
                  type: 'select',
                  options: options.providerOptions,
                  disabled: !options.hasPortal,
                  placeholder: !options.hasPortal
                      ? 'Сначала выберите портал'
                      : options.providersLoading
                        ? 'Загружаем поставщиков…'
                        : 'Выберите поставщика',
                  helperText:
                      options.hasPortal && !options.providersLoading && options.providerOptions.length === 0
                          ? 'У этого портала нет поставщиков — заведите их в разделе портала.'
                          : 'Обязателен для видимости «Поставщик». Берётся из справочника портала.',
              },
          ] satisfies FormFieldConfig[])
        : []),
    {
        name: 'client_types',
        label: 'Типы клиента',
        type: 'multiselect',
        options: CLIENT_TYPE_OPTIONS,
        helperText: EMPTY_CRITERIA_HELPER_TEXT,
    },
    {
        name: 'supply_types',
        label: 'Виды размещения',
        type: 'multiselect',
        options: SUPPLY_TYPE_OPTIONS,
        helperText: EMPTY_CRITERIA_HELPER_TEXT,
    },
    {
        name: 'description',
        label: 'Описание',
        type: 'textarea',
        placeholder: 'Для чего этот шаблон',
    },
    {
        name: 'type',
        label: 'Тип файла',
        type: 'select',
        options: INVOICE_TEMPLATE_TYPE_OPTIONS,
    },
    {
        name: 'is_default',
        label: 'По умолчанию',
        type: 'boolean',
        helperText:
            'Шаблон по умолчанию в своей группе (видимость + портал + поставщик).',
    },
    {
        name: 'is_active',
        label: 'Активен',
        type: 'boolean',
    },
];
