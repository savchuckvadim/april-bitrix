'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import {
    HOOK_TAB,
    HOOK_TAB_LABEL,
    HOOKS_TEXT,
    type HookTab,
} from '../../consts/hooks.const';
import { useHookEntry, usePortalHookReadiness } from '../../lib/hooks';
import { buildHooksCatalogHref } from '../../lib/hooks-view';
import { HookNotice } from '../components/HookNotice';
import { useHooksPortalSelection } from '../hooks/use-hooks-portal-selection';
import { HookEffects } from './components/HookEffects';
import { HookHeader } from './components/HookHeader';
import { HookEndpointsTab } from './tabs/HookEndpointsTab';
import { HookFieldsTab } from './tabs/HookFieldsTab';
import { HookInstallTab } from './tabs/HookInstallTab';
import { HookMonitoringTab } from './tabs/HookMonitoringTab';
import { HookSettingsTab } from './tabs/HookSettingsTab';

interface HookPageProps {
    code: string;
    /** Карточка портала: портал задан маршрутом, селектора нет. */
    fixedPortalId?: number;
}

/**
 * Карточка хука: теория, как работает по факту, ручки и конструктор
 * адреса для робота, настройки (с порталом — правятся здесь же), поля и
 * стадии с отметкой «установлено на портале», установка и проверка,
 * мониторинг операций. Портал выбирается селектором (глобальный раздел)
 * или задан маршрутом карточки портала.
 */
export const HookPage = ({ code, fixedPortalId }: HookPageProps) => {
    const selection = useHooksPortalSelection(fixedPortalId);
    const entry = useHookEntry(code);
    const readiness = usePortalHookReadiness(selection.portalId, code);
    const [tab, setTab] = useState<HookTab>(HOOK_TAB.theory);

    const tabs = useMemo<HookTab[]>(() => {
        const all = Object.values(HOOK_TAB);
        return entry.data?.operationHook
            ? all
            : all.filter(item => item !== HOOK_TAB.monitoring);
    }, [entry.data?.operationHook]);

    if (entry.isLoading) {
        return <p className="text-sm text-muted-foreground">{HOOKS_TEXT.loading}</p>;
    }
    if (entry.isError || !entry.data) {
        return (
            <div className="space-y-3">
                <HookNotice
                    tone="error"
                    title={HOOKS_TEXT.entryLoadError}
                    message={getApiErrorMessage(entry.error)}
                />
                <Link
                    href={buildHooksCatalogHref(selection.portalId, selection.isFixed)}
                    className="text-sm text-primary underline underline-offset-2"
                >
                    {HOOKS_TEXT.backToCatalog}
                </Link>
            </div>
        );
    }

    const data = entry.data;
    const portalReadiness = selection.portalId ? readiness.data : undefined;

    return (
        <div className="space-y-4">
            <HookHeader
                entry={data}
                selection={selection}
                readiness={portalReadiness}
                readinessLoading={readiness.isLoading}
                readinessError={readiness.isError ? readiness.error : null}
            />

            <Tabs value={tab} onValueChange={value => setTab(value as HookTab)}>
                <TabsList className="h-auto flex-wrap">
                    {tabs.map(item => (
                        <TabsTrigger key={item} value={item}>
                            {HOOK_TAB_LABEL[item]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={HOOK_TAB.theory} className="mt-4 space-y-4">
                    <SectionCard>
                        {data.theory ? (
                            <MarkdownView text={data.theory} />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {HOOKS_TEXT.theoryEmpty}
                            </p>
                        )}
                    </SectionCard>
                    <HookEffects entry={data} />
                </TabsContent>

                <TabsContent value={HOOK_TAB.howItWorks} className="mt-4 space-y-4">
                    <SectionCard title={HOOKS_TEXT.triggersTitle}>
                        {data.triggers.length > 0 ? (
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                                {data.triggers.map(trigger => (
                                    <li key={trigger}>{trigger}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {HOOKS_TEXT.triggersEmpty}
                            </p>
                        )}
                    </SectionCard>
                    <SectionCard>
                        {data.howItWorks ? (
                            <MarkdownView text={data.howItWorks} />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {HOOKS_TEXT.howItWorksEmpty}
                            </p>
                        )}
                    </SectionCard>
                </TabsContent>

                <TabsContent value={HOOK_TAB.endpoints} className="mt-4">
                    <HookEndpointsTab entry={data} />
                </TabsContent>

                <TabsContent value={HOOK_TAB.settings} className="mt-4">
                    <HookSettingsTab entry={data} portalId={selection.portalId} />
                </TabsContent>

                <TabsContent value={HOOK_TAB.fields} className="mt-4">
                    <HookFieldsTab
                        entry={data}
                        portalId={selection.portalId}
                        readiness={portalReadiness}
                    />
                </TabsContent>

                <TabsContent value={HOOK_TAB.install} className="mt-4">
                    <HookInstallTab
                        entry={data}
                        portalId={selection.portalId}
                        fixed={selection.isFixed}
                    />
                </TabsContent>

                {data.operationHook && (
                    <TabsContent value={HOOK_TAB.monitoring} className="mt-4">
                        <HookMonitoringTab entry={data} portalId={selection.portalId} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
