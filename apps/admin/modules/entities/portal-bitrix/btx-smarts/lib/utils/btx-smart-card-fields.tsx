import { EntityFieldConfig } from '@/modules/shared';
import { SmartResponseDto } from '@workspace/nest-api';

const formatDate = (value: unknown) => {
    if (!value) return '—';
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

export const smartCardFields: EntityFieldConfig<SmartResponseDto>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'group', label: 'Group' },
    { key: 'entityTypeId', label: 'Entity Type ID' },
    { key: 'portal_id', label: 'Portal ID', badge: true },
    {
        key: 'created_at',
        label: 'Создан',
        render: (value) => formatDate(value),
    },
    {
        key: 'updated_at',
        label: 'Обновлен',
        render: (value) => formatDate(value),
    },
];
