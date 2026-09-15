'use client';

import { Building2 } from 'lucide-react';

/** В сделке не указана компания: без неё нет ни реквизитов, ни документов. */
export const NoCompanyScreen = () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <Building2 className="h-10 w-10 text-warning" />
            <h1 className="text-lg font-semibold text-foreground">
                В сделке не указана компания
            </h1>
            <p className="text-sm text-muted-foreground">
                Конструктор собирает предложение по реквизитам компании.
                Добавьте компанию в сделку и откройте конструктор заново.
            </p>
        </div>
    </div>
);
