'use client';

import type { ReactNode } from 'react';
import { HostFrame } from '@workspace/april-ui/surfaces';

export interface AppFrameProps {
    /** Вкладка задачи: экран течёт по контенту, фрейм подгоняется под него. */
    selfSized: boolean;
    /** Вкладка карточки CRM: скруглённая рамка на фоне карточки Битрикса. */
    framed: boolean;
    children: ReactNode;
}

/**
 * Каркас приложения: в самоподгоняемой встройке — просто поток контента, в
 * остальных — на всю высоту фрейма, шапка над внутренним скроллом.
 */
export const AppFrame = ({ selfSized, framed, children }: AppFrameProps) =>
    selfSized ? (
        <div>{children}</div>
    ) : (
        <HostFrame framed={framed} className="flex flex-col">
            {children}
        </HostFrame>
    );
