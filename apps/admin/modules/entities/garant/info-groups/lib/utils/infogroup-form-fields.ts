import { InfogroupCreateDto, CreateInfogroupDtoType, CreateInfogroupDtoProductType } from '../../model';

/**
 * Конфигурация полей формы на основе InfogroupCreateDto
 */
export interface FormFieldConfig {
    name: keyof InfogroupCreateDto;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
    required: boolean;
    placeholder?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
}

/**
 * Схема полей формы для InfogroupCreateDto
 */
export const infogroupFormFields: FormFieldConfig[] = [
    {
        name: 'number',
        label: 'Номер группы',
        type: 'number',
        required: true,
        placeholder: 'Введите номер',
    },
    {
        name: 'code',
        label: 'Код группы',
        type: 'text',
        required: true,
        placeholder: 'Введите код',
    },
    {
        name: 'name',
        label: 'Название группы',
        type: 'text',
        required: true,
        placeholder: 'Введите название',
    },
    {
        name: 'title',
        label: 'Заголовок группы',
        type: 'text',
        required: true,
        placeholder: 'Введите заголовок',
    },
    {
        name: 'type',
        label: 'Тип группы',
        type: 'select',
        required: true,
        options: Object.entries(CreateInfogroupDtoType).map(([key, value]) => ({
            value: value,
            label: key.charAt(0).toUpperCase() + key.slice(1),
        })),
    },
    {
        name: 'productType',
        label: 'Тип продукта',
        type: 'select',
        required: true,
        options: Object.entries(CreateInfogroupDtoProductType).map(([key, value]) => ({
            value: value,
            label: key.charAt(0).toUpperCase() + key.slice(1),
        })),
    },
];
