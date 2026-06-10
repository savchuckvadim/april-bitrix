'use client';

import { Download } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Preloader } from '@/modules/shared';

interface ExcelExportButtonProps {
    /** Сборщик книги: собирает данные и инициирует скачивание .xlsx */
    onBuild: () => Promise<void>;
    title?: string;
    disabled?: boolean;
    label?: string;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
    onBuild,
    title = 'Скачать Excel',
    disabled = false,
    label,
}) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await onBuild();
        } catch (error) {
            console.error('Excel export failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mr-3">
                <Preloader />
            </div>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={disabled}
            variant="outline"
            className="cursor-pointer gap-2"
            title={title}
        >
            <Download className="w-4 h-4" />
            {label}
        </Button>
    );
};
