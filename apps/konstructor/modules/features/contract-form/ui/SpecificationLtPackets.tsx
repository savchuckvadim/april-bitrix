'use client';

import type { ContractSpecificationItem } from '@/modules/entities/contract-document';
import { ltPacketsOf } from '../lib/specification-sections.util';

export interface SpecificationLtPacketsProps {
    items: ContractSpecificationItem[];
}

/**
 * Legal Tech в спецификации: каждый пакет отдельной карточкой — название и
 * состав. Строки собирает бэк из наполнения, здесь они только для чтения.
 */
export const SpecificationLtPackets = ({ items }: SpecificationLtPacketsProps) => (
    <div className="grid gap-2 sm:grid-cols-2">
        {ltPacketsOf(items).map(packet => (
            <div key={packet.key} className="rounded-md border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">{packet.label}</p>
                <p className="text-sm font-medium">{packet.name || 'Без названия'}</p>
                {packet.services.length ? (
                    <ul className="mt-1 list-disc pl-4 text-sm">
                        {packet.services.map(service => (
                            <li key={service}>{service}</li>
                        ))}
                    </ul>
                ) : null}
            </div>
        ))}
    </div>
);
