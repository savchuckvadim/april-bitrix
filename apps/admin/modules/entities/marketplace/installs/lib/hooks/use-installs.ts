'use client';

import { useQuery } from '@tanstack/react-query';
import {
    AdminMarketplaceInstallDetailsDto,
    AdminMarketplaceInstallDto,
    MarketplaceModerationGetInstallsParams,
} from '@workspace/nest-admin-api';
import { InstallsHelper } from '../api/installs-helper';

const helper = new InstallsHelper();

/** Список установок маркетплейс-приложения (фильтры: домен, статус). */
export const useInstalls = (params?: MarketplaceModerationGetInstallsParams) => {
    return useQuery<AdminMarketplaceInstallDto[], Error>({
        queryKey: [
            'marketplace-installs',
            params?.domain ?? '',
            params?.memberId ?? '',
            params?.installStatus ?? '',
        ],
        queryFn: () => helper.list(params),
        placeholderData: (prev) => prev,
    });
};

/** Одна установка с полным списком компонент-статусов. */
export const useInstall = (installId: string) => {
    return useQuery<AdminMarketplaceInstallDetailsDto, Error>({
        queryKey: ['marketplace-install', installId],
        queryFn: () => helper.get(installId),
        enabled: !!installId,
    });
};
