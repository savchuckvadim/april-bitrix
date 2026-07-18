'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    ApprovalStatusBadge,
    InstallStatusBadge,
    StatusBadge,
    TokenStateBadge,
    InstallComponentsSection,
    formatDateTime,
} from '../../../shared';
import { useInstall } from '../../lib/hooks/use-installs';

interface InstallCardProps {
    installId: string;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-right">{children}</span>
        </div>
    );
}

/** Деталка установки: все поля marketplace_installs + компоненты по осям. */
export function InstallCard({ installId }: InstallCardProps) {
    const { data: install, isLoading } = useInstall(installId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!install) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Установка не найдена
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-xl">
                            {install.domain || `Установка ${install.installId}`}
                        </CardTitle>
                        <InstallStatusBadge
                            status={install.installStatus}
                            title={install.errorDetail}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <InfoRow label="ID установки">
                        <span className="font-mono text-xs">{install.installId}</span>
                    </InfoRow>
                    <InfoRow label="Портал">#{install.portalId}</InfoRow>
                    <InfoRow label="Домен">{install.domain || '—'}</InfoRow>
                    <InfoRow label="member_id">
                        <span className="font-mono text-xs">{install.memberId || '—'}</span>
                    </InfoRow>
                    <InfoRow label="Допуск портала">
                        <ApprovalStatusBadge status={install.approvalStatus} />
                    </InfoRow>
                    <InfoRow label="Приложение">
                        <span className="font-mono text-xs">{install.appCode}</span>
                    </InfoRow>
                    <InfoRow label="Версия">{install.version || '—'}</InfoRow>
                    <InfoRow label="Установлено">
                        {formatDateTime(install.installedAt)}
                    </InfoRow>
                    <InfoRow label="Удалено">
                        {install.uninstalledAt ? (
                            <StatusBadge color="red">
                                {formatDateTime(install.uninstalledAt)}
                            </StatusBadge>
                        ) : (
                            '—'
                        )}
                    </InfoRow>
                    <InfoRow label="Токен">
                        <TokenStateBadge
                            tokenExpiresAt={install.tokenExpiresAt}
                            hasRefreshToken={install.hasRefreshToken}
                        />
                    </InfoRow>
                    {install.errorStep && (
                        <InfoRow label="Шаг ошибки">
                            <span className="text-red-600 dark:text-red-400">
                                {install.errorStep}
                            </span>
                        </InfoRow>
                    )}
                    {install.errorDetail && (
                        <InfoRow label="Детали ошибки">
                            <span className="text-red-600 dark:text-red-400 break-all">
                                {install.errorDetail}
                            </span>
                        </InfoRow>
                    )}
                    <InfoRow label="Компонентов">{install.componentsCount}</InfoRow>
                </CardContent>
            </Card>

            <InstallComponentsSection components={install.components ?? []} />
        </div>
    );
}
