'use client';

import { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { PresentationDoneChip } from './PresentationDoneChip';
import { ReportToolsRail } from './ReportToolsRail';

interface ReportPultCollapsedProps {
    /** Название текущего статуса работы — единственное, что тут написано. */
    workStatusName: string;
    /** Отметка презентации применима к этому событию. */
    withPresentationChip: boolean;
    expand: () => void;
}

/**
 * Свёрнутый отчёт: светящаяся пилюля вместо карточки.
 *
 * Самый частый случай — «в работе», менять нечего. Целая карточка ради одной
 * кнопки съедала вертикаль, которая нужна комментарию. Но пилюля не музейная:
 * отметка «презентация проведена» остаётся рабочей прямо в ней — это второе
 * по частоте действие, и разворачивать ради него весь пульт незачем.
 */
export const ReportPultCollapsed: FC<ReportPultCollapsedProps> = ({
    workStatusName,
    withPresentationChip,
    expand,
}) => (
    <div className="relative flex w-full items-center gap-2 rounded-lg border border-[color:color-mix(in_oklab,var(--success),var(--border)_60%)] bg-[color:color-mix(in_oklab,var(--success),var(--card)_94%)] px-2.5 py-1.5">
        <span className="relative flex size-2 shrink-0">
            {/* Пульсация — «работа идёт», а не «нужно действие». */}
            <span className="absolute inset-0 animate-echo-ring rounded-full motion-reduce:animate-none" />
            <span className="size-2 rounded-full bg-success" />
        </span>

        <span className="text-xs font-semibold text-[color:color-mix(in_oklab,var(--success),var(--foreground)_var(--tone-soft-mix))]">
            {workStatusName}
        </span>

        {withPresentationChip && <PresentationDoneChip />}

        <span className="ml-auto flex shrink-0 items-center gap-0.5 pr-8">
            <IconAction
                icon={ChevronDown}
                label="Развернуть отчёт"
                hint="Причины недозвона и отказа, заявка"
                onClick={expand}
            />
        </span>

        <ReportToolsRail />
    </div>
);
