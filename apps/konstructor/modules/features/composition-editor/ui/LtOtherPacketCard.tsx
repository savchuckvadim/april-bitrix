'use client';

import { Trash2 } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import type { Catalog } from '@/modules/entities/catalog';
import {
    ltPacketHint,
    type CompositionAction,
    type LtOtherPacket,
    type LtPacketView,
} from '@/modules/entities/composition';
import { useLtPacketName } from '../hooks/use-lt-packet-name';
import { CompositionCheckbox } from './CompositionCheckbox';
import { WeightMark } from './WeightMark';

interface LtOtherPacketCardProps {
    index: number;
    packet: LtOtherPacket;
    view: LtPacketView;
    catalog: Catalog;
    /** Корзина «Убрать пакет»; в окне пакета её нет — пакет убирается из его строки */
    removable?: boolean;
    onApply: (action: CompositionAction) => void;
}

/**
 * Один пакет LT-other: название (своё — правится на месте, иначе пакет
 * каталога по весу), вес, что поправить, удаление и сервисы чекбоксами.
 */
export const LtOtherPacketCard = ({
    index,
    packet,
    view,
    catalog,
    removable = true,
    onApply,
}: LtOtherPacketCardProps) => {
    const name = useLtPacketName(packet.alternativeName, value =>
        onApply({ kind: 'renameLtOtherPacket', id: packet.id, name: value }),
    );
    const needsFix = view.status === 'incomplete' || view.status === 'locked';

    return (
        <div className="rounded-md border bg-card p-2">
            <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">№{index + 1}</span>
                {name.draft === null ? (
                    <button
                        type="button"
                        onClick={name.startEditing}
                        title="Своё название пакета"
                        className={`min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline ${
                            view.package ? '' : 'text-muted-foreground'
                        }`}
                    >
                        {view.title}
                    </button>
                ) : (
                    <input
                        autoFocus
                        className="min-w-0 flex-1 rounded border bg-background px-1 py-0.5 text-sm font-medium"
                        placeholder={view.package?.fullName ?? 'Название пакета'}
                        value={name.draft}
                        onChange={event => name.setDraft(event.target.value)}
                        onBlur={name.commit}
                        onKeyDown={event => {
                            if (event.key === 'Enter') name.commit();
                            if (event.key === 'Escape') name.cancel();
                        }}
                    />
                )}
                <ToneBadge tone={view.package ? 'complect' : 'warning'} variant="soft">
                    вес {view.weight}
                </ToneBadge>
                {removable ? (
                    <IconAction
                        icon={Trash2}
                        label="Убрать пакет"
                        onClick={() => onApply({ kind: 'removeLtOtherPacket', id: packet.id })}
                    />
                ) : null}
            </div>
            {needsFix ? <p className="mt-1 px-2 text-xs text-warning">{ltPacketHint(view)}</p> : null}
            <div className="mt-1 grid gap-x-2 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
                {catalog.services.lt.map(service => (
                    <CompositionCheckbox
                        key={service.code}
                        name={service.name}
                        checked={packet.services.includes(service.code)}
                        mark={<WeightMark value={service.weight > 1 ? service.weight : null} kind="number" />}
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
