'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { EntityRelationsTab, TabId } from '../types';

interface EntityRelationsTabsProps {
    tabs: EntityRelationsTab[];
    defaultTab?: TabId;
}

export function EntityRelationsTabs({
    tabs,
    defaultTab = 'main',
}: EntityRelationsTabsProps) {
    const visibleTabs = tabs.filter((tab) => !tab.disabled);
    if (visibleTabs.length === 0) return null;
    const firstVisibleTab = visibleTabs[0];
    if (!firstVisibleTab) return null;

    const resolvedDefault =
        visibleTabs.find((tab) => tab.id === defaultTab)?.id ?? firstVisibleTab.id;

    return (
        <Tabs defaultValue={resolvedDefault} className="space-y-4">
            <TabsList className="h-auto flex-wrap">
                {visibleTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                        {tab.label}
                        {typeof tab.badgeCount === 'number' && (
                            <Badge variant="secondary">{tab.badgeCount}</Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            {visibleTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}
