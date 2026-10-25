'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import type { Catalog } from '@/modules/entities/catalog';
import {
    ltOtherPacketTitle,
    ltOtherPacketWeight,
    resolveLtOtherPackage,
    type CompositionAction,
    type CompositionMode,
    type LtOtherPacket,
} from '@/modules/entities/composition';
import { CompositionCheckbox } from './CompositionCheckbox';

interface LtOtherPacketCardProps {
    index: number;
    packet: LtOtherPacket;
    mode: CompositionMode;
    catalog: Catalog;
    serviceDepartment: boolean;
    onApply: (action: CompositionAction) => void;
}

/**
 * Один пакет LT-other: название (своё — правится на месте, иначе пакет
 * каталога по весу), вес, удаление и сервисы чекбоксами.
 */
export const LtOtherPacketCard = ({
    index,
    packet,
    mode,
    catalog,
    serviceDepartment,
    onApply,
}: LtOtherPacketCardProps) => {
    const pkg = resolveLtOtherPackage(catalog, packet, { serviceDepartment, mode });
    const weight = ltOtherPacketWeight(packet, catalog);
    const title = ltOtherPacketTitle(packet, pkg);
    const [draft, setDraft] = useState<string | null>(null);

    const commitName = () => {
        if (draft === null) return;
        onApply({ kind: 'renameLtOtherPacket', id: packet.id, name: draft });
        setDraft(null);
    };

    return (
        <div className="rounded-md border bg-card p-2">
            <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">№{index + 1}</span>
                {draft === null ? (
                    <button
                        type="button"
                        onDoubleClick={() => setDraft(packet.alternativeName ?? '')}
                        onClick={() => setDraft(packet.alternativeName ?? '')}
                        title="Своё название пакета"
                        className={`min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline ${
                            pkg ? '' : 'text-muted-foreground'
                        }`}
                    >
                        {title}
                    </button>
                ) : (
                    <input
                        autoFocus
                        className="min-w-0 flex-1 rounded border bg-background px-1 py-0.5 text-sm font-medium"
                        placeholder={pkg?.fullName ?? 'Название пакета'}
                        value={draft}
                        onChange={event => setDraft(event.target.value)}
                        onBlur={commitName}
                        onKeyDown={event => {
                            if (event.key === 'Enter') commitName();
                            if (event.key === 'Escape') setDraft(null);
                        }}
                    />
                )}
                <ToneBadge tone={pkg ? 'complect' : 'warning'} variant="soft">
                    вес {weight}
                </ToneBadge>
                <IconAction
                    icon={Trash2}
                    label="Убрать пакет"
                    onClick={() => onApply({ kind: 'removeLtOtherPacket', id: packet.id })}
                />
            </div>
            <div className="mt-1 grid gap-x-2 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
                {catalog.services.lt.map(service => (
                    <CompositionCheckbox
                        key={service.code}
                        name={service.name}
                        checked={packet.services.includes(service.code)}
                        onToggle={next =>
                            onApply({
                                kind: 'toggleLtOtherService',
                                id: packet.id,
                                code: service.code,
                                checked: next,
                            })
                        }
                    />
                ))}
            </div>
        </div>
    );
};
