'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { eventContactActions } from '@/modules/entities/EventContact';
import { PbxContactFields } from '@/modules/features/PbxContact';

/** Контакт отчёта: выбор + портальные поля (ЛПР, статус клиента, …). */
export const ContactSection: FC = () => {
    const dispatch = useAppDispatch();
    const contacts = useAppSelector(s => s.contact.contacts);
    const reportContact = useAppSelector(s => s.contact.current.report);

    if (!contacts.length) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Контакт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1.5">
                    <Label>С кем общались</Label>
                    <Select
                        value={reportContact ? String(reportContact.ID) : undefined}
                        onValueChange={value =>
                            dispatch(
                                eventContactActions.setCurrentContact({
                                    type: 'report',
                                    contactId: Number(value),
                                }),
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Выберите контакт" />
                        </SelectTrigger>
                        <SelectContent>
                            {contacts.map(contact => (
                                <SelectItem key={contact.ID} value={String(contact.ID)}>
                                    {contact.NAME} {contact.LAST_NAME ?? ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <PbxContactFields />
            </CardContent>
        </Card>
    );
};
