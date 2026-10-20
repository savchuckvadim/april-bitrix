'use client';

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    AI_EMPLOYEE_TABS,
    isAiEmployeeTab,
    type AiEmployeeTab,
} from '@/modules/entities/ai-analytics';

interface AiEmployeeTabsBarProps {
    tab: AiEmployeeTab;
    onChange: (tab: AiEmployeeTab) => void;
}

/** Подвкладки AI-раздела страницы сотрудника (как у дайджеста); подсказка — при наведении. */
export const AiEmployeeTabsBar = ({ tab, onChange }: AiEmployeeTabsBarProps) => (
    <Tabs value={tab} onValueChange={value => isAiEmployeeTab(value) && onChange(value)}>
        <TabsList className="h-auto flex-wrap justify-start">
            {AI_EMPLOYEE_TABS.map(item => (
                <TabsTrigger key={item.key} value={item.key} title={item.hint} className="text-xs">
                    {item.label}
                </TabsTrigger>
            ))}
        </TabsList>
    </Tabs>
);
