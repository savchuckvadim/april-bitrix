import { CreateComplectDto, CreateComplectDtoType, CreateComplectDtoProductType } from '@workspace/nest-api';

/**
 * Конфигурация полей формы на основе CreateComplectDto
 * Используется для автоматической генерации полей формы
 */
export interface FormFieldConfig {
    name: keyof CreateComplectDto;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
}

/**
 * Схема полей формы для CreateComplectDto
 * Основана на интерфейсе CreateComplectDto из @workspace/nest-api
 */
export const complectFormFields: FormFieldConfig[] = [
    {
        name: 'name',
        label: 'Название комплекта',
        type: 'text',
        required: true,
        placeholder: 'Введите название комплекта',
        helperText: 'Название должно быть уникальным',
    },
    {
        name: 'fullName',
        label: 'Полное название комплекта',
        type: 'text',
        required: true,
        placeholder: 'Введите полное название',
    },
    {
        name: 'shortName',
        label: 'Короткое название комплекта',
        type: 'text',
        required: true,
        placeholder: 'Введите короткое название',
    },
    {
        name: 'description',
        label: 'Описание комплекта',
        type: 'textarea',
        required: false,
        placeholder: 'Введите описание',
    },
    {
        name: 'code',
        label: 'Код комплекта',
        type: 'text',
        required: true,
        placeholder: 'Введите код',
    },
    {
        name: 'type',
        label: 'Тип комплекта',
        type: 'select',
        required: true,
        options: [
            { value: CreateComplectDtoType.prof, label: 'Профессиональный' },
            { value: CreateComplectDtoType.universal, label: 'Универсальный' },
        ],
    },
    {
        name: 'color',
        label: 'Цвет комплекта',
        type: 'text',
        required: false,
        placeholder: 'Введите цвет',
    },
    {
        name: 'weight',
        label: 'Вес комплекта',
        type: 'number',
        required: true,
        placeholder: 'Введите вес',
    },
    {
        name: 'abs',
        label: 'ABS комплекта',
        type: 'text',
        required: false,
        placeholder: 'Введите ABS',
    },
    {
        name: 'number',
        label: 'Номер комплекта',
        type: 'number',
        required: true,
        placeholder: 'Введите номер',
    },
    {
        name: 'productType',
        label: 'Тип продукта',
        type: 'select',
        required: true,
        options: [
            { value: CreateComplectDtoProductType.garant, label: 'Гарант' },
            { value: CreateComplectDtoProductType.lt, label: 'LT' },
            { value: CreateComplectDtoProductType.star, label: 'Star' },
            { value: CreateComplectDtoProductType.consalting, label: 'Консалтинг' },
        ],
    },
    {
        name: 'withABS',
        label: 'Наличие ABS',
        type: 'boolean',
        required: true,
    },
    {
        name: 'withConsalting',
        label: 'Наличие консалтинга',
        type: 'boolean',
        required: true,
    },
    {
        name: 'withServices',
        label: 'Наличие сервисов',
        type: 'boolean',
        required: true,
    },
    {
        name: 'withLt',
        label: 'Наличие LT',
        type: 'boolean',
        required: true,
    },
    {
        name: 'isChanging',
        label: 'Изменяемый комплект',
        type: 'boolean',
        required: true,
    },
    {
        name: 'withDefault',
        label: 'Есть ли наполнение по умолчанию',
        type: 'boolean',
        required: true,
    },
    {
        name: 'infoblockIds',
        label: 'ID инфоблоков',
        type: 'multiselect',
        required: true,
        helperText: 'Выберите инфоблоки, входящие в комплект',
        // TODO: Добавьте опции для инфоблоков
        options: [],
    },
];

/**
 * Получить конфигурацию поля по имени
 */
export const getFieldConfig = (fieldName: keyof CreateComplectDto): FormFieldConfig | undefined => {
    return complectFormFields.find((field) => field.name === fieldName);
};

/**
 * Получить все обязательные поля
 */
export const getRequiredFields = (): FormFieldConfig[] => {
    return complectFormFields.filter((field) => field.required);
};

/**
 * Получить все необязательные поля
 */
export const getOptionalFields = (): FormFieldConfig[] => {
    return complectFormFields.filter((field) => !field.required);
};
