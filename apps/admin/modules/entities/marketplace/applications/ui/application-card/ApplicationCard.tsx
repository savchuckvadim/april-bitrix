'use client';

import * as React from 'react';
import { PortalProductDto } from '@workspace/nest-admin-api';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { DataTable, Column } from '@/modules/shared';
import {
    CheckCircle2,
    Ban,
    RefreshCw,
    LayoutGrid,
    Loader2,
    Unlink,
} from 'lucide-react';
import {
    ApprovalStatusBadge,
    InstallStatusBadge,
    TokenStateBadge,
    ProductStatusBadge,
    InstallComponentsSection,
    formatDateTime,
} from '../../../shared';
import {
    useApplication,
    useApplicationComponents,
    usePortalProducts,
    useDecideApplication,
    useProvisionRefresh,
    usePlacementsRefresh,
} from '../../lib/hooks/use-applications';
import {
    ApprovalDialog,
    type ModeratorAction,
} from '../approval-dialog/ApprovalDialog';

interface ApplicationCardProps {
    portalId: string;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-right">{children}</span>
        </div>
    );
}

const productColumns: Column<PortalProductDto>[] = [
    {
        id: 'code',
        header: 'Код',
        cell: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
        id: 'status',
        header: 'Статус',
        cell: (row) => <ProductStatusBadge status={row.status} />,
        className: 'w-40',
    },
    {
        id: 'activatedAt',
        header: 'Активирован',
        cell: (row) => formatDateTime(row.activatedAt),
        className: 'w-44',
    },
];

/** Деталка заявки: карточка портала, продукты, компоненты установки и действия модератора. */
export function ApplicationCard({ portalId }: ApplicationCardProps) {
    const { data: application, isLoading } = useApplication(portalId);
    const { data: components, isLoading: componentsLoading } =
        useApplicationComponents(portalId);
    const { data: products, isLoading: productsLoading } = usePortalProducts(portalId);

    const decide = useDecideApplication();
    const provisionRefresh = useProvisionRefresh();
    const placementsRefresh = usePlacementsRefresh();

    const [dialogAction, setDialogAction] =
        React.useState<ModeratorAction | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Заявка не найдена
            </div>
        );
    }

    const handleDecide = (comment?: string) => {
        if (!dialogAction) return;
        decide.mutate(
            { portalId, dto: { action: dialogAction, comment } },
            { onSuccess: () => setDialogAction(null) },
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">
                                {application.domain || `Портал #${application.portalId}`}
                            </CardTitle>
                        </div>
                        <ApprovalStatusBadge status={application.approvalStatus} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <InfoRow label="Домен">{application.domain || '—'}</InfoRow>
                    <InfoRow label="member_id">
                        <span className="font-mono text-xs">
                            {application.memberId || '—'}
                        </span>
                    </InfoRow>
                    <InfoRow label="Организация">
                        {application.organizationName || '—'}
                    </InfoRow>
                    <InfoRow label="Email">{application.contactEmail || '—'}</InfoRow>
                    <InfoRow label="Статус клиента">
                        {application.clientStatus || '—'}
                    </InfoRow>
                    <InfoRow label="Статус установки">
                        <InstallStatusBadge status={application.installStatus} />
                    </InfoRow>
                    <InfoRow label="Токен установки">
                        <TokenStateBadge
                            tokenExpiresAt={application.tokenExpiresAt}
                            hasRefreshToken={application.hasRefreshToken}
                        />
                    </InfoRow>
                    {application.uninstalledAt && (
                        <InfoRow label="Удалено">
                            {formatDateTime(application.uninstalledAt)}
                        </InfoRow>
                    )}
                    <InfoRow label="Одобрено">
                        {application.approvedAt
                            ? `${formatDateTime(application.approvedAt)}${application.approvedBy ? ` (${application.approvedBy})` : ''}`
                            : '—'}
                    </InfoRow>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Действия</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setDialogAction('approve')}
                        disabled={decide.isPending}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Одобрить
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDialogAction('block')}
                        disabled={decide.isPending}
                    >
                        <Ban className="w-4 h-4" />
                        Заблокировать
                    </Button>
                    {/* Отвязка ≠ блокировка: допуск → pending, портал снова
                        просит код подключения (переустановка допуск сохраняет) */}
                    <Button
                        variant="outline"
                        onClick={() => setDialogAction('detach')}
                        disabled={decide.isPending}
                    >
                        <Unlink className="w-4 h-4" />
                        Отвязать
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => provisionRefresh.mutate(portalId)}
                        disabled={provisionRefresh.isPending}
                    >
                        {provisionRefresh.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Переустановить сущности
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => placementsRefresh.mutate(portalId)}
                        disabled={placementsRefresh.isPending}
                    >
                        {placementsRefresh.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LayoutGrid className="w-4 h-4" />
                        )}
                        Синхронизировать виджеты
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Продукты</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={Array.isArray(products) ? products : []}
                        columns={productColumns}
                        isLoading={productsLoading}
                        emptyMessage="Продукты не найдены"
                    />
                </CardContent>
            </Card>

            <InstallComponentsSection
                components={Array.isArray(components) ? components : []}
                isLoading={componentsLoading}
            />

            <ApprovalDialog
                open={dialogAction !== null}
                onOpenChange={(open) => {
                    if (!open) setDialogAction(null);
                }}
                action={dialogAction ?? 'approve'}
                domain={application.domain}
                onConfirm={handleDecide}
                isLoading={decide.isPending}
            />
        </div>
    );
}
