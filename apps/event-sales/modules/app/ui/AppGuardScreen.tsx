'use client';

import { FC } from 'react';
import Image from 'next/image';
import type { AppGuard } from '../model/slice/AppSlice';

/**
 * Полноэкранная заглушка вместо приложения (todo2508):
 * задача чужой группы или задача без живых CRM-привязок. Большая картинка
 * из public/process + короткое объяснение — это не ошибка, а честное
 * «здесь работать не с чем».
 */
const GUARD_VIEW: Record<
    AppGuard,
    { image: string; title: string; text: string }
> = {
    foreignTask: {
        image: '/process/profile-img.png',
        title: 'Это приложение — для отдела продаж',
        text:
            'Задача не из группы «Звонки» отдела продаж. Откройте виджет ' +
            'в задаче обзвона — там появятся дела, отчёты и планирование.',
    },
    noTaskEntity: {
        image: '/process/error-img.png',
        title: 'Не удалось определить клиента',
        text:
            'Привязанные к задаче компания, сделка и лид недоступны или ' +
            'удалены — работать не с чем. Проверьте привязки задачи в CRM.',
    },
};

export const AppGuardScreen: FC<{ guard: AppGuard }> = ({ guard }) => {
    const view = GUARD_VIEW[guard];
    return (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
            <Image
                src={view.image}
                alt=""
                width={280}
                height={210}
                className="h-auto w-full max-w-70"
                priority
            />
            <h1 className="text-lg font-semibold">{view.title}</h1>
            <p className="max-w-96 text-sm leading-relaxed text-muted-foreground">
                {view.text}
            </p>
        </div>
    );
};
