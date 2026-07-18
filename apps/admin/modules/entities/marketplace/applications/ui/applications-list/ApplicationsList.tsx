'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationDto } from '@workspace/nest-admin-api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useApplications } from '../../lib/hooks/use-applications';
import { ApplicationsTable } from '../applications-table';

const ALL = 'all';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: ALL, label: 'Все статусы' },
    { value: 'pending', label: 'Ожидают' },
    { value: 'approved', label: 'Одобрены' },
    { value: 'blocked', label: 'Заблокированы' },
];

/** Список заявок на подключение маркетплейс-приложения с фильтром по статусу допуска. */
export function ApplicationsList() {
    const router = useRouter();
    const [approvalStatus, setApprovalStatus] = React.useState<string>(ALL);

    const { data, isLoading } = useApplications(
        approvalStatus === ALL ? undefined : approvalStatus,
    );

    const handleRowClick = (item: ApplicationDto) => {
        router.push(`/marketplace/applications/${item.portalId}`);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4 gap-4">
                <h1 className="text-3xl font-bold">Заявки маркетплейса</h1>
                <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Статус допуска" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ApplicationsTable
                data={Array.isArray(data) ? data : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
            />
        </>
    );
}
