'use client';

import { Boxes, Calculator, PackageOpen } from 'lucide-react';
import { ActionTile } from '@workspace/april-ui/actions';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import { FlowSummary } from '@/modules/features/flow-summary';
import { DealSendButton } from '@/modules/features/deal-send';
import { ServicePeriodSwitch } from '@/modules/features/service-period';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useDocumentHub } from '../hooks/use-document-hub';

/** Хаб сделки / шаг 4: выбор документа, справа — сводка сборки. */
export const DocumentHubScreen = () => {
    const hub = useDocumentHub();

    if (!hub.hasMainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={PackageOpen}
                    title="Сборки ещё нет"
                    description="Документ делается по собранному комплекту и ценам."
                    actions={<Button onClick={hub.toCreate}>Начать сборку</Button>}
                />
            </Screen>
        );
    }

    return (
        <Screen>
            <ScreenHeader
                title="Документ"
                description="Проверьте сборку и выберите, какой документ сделать."
                actions={<ServicePeriodSwitch />}
            />
            <ScreenSplit
                aside={
                    <FlowSummary
                        title="Сборка"
                        actions={
                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex justify-end">
                                    <DealSendButton className="w-full" />
                                </div>
                                <Button variant="outline" onClick={hub.toComplect}>
                                    <Boxes aria-hidden />
                                    Комплект
                                </Button>
                                <Button variant="outline" onClick={hub.toPrices}>
                                    <Calculator aria-hidden />
                                    Цены
                                </Button>
                            </div>
                        }
                    >
                        <BuildSummary />
                    </FlowSummary>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {hub.documents.map(document => (
                        <ActionTile
                            key={document.kind}
                            icon={document.icon}
                            tone="complect"
                            title={document.title}
                            description={document.description}
                            onClick={() => hub.openDocument(document.kind)}
                        />
                    ))}
                </div>
            </ScreenSplit>
        </Screen>
    );
};
