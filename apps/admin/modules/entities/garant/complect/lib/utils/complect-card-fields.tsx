import { EntityFieldConfig } from "@/modules/shared";
import { GetComplectResponseDto } from "@workspace/nest-api";

export const complectCardFields: EntityFieldConfig<GetComplectResponseDto>[] = [
    {
        key: 'name',
        label: 'Название',
    },
    {
        key: 'fullName',
        label: 'Полное название',
    },
    {
        key: 'shortName',
        label: 'Краткое название',
    },
    {
        key: 'code',
        label: 'Код',
    },
    {
        key: 'number',
        label: 'Номер',
    },
    {
        key: 'weight',
        label: 'Вес',
        render: (value) => `${value} кг`,
    },
    {
        key: 'type',
        label: 'Тип',
        badge: true,
    },
    {
        key: 'productType',
        label: 'Тип продукта',
        badge: true,
    },
    {
        key: 'color',
        label: 'Цвет',
        render: (value) =>
            value ? (
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: value }}
                    />
                    <span>{value}</span>
                </div>
            ) : (
                '—'
            ),
    },
    {
        key: 'abs',
        label: 'ABS',
    },
    {
        key: 'description',
        label: 'Описание',
    },
    {
        key: 'withABS',
        label: 'С ABS',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'withConsalting',
        label: 'С консалтингом',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'withServices',
        label: 'С услугами',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'withLt',
        label: 'С LT',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'isChanging',
        label: 'Изменяется',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'withDefault',
        label: 'По умолчанию',
        render: (value) => (value ? 'Да' : 'Нет'),
    },
    {
        key: 'infoblocks',
        label: 'Инфоблоки',
        render: (value) => (value && value.length > 0 ? `${value.length} шт.` : 'Нет'),
    },
    {
        key: 'created_at',
        label: 'Создан',
        render: (value) => (value ? new Date(value).toLocaleString('ru-RU') : '—'),
    },
    {
        key: 'updated_at',
        label: 'Обновлен',
        render: (value) => (value ? new Date(value).toLocaleString('ru-RU') : '—'),
    },
];

