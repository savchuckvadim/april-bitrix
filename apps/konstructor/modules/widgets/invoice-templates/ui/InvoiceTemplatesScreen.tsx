'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { Screen, ScreenHeader } from '@/modules/shared';
import { useInvoiceTemplatesScreen } from '../hooks/use-invoice-templates-screen';
import { InvoiceTemplateFormDialog } from './InvoiceTemplateFormDialog';
import { InvoiceTemplateResolverCard } from './InvoiceTemplateResolverCard';
import { InvoiceTemplateTable } from './InvoiceTemplateTable';
import { InvoiceTemplatesNotices } from './InvoiceTemplatesNotices';
import { InvoiceTemplatesSkeleton } from './InvoiceTemplatesSkeleton';
import { InvoiceTemplatesToolbar } from './InvoiceTemplatesToolbar';

export interface InvoiceTemplatesScreenProps {
    /** Переключатель разделов настроек над заголовком. */
    tabs?: ReactNode;
}

/**
 * Шаблоны счетов: какой шаблон уйдёт сейчас, таблица шаблонов общих и
 * портала с привязкой, критериями и статусом, добавление и правка. Счёт
 * собирается по Word-шаблону, который бэк подбирает под портал, поставщика,
 * тип клиента и тип поставки.
 */
export const InvoiceTemplatesScreen = ({ tabs }: InvoiceTemplatesScreenProps) => {
    const screen = useInvoiceTemplatesScreen();

    return (
        <Screen width="full" className="gap-4">
            {tabs}
            <ScreenHeader
                title="Шаблоны счетов"
                description="Word-шаблоны счетов, которые уходят вместе с КП."
                actions={
                    <>
                        <Button
                            onClick={screen.openCreate}
                            disabled={!screen.canCreate || screen.isLoading}
                            title={screen.createHint}
                        >
                            <Plus aria-hidden />
                            Добавить шаблон
                        </Button>
                        <Button variant="ghost" onClick={screen.back}>
                            <ArrowLeft aria-hidden />
                            Назад
                        </Button>
                    </>
                }
            />
            <InvoiceTemplatesNotices
                hasPortal={screen.hasPortal}
                loadError={screen.loadError}
                onRetry={screen.reload}
            />
            <InvoiceTemplateResolverCard
                card={screen.card}
                isRefreshing={screen.isCardRefreshing}
                bindingLabel={screen.cardBindingLabel}
                check={screen.check}
            />
            <InvoiceTemplatesToolbar
                shown={screen.rows.length}
                total={screen.total}
                archived={screen.archived}
                showArchived={screen.showArchived}
                isRefreshing={screen.isRefreshing}
                quotaText={screen.quotaText}
                onShowArchived={screen.setShowArchived}
                onRefresh={screen.reload}
            />
            {screen.isLoading ? (
                <InvoiceTemplatesSkeleton />
            ) : screen.rows.length ? (
                <InvoiceTemplateTable
                    items={screen.rows}
                    busyId={screen.busyId}
                    onToggleActive={screen.toggleActive}
                    onToggleDefault={screen.toggleDefault}
                    onToggleArchive={screen.toggleArchive}
                    onDownload={screen.download}
                    onEdit={screen.openEdit}
                    onDelete={screen.remove}
                />
            ) : screen.loadError ? null : (
                <EmptyState
                    icon={FileText}
                    title="Шаблонов счетов нет"
                    description="Добавьте Word-шаблон счёта: без него счёт к КП не соберётся."
                />
            )}
            <InvoiceTemplateFormDialog
                open={screen.dialog.open}
                editing={screen.dialog.editing}
                quota={screen.quota}
                isSaving={screen.isSaving}
                onCreate={screen.create}
                onUpdate={screen.update}
                onClose={screen.closeDialog}
            />
        </Screen>
    );
};
