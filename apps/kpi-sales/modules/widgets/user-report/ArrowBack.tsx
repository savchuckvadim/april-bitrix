'use client';

import { Button } from '@workspace/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Компактная кнопка «назад»: только иконка (текст — в title), встаёт
 * inline в ряд с именем пользователя, не занимая отдельный ряд страницы.
 */
export const ArrowBack = () => {
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            title="Назад"
            className="h-8 w-8 shrink-0 cursor-pointer text-primary hover:text-primary/80"
        >
            <ArrowLeft className="size-4" />
        </Button>
    );
};
