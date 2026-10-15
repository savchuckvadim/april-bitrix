'use client';

import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { DIGEST_TABS, type DigestTabKey } from '../../lib/digest-tabs';

interface DigestTabsBarProps {
    tab: DigestTabKey;
    onChange: (tab: DigestTabKey) => void;
}

/** Подвкладки дайджеста: «Всё» и по одной на виджет. */
export const DigestTabsBar = ({ tab, onChange }: DigestTabsBarProps) => (
    <Tabs value={tab} onValueChange={value => onChange(value as DigestTabKey)}>
        <TabsList className="h-auto flex-wrap justify-start">
            {DIGEST_TABS.map(item => (
                <TabsTrigger key={item.key} value={item.key} className="text-xs">
                    {item.label}
                </TabsTrigger>
            ))}
        </TabsList>
    </Tabs>
);
