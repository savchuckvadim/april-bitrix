'use client';

import { SmartStatusHeader } from './components/SmartStatusHeader';
import { SmartChildrenTabs } from './components/SmartChildrenTabs';
import { SmartInstallPreview } from './components/SmartInstallPreview';
import { usePbxSmartDetail } from '../../lib/hooks/use-pbx-smart-install';
import type { PbxSmartInstallContext } from '../../model/types';

interface SmartPbxOverviewTabProps {
    context: PbxSmartInstallContext;
}

/**
 * Full PBX diff tab for a single smart.
 * Composition root — delegates rendering to SmartStatusHeader,
 * SmartChildrenTabs, and SmartInstallPreview.
 */
export function SmartPbxOverviewTab({ context }: SmartPbxOverviewTabProps) {
    const { diffNode, isLoading } = usePbxSmartDetail(context);
    debugger
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!diffNode) {
        return (
            <p className="text-sm text-muted-foreground py-4">
                Смарт-процесс с кодом «{context.smartCode}» не найден в шаблоне
                группы «{context.group}».
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <SmartStatusHeader diffNode={diffNode} context={context} />

            {diffNode.installed ? (
                <SmartChildrenTabs diffNode={diffNode} context={context} />
            ) : (
                <SmartInstallPreview diffNode={diffNode} />
            )}
        </div>
    );
}
