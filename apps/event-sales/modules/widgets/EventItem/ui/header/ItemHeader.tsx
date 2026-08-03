'use client';

import { FC } from 'react';
import { Building2, UserRound } from 'lucide-react';
import { EventTypeBadge } from '@workspace/april-ui';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { useItemWarnings } from '../../lib/hooks/use-item-warnings';
import { ItemWarnings } from './ItemWarnings';
import { PresentationDoneButton } from './PresentationDoneButton';

interface ItemHeaderProps {
    /** Показывать кнопку презентации (visibility.presentation). */
    withPresentation: boolean;
}

/**
 * Шапка отчёта: контекст (в чём мы находимся), тип события, предупреждения
 * и действия. Sticky — потому что и «Отправить», и причина, по которой
 * отправка не проходит, должны быть видны при любой длине формы.
 */
export const ItemHeader: FC<ItemHeaderProps> = ({ withPresentation }) => {
    const currentTask = useAppSelector(s => s.eventTask.current);
    const company = useAppSelector(s => s.app.bitrix.company);
    const lead = useAppSelector(s => s.app.bitrix.lead);
    const isLeadContext = useAppSelector(getIsLeadContext);
    const warnings = useItemWarnings();

    // В сделке показываем её компанию — менеджеру важно, с кем он работает,
    // а не в какой сущности открыто приложение.
    const contextTitle = isLeadContext
        ? (lead?.TITLE ?? 'Лид')
        : (company?.TITLE ?? '—');

    return (
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="space-y-2 border-l-4 border-[var(--event-current)] px-3 py-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {isLeadContext ? (
                            <UserRound aria-hidden className="size-4 shrink-0" />
                        ) : (
                            <Building2 aria-hidden className="size-4 shrink-0" />
                        )}
                        {contextTitle}
                    </span>

                    <span className="text-muted-foreground">·</span>

                    <h1 className="min-w-0 truncate text-base font-semibold text-foreground">
                        {currentTask?.name || 'Новое событие'}
                    </h1>
                    {currentTask && <EventTypeBadge type={currentTask.type} />}

                    {/* Отправка и отмена переехали под карточку плана — здесь
                        остаётся только контекст и презентация. */}
                    <div className="ml-auto flex items-center gap-2">
                        {withPresentation && <PresentationDoneButton />}
                        <ThemeTogglePanel />
                    </div>
                </div>

                <ItemWarnings warnings={warnings} />
            </div>
        </header>
    );
};
