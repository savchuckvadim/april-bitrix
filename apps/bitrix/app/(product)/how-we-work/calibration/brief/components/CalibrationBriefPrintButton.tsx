'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

/** Кнопка печати брифа: открывает системный диалог печати браузера. */
export const CalibrationBriefPrintButton: React.FC = () => (
    <Button
        type="button"
        size="lg"
        className="no-print"
        onClick={() => window.print()}
    >
        <Printer className="h-4 w-4" />
        Распечатать
    </Button>
);
