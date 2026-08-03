'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ContactField, EV_CONTACT_TYPE } from '@/modules/entities/EventContact';
import { PbxContactFields } from '@/modules/features/PbxContact';

/** Контакт отчёта: с кем общались + портальные поля (ЛПР, статус клиента). */
export const ReportContactCard: FC = () => {
    const company = useAppSelector(s => s.app.bitrix.company);

    // Контакты живут в компании: в лиде показывать нечего.
    if (!company) return null;

    return (
        <SectionCard title="Контакт" density="compact">
            <ContactField type={EV_CONTACT_TYPE.REPORT} />
            <PbxContactFields />
        </SectionCard>
    );
};
