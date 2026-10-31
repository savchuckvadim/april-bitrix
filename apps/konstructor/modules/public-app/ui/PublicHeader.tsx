'use client';

import { ThemeTogglePanel } from '@workspace/theme';

/** Шапка публичной версии: что это за страница и почему здесь нет документов. */
export const PublicHeader = () => (
    <header className="z-20 shrink-0 border-b bg-background">
        <div className="flex min-w-0 items-center gap-4 px-4 py-2 lg:px-6">
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                    Конструктор комплектов
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Ознакомление с правилами: сборка не сохраняется, КП и документы
                    не формируются
                </span>
            </div>
            <div className="ml-auto shrink-0">
                <ThemeTogglePanel />
            </div>
        </div>
    </header>
);
