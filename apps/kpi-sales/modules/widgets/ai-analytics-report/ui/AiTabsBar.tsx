'use client';

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    AI_TABS,
    AI_TABS_TEXT,
    isAiTabKey,
    type AiTabKey,
} from '../lib/ai-tabs';

interface AiTabsBarProps {
    tab: AiTabKey;
    onChange: (tab: AiTabKey) => void;
}

/** Подвкладки вкладки AI (как у дайджеста); подсказка — при наведении. */
export const AiTabsBar = ({ tab, onChange }: AiTabsBarProps) => (
    <Tabs
        value={tab}
        onValueChange={value => isAiTabKey(value) && onChange(value)}
    >
        <TabsList
            aria-label={AI_TABS_TEXT.ariaLabel}
            className="h-auto flex-wrap justify-start"
        >
            {AI_TABS.map(item => (
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
);
