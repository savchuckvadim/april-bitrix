'use client';

import type { RqItem } from '../model/types';

export interface RqFieldValueProps {
    /** Поле реквизита; без него подпись и значение задаются явно. */
    field?: RqItem;
    label?: string;
    value?: string;
    multiline?: boolean;
}

const textOf = (field: RqItem): string => {
    if (field.type === 'select') return field.value?.name ?? '';
    if (field.type === 'file') return typeof field.value === 'string' ? field.value : '';
    return field.value;
};

/** Подпись и значение поля реквизита в режиме просмотра. */
export const RqFieldValue = ({ field, label, value, multiline }: RqFieldValueProps) => {
    const text = field ? textOf(field) : (value ?? '');
    return (
        <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{field?.name ?? label}</label>
            <div
                className={
                    multiline
                        ? 'whitespace-pre-wrap break-words text-sm font-medium'
                        : 'text-sm font-medium'
                }
            >
                {text || <span className="text-muted-foreground">Не заполнено</span>}
            </div>
        </div>
    );
};
