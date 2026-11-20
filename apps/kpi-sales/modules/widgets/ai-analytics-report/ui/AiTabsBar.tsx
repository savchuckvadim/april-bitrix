'use client';

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    AI_TABS,
    AI_TABS_TEXT,
    isAiTabKey,
    type AiTab,
    type AiTabKey,
} from '../lib/ai-tabs';
import { AiCallsEntryLink } from './components/AiCallsEntryLink';

interface AiTabsBarProps {
    tab: AiTabKey;
    onChange: (tab: AiTabKey) => void;
    /** Подвкладки, которые видит пользователь (по умолчанию — все). */
    tabs?: readonly AiTab[];
    /** Показать переход в «Разборы звонков» (руководители и суперпользователь). */
    withCallsEntry?: boolean;
}

/**
 * Подвкладки вкладки AI (как у дайджеста); подсказка — при наведении.
 * Справа — переход в «Разборы звонков» (отдельная страница, не вкладка).
 */
export const AiTabsBar = ({
    tab,
    onChange,
    tabs = AI_TABS,
    withCallsEntry = false,
}: AiTabsBarProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <Tabs
            value={tab}
            onValueChange={value => isAiTabKey(value) && onChange(value)}
        >
            <TabsList
                aria-label={AI_TABS_TEXT.ariaLabel}
                className="h-auto flex-wrap justify-start"
            >
                {tabs.map(item => (
                    <TabsTrigger
                        key={item.key}
                        value={item.key}
                        title={item.hint}
                        className="text-xs"
                    >
                        {item.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
        {withCallsEntry && <AiCallsEntryLink />}
    </div>
);
