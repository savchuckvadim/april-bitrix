'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BackButtonProps {
    fallbackPath?: string; // Путь для возврата, если нет истории
    className?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showText?: boolean;
    children?: React.ReactNode;
    alwaysShow?: boolean; // Показывать всегда, если указан fallbackPath
}

export const BackButton = ({
    fallbackPath,
    className = '',
    variant = 'ghost',
    size = 'sm',
    showText = false,
    children,
    alwaysShow = false,
}: BackButtonProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [hasHistory, setHasHistory] = useState(false);
    const [previousPath, setPreviousPath] = useState<string | null>(null);

    useEffect(() => {
        // Проверяем историю навигации
        if (typeof window !== 'undefined') {
            // Проверяем, есть ли предыдущие страницы в истории
            const hasPreviousPages = window.history.length > 1;

            // Получаем предыдущий путь из sessionStorage (если есть)
            const storedPath = sessionStorage.getItem('previousPath');

            setHasHistory(hasPreviousPages);
            setPreviousPath(storedPath);
        }
    }, [pathname]);

    useEffect(() => {
        // Сохраняем текущий путь в sessionStorage
        if (typeof window !== 'undefined' && pathname) {
            const currentPath = sessionStorage.getItem('currentPath');
            if (currentPath && currentPath !== pathname) {
                sessionStorage.setItem('previousPath', currentPath);
            }
            sessionStorage.setItem('currentPath', pathname);
        }
    }, [pathname]);

    const handleBack = () => {
        if (hasHistory && previousPath && previousPath !== pathname) {
            router.back();
        } else if (fallbackPath) {
            router.push(fallbackPath);
        } else if (hasHistory) {
            router.back();
        }
    };

    // Определяем, нужно ли показывать кнопку
    const shouldShow =
        alwaysShow ||
        hasHistory ||
        (fallbackPath && fallbackPath !== pathname) ||
        (previousPath && previousPath !== pathname);

    if (!shouldShow) {
        return null;
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleBack}
            className={`gap-2 transition-all duration-200 hover:scale-105 ${className}`}
        >
            <ArrowLeftIcon className="w-4 h-4" />
            {showText && (children || 'Назад')}
        </Button>
    );
};
