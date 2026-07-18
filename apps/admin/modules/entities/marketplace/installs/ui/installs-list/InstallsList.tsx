'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AdminMarketplaceInstallDto } from '@workspace/nest-admin-api';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useInstalls } from '../../lib/hooks/use-installs';
import { InstallsTable } from '../installs-table';

const ALL = 'all';

const INSTALL_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: ALL, label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'tokens_stored', label: 'Токены сохранены' },
    { value: 'events_bound', label: 'События привязаны' },
    { value: 'placements_bound', label: 'Виджеты привязаны' },
    { value: 'provisioning', label: 'Установка сущностей' },
    { value: 'installed', label: 'Установлено' },
    { value: 'error', label: 'Ошибка' },
];

/** Список установок маркетплейс-приложения с фильтрами по домену и статусу. */
export function InstallsList() {
    const router = useRouter();
    const [domain, setDomain] = React.useState('');
    const [installStatus, setInstallStatus] = React.useState<string>(ALL);

    const { data, isLoading } = useInstalls({
        domain: domain.trim() || undefined,
        installStatus: installStatus === ALL ? undefined : installStatus,
    });

    const handleRowClick = (item: AdminMarketplaceInstallDto) => {
        router.push(`/marketplace/installs/${item.installId}`);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold">Установки</h1>
                <div className="flex items-center gap-2">
                    <Input
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Поиск по домену"
                        className="w-56"
                    />
                    <Select value={installStatus} onValueChange={setInstallStatus}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Статус установки" />
                        </SelectTrigger>
                        <SelectContent>
                            {INSTALL_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <InstallsTable
                data={Array.isArray(data) ? data : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
            />
        </>
    );
}
