'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { PortalRegionsDraft } from '../../lib/hooks/use-portalRegions-bulk';
import type { PortalRegion } from '../../model';
import { PortalRegionRow } from './PortalRegionRow';

interface PortalRegionsBulkTableProps {
    regions: PortalRegion[];
    isLoading?: boolean;
    draft: PortalRegionsDraft;
}

/**
 * Регионы портала: галочка доступности и своя цена. Правки видны сразу,
 * в систему уходят по кнопке «Сохранить».
 */
export function PortalRegionsBulkTable({
    regions,
    isLoading,
    draft,
}: PortalRegionsBulkTableProps) {
    if (isLoading) {
        return (
            <p className="text-muted-foreground py-6 text-sm">
                Загружаем регионы…
            </p>
        );
    }
    if (regions.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-sm">
                Регионы не найдены.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Доступен</TableHead>
                    <TableHead>Регион</TableHead>
                    <TableHead className="w-24">Код</TableHead>
                    <TableHead className="w-28">Рабс региона</TableHead>
                    <TableHead className="w-[28rem]">Свой рабс портала</TableHead>
                    <TableHead className="w-24">Действует</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {regions.map(region => (
                    <PortalRegionRow
                        key={region.id}
                        region={region}
                        draft={draft}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
