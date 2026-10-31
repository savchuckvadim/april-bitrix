'use client';

import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/index';
import { ownPriceLabel } from '../../lib/region-view.util';
import type { PortalRegion } from '../../model';
import { PortalRegionsCardRow } from './PortalRegionsCardRow';

interface PortalRegionsCardProps {
    item: PortalRegion;
}

/** Регион глазами портала: общий рабс, своя цена и итоговые значения */
export function PortalRegionsCard({ item }: PortalRegionsCardProps) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <CardTitle className="text-xl">
                    <Link
                        href={`/garant/regions/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {item.title}
                    </Link>
                </CardTitle>
                <CardDescription className="mt-1">
                    <span className="block">ID: {item.id}</span>
                    <span className="block">Код: {item.code}</span>
                    <span className="block">Инфоблок: {item.infoblock}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <PortalRegionsCardRow label="Рабс региона" value={item.abs} />
                <PortalRegionsCardRow
                    label="Свой рабс"
                    value={ownPriceLabel(item)}
                />
                <PortalRegionsCardRow
                    label="Действует: рабс"
                    value={item.effective_abs}
                />
                <PortalRegionsCardRow
                    label="Действует: налог"
                    value={item.effective_tax}
                />
                <PortalRegionsCardRow
                    label="Действует: рабс с налогом"
                    value={item.effective_tax_abs}
                />
            </CardContent>
        </Card>
    );
}
