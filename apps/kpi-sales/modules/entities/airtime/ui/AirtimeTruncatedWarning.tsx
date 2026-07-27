'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** Выгрузка voximplant остановлена по лимиту строк — эфир посчитан не весь. */
export const AirtimeTruncatedWarning: React.FC = () => (
    <div className="mb-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p>
            Выгрузка статистики звонков остановлена по лимиту — эфирное время
            посчитано не по всем звонкам периода. Сузьте период отчёта.
        </p>
    </div>
);
