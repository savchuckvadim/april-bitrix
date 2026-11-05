'use client';

import { Plus } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { PagePreloader } from '@/modules/shared';
import { useRequisites } from '../hooks/use-requisites';
import { RequisiteSelect } from './RequisiteSelect';
import { RequisitesNotice } from './RequisitesNotice';
import { RequisitesTabs } from './RequisitesTabs';

/** Реквизиты клиента: выбор, новый реквизит, основные поля, адреса, банк. */
export const RequisitesWidget = () => {
    const rq = useRequisites();

    if (!rq.hasCompany) {
        return (
            <RequisitesNotice text="У сделки нет компании: реквизиты заводятся в карточке компании Битрикса, привяжите компанию к сделке." />
        );
    }
    if (rq.isLoading) {
        return <PagePreloader text="Загрузка реквизитов..." />;
    }
    if (!rq.isReady || !rq.hasCurrent) {
        return <RequisitesNotice text="Реквизиты не загружены. Обновите страницу или проверьте доступ к сервису реквизитов." />;
    }

    return (
        <div id="modal-root" className="space-y-4">
            <SectionCard
                title="Реквизиты клиента"
                description={
                    rq.clientTypeSource
                        ? `Тип клиента: ${rq.clientTypeName} (из ${rq.clientTypeSource === 'company' ? 'компании' : 'сделки'}). Сменить можно в шапке.`
                        : `Тип клиента не задан, показаны реквизиты организации. Задайте тип в шапке.`
                }
                tone="complect"
                actions={
                    <Button variant="outline" size="sm" onClick={rq.startNew} disabled={rq.isBusy}>
                        <Plus className="h-4 w-4" />
                        Новый реквизит
                    </Button>
                }
            >
                <div className="flex flex-wrap items-center gap-3">
                    <RequisiteSelect
                        items={rq.items}
                        currentId={rq.currentId}
                        placeholder={rq.items.length ? 'Выберите реквизиты' : 'Реквизитов этого типа ещё нет'}
                        disabled={rq.isBusy}
                        onSelect={rq.select}
                    />
                    {rq.isSaved ? (
                        <Badge variant="outline">заполнено {rq.fill.full}%</Badge>
                    ) : (
                        <Badge variant="secondary">не сохранён</Badge>
                    )}
                </div>
            </SectionCard>

            <RequisitesTabs detailsEnabled={rq.isSaved} />
        </div>
    );
};
