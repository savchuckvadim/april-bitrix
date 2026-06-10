'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import { SmartCategoriesInstallSection } from '../../SmartCategoriesInstallSection';
import { SmartFieldsInstallSection } from '../../SmartFieldsInstallSection';
import type { PbxSmartDiffNode, PbxSmartInstallContext } from '../../../model/types';

interface SmartChildrenTabsProps {
    diffNode: PbxSmartDiffNode;
    context: PbxSmartInstallContext;
}

/**
 * Tabs for categories (with stages) and fields (with enum items).
 * Shown only when the smart is present in the DB.
 */
export function SmartChildrenTabs({ diffNode, context }: SmartChildrenTabsProps) {
    const missingCategories = diffNode.categories.filter(
        (c) => c.status !== 'installed',
    ).length;
    const missingFields = diffNode.fields.filter(
        (f) => f.status !== 'installed',
    ).length;

    return (
        <Tabs defaultValue="categories">
            <TabsList>
                <TabsTrigger value="categories" className="gap-2">
                    Категории
                    {missingCategories > 0 && (
                        <Badge variant="destructive" className="ml-1">
                            {missingCategories}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="fields" className="gap-2">
                    Поля
                    {missingFields > 0 && (
                        <Badge variant="destructive" className="ml-1">
                            {missingFields}
                        </Badge>
                    )}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-4">
                <SmartCategoriesInstallSection
                    categories={diffNode.categories}
                    context={context}
                />
            </TabsContent>

            <TabsContent value="fields" className="mt-4">
                <SmartFieldsInstallSection
                    fields={diffNode.fields}
                    context={context}
                    bitrixEntityTypeId={diffNode.installed?.entityTypeId ?? undefined}
                />
            </TabsContent>
        </Tabs>
    );
}
