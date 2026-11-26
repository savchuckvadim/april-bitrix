'use client';

import { Building2 } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** Открыто из карточки компании, а компания из CRM не прочиталась. */
export const CompanyUnavailableScreen = () => (
    <EmptyState
        layout="screen"
        icon={Building2}
        tone="warning"
        title="Компания недоступна"
        description="Конструктор не смог прочитать компанию из CRM. Проверьте, что она не удалена и вам открыт доступ к ней, затем откройте конструктор заново."
    />
);
