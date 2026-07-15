'use client';

import { FC } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { PBX_FIELD_TYPE } from '@/modules/entities/EventContact/type/pbx-contact-type';
import { PbxContactFieldItem } from './PbxContactFieldItem';

/** Портальные поля контакта отчёта (ЛПР, статус клиента, потребности, …). */
export const PbxContactFields: FC = () => {
    const reportContact = useAppSelector(s => s.contact.current.report);

    if (!reportContact?.fields?.length) return null;

    const editableFields = reportContact.fields.filter(
        field =>
            field.field.type === PBX_FIELD_TYPE.ENUM ||
            field.field.type === PBX_FIELD_TYPE.SELECT,
    );
    if (!editableFields.length) return null;

    return (
        <div className="space-y-1.5">
            {editableFields.map(field => (
                <PbxContactFieldItem
                    key={field.bitrixId}
                    contactId={Number(reportContact.ID)}
                    field={field}
                />
            ))}
        </div>
    );
};
