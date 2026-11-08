'use client';

import type { ReactNode } from 'react';
import { SectionCard } from '@workspace/april-ui';

/** Каркас страниц входа: карточка по центру экрана. */
export const AuthShell = ({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) => (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
            <SectionCard title={title} description={description}>
                <div className="flex flex-col gap-4">{children}</div>
            </SectionCard>
            <p className="mt-4 text-center text-xs text-muted-foreground">
                April — кабинет клиента
            </p>
        </div>
    </div>
);
