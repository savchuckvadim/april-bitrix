
import { InfoblockListItem} from '@/modules/entities/garant/infoblock/model';
import { EntityType } from '@/modules/shared/ui/entity-select';
import { IGarantPackageCreate } from '../../model';


/**
 * Конфигурация полей формы на основе PackageCreateDto
 */
export interface FormFieldConfig {
    name: keyof IGarantPackageCreate;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'entity-select';
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
    entityType?: EntityType; // Для типа 'entity-select'
    isMultiple?: boolean; // Для типа 'entity-select'
    filterFn?: (entity: any) => boolean; // Для типа 'entity-select' - функция фильтрации
}

/**
 * Опции для типа пакета
 */
const packageTypeOptions: { value: string; label: string }[] = [
    { value: 'prof', label: 'Профессиональный' },
    { value: 'universal', label: 'Универсальный' },
];

/**
 * Опции для типа продукта
 */
const productTypeOptions: { value: string; label: string }[] = [
    { value: 'garant', label: 'Гарант' },
    { value: 'lt', label: 'LT' },
    { value: 'star', label: 'Star' },
    { value: 'consalting', label: 'Консалтинг' },
    { value: 'academy', label: 'Академия Гарант' },
];

/**
 * Схема полей формы для IGarantPackageCreate
 */
export const packageFormFields: FormFieldConfig[] = [
    {
        name: 'number',
        label: 'Номер пакета',
        type: 'number',
        required: true,
        placeholder: 'Введите номер',
    },
    {
        name: 'name',
        label: 'Название пакета',
        type: 'text',
        required: true,
        placeholder: 'Введите название',
    },
    {
        name: 'fullName',
        label: 'Полное название пакета',
        type: 'text',
        required: true,
        placeholder: 'Введите полное название',
    },
    {
        name: 'shortName',
        label: 'Короткое название пакета',
        type: 'text',
        required: true,
        placeholder: 'Введите короткое название',
    },
    {
        name: 'code',
        label: 'Код пакета',
        type: 'text',
        required: true,
        placeholder: 'Введите код',
    },
    {
        name: 'description',
        label: 'Описание пакета',
        type: 'textarea',
        required: false,
        placeholder: 'Введите описание',
    },
    {
        name: 'type',
        label: 'Тип пакета',
        type: 'select',
        required: true,
        options: packageTypeOptions,
        helperText: 'Тип пакета определяет способ расчета цены',
    },
    {
        name: 'color',
        label: 'Цвет пакета',
        type: 'text',
        required: false,
        placeholder: 'Введите цвет (например, #FF0000)',
    },
    {
        name: 'weight',
        label: 'Вес пакета',
        type: 'number',
        required: true,
        placeholder: 'Введите вес',
    },
    {
        name: 'abs',
        label: 'ABS пакета',
        type: 'number',
        required: false,
        placeholder: 'Введите ABS',
    },
    {
        name: 'productType',
        label: 'Тип продукта',
        type: 'select',
        required: true,
        options: productTypeOptions,
    },
    {
        name: 'withABS',
        label: 'Наличие ABS',
        type: 'boolean',
        required: false,
    },
    {
        name: 'isChanging',
        label: 'Изменяемый пакет',
        type: 'boolean',
        required: false,
    },
    {
        name: 'withDefault',
        label: 'Есть ли наполнение по умолчанию',
        type: 'boolean',
        required: false,
    },
    {
        name: 'infoblock_id',
        label: 'Инфоблок',
        type: 'entity-select',
        entityType: 'infoblock',
        isMultiple: false,
        required: false,
        placeholder: 'Выберите инфоблок',
        // Фильтруем только пакеты (инфоблоки с isPackage: true)
        filterFn: (infoblock: InfoblockListItem) => infoblock.isProduct === true,
    },
    {
        name: 'info_group_id',
        label: 'Группа инфоблоков',
        type: 'entity-select',
        entityType: 'infogroup',
        isMultiple: false,
        required: true,
        placeholder: 'Выберите группу инфоблоков',

    },
];
