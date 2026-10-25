'use client';

import { Building2 } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** В сделке не указана компания: без неё нет ни реквизитов, ни документов. */
export const NoCompanyScreen = () => (
    <EmptyState
        layout="screen"
        icon={Building2}
        tone="warning"
        title="В сделке не указана компания"
        description="Конструктор собирает предложение по реквизитам компании. Добавьте компанию в сделку и откройте конструктор заново."
    />
);
