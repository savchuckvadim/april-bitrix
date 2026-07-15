'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import { updatePbxContactField } from '../model/PbxContactThunk';

interface PbxContactFieldItemProps {
    contactId: number;
    field: PBXContactFieldData;
}

/** Одно портальное поле контакта: клик циклически меняет значение. */
export const PbxContactFieldItem: FC<PbxContactFieldItemProps> = ({
    contactId,
    field,
}) => {
    const dispatch = useAppDispatch();

    const currentTitle =
        field.current && typeof field.current === 'object'
            ? field.current.name
            : String(field.current ?? '—');

    return (
        <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5 text-left hover:bg-accent"
            onClick={() => dispatch(updatePbxContactField(contactId, field.field.code))}
        >
            <span className="text-sm text-muted-foreground">{field.field.name}</span>
            <Badge variant="secondary">{currentTitle}</Badge>
        </button>
    );
};
