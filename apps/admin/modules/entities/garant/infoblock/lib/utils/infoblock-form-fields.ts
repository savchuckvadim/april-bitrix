import { InfoblockCreateDto } from '../../model';
import { EntityType } from '@/modules/shared/ui/entity-select';

/**
 * Конфигурация полей формы на основе InfoblockCreateDto
 */
export interface FormFieldConfig {
    name: keyof InfoblockCreateDto;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'entity-select';
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
    entityType?: EntityType; // Для типа 'entity-select'
    isMultiple?: boolean; // Для типа 'entity-select'
}

/**
 * Схема полей формы для InfoblockCreateDto
 */
export const infoblockFormFields: FormFieldConfig[] = [
    {
        name: 'number',
        label: 'Номер инфоблока',
        type: 'number',
        required: true,
        placeholder: 'Введите номер',
    },
    {
        name: 'name',
        label: 'Название инфоблока',
        type: 'text',
        required: true,
        placeholder: 'Введите название',
    },
    {
        name: 'code',
        label: 'Код инфоблока',
        type: 'text',
        required: true,
        placeholder: 'Введите код',
    },
    {
        name: 'weight',
        label: 'Вес инфоблока',
        type: 'text',
        required: true,
        placeholder: 'Введите вес',
    },
    {
        name: 'group_id',
        label: 'Группа инфоблоков',
        type: 'entity-select',
        required: true,
        placeholder: 'Выберите группу',
        entityType: 'infogroup',
        isMultiple: false,
    },
    {
        name: 'isLa',
        label: 'Является LA',
        type: 'boolean',
        required: true,
    },
    {
        name: 'isFree',
        label: 'Бесплатный',
        type: 'boolean',
        required: true,
    },
    {
        name: 'isShowing',
        label: 'Отображается',
        type: 'boolean',
        required: true,
    },
    {
        name: 'isSet',
        label: 'Является набором',
        type: 'boolean',
        required: true,
    },
    {
        name: 'isProduct',
        label: 'Является продуктом',
        type: 'boolean',
        required: false,
    },
    {
        name: 'isPackage',
        label: 'Является пакетом',
        type: 'boolean',
        required: false,
    },
    // Поля связей (group_id, packages, packageInfoblocks)
    // управляются отдельно через InfoblockRelationsManager компонент
];
