'use client';

import { Plus } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';
import { Button } from '@workspace/ui/components/button';
import type { Catalog } from '@/modules/entities/catalog';
import type {
    Composition,
    CompositionAction,
} from '@/modules/entities/composition';
import { LtOtherPacketCard } from './LtOtherPacketCard';

interface CompositionLtOtherBlockProps {
    composition: Composition;
    catalog: Catalog;
    serviceDepartment: boolean;
    onApply: (action: CompositionAction) => void;
}

/**
 * Дополнительные пакеты Legal Tech (легаси LtOtherManage): каждый — свой
 * набор сервисов, пакет каталога подбирается по весу; строка lt_other в сете
 * появляется у собранного пакета. Пустой список — только кнопка добавления.
 */
export const CompositionLtOtherBlock = ({
    composition,
    catalog,
    serviceDepartment,
    onApply,
}: CompositionLtOtherBlockProps) => (
    <section className="rounded-lg border">
        <div className="flex items-center gap-2 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                Legal Tech — дополнительные пакеты
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onApply({ kind: 'addLtOtherPacket', id: nanoid(8) })}
            >
                <Plus aria-hidden />
                Пакет
            </Button>
        </div>
        {composition.ltOther.length ? (
            <div className="flex flex-col gap-2 border-t p-2">
                {composition.ltOther.map((packet, index) => (
                    <LtOtherPacketCard
                        key={packet.id}
                        index={index}
                        packet={packet}
                        mode={composition.mode}
                        catalog={catalog}
                        serviceDepartment={serviceDepartment}
                        onApply={onApply}
                    />
                ))}
            </div>
        ) : null}
    </section>
);
