import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export type ScreenSplitMainWidth = 'fluid' | 'content';

export interface ScreenSplitProps {
    /** Правая колонка: саммари с главным действием экрана. */
    aside: ReactNode;
    /**
     * `fluid` — основная колонка тянется на всю ширину (наполнение);
     * `content` — держит ширину карточек (таблица цен): карточки товара не
     * расползаются на широком мониторе, пара колонок центруется.
     */
    mainWidth?: ScreenSplitMainWidth;
    children: ReactNode;
}

const GRID_CLASS: Record<ScreenSplitMainWidth, string> = {
    fluid: 'lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]',
    content:
        'lg:grid-cols-[minmax(0,64rem)_20rem] lg:justify-center xl:grid-cols-[minmax(0,64rem)_24rem]',
};

/**
 * Основная колонка + саммари справа (легаси Konstructor: main 3fr / result 1fr).
 * Саммари липнет под степпером: список может уходить далеко вниз, а итог и
 * кнопка перехода остаются на месте. На узком экране саммари — под основным.
 */
export const ScreenSplit = ({
    aside,
    mainWidth = 'fluid',
    children,
}: ScreenSplitProps) => (
    <div className={cn('grid items-start gap-6', GRID_CLASS[mainWidth])}>
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-16">{aside}</aside>
    </div>
);
