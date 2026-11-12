'use client';

import type { ReactNode } from 'react';
import { HostFrame } from '@workspace/april-ui/surfaces';

export interface AppFrameProps {
    /** Вкладка карточки CRM: рамка, шапка над внутренним скроллом. */
    framed: boolean;
    header: ReactNode;
    children: ReactNode;
}

/** Каркас: во вкладке карточки — на высоту фрейма, иначе поток контента. */
export const AppFrame = ({ framed, header, children }: AppFrameProps) =>
    framed ? (
        <HostFrame framed className="flex flex-col">
            {header}
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                {children}
            </div>
        </HostFrame>
    ) : (
        <div>
            {header}
            {children}
        </div>
    );
