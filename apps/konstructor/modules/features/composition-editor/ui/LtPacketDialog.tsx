'use client';

import type { ReactNode } from 'react';
import { GlassDialog } from '@workspace/april-ui';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import type { KRow } from '@/modules/entities/row-set';
import { useCompositionEditor } from '../hooks/use-composition-editor';
import { CompositionMessages } from './CompositionMessages';
import { LtOtherPacketCard } from './LtOtherPacketCard';

export interface LtPacketDialogProps {
    /** Garant-строка, в наполнении которой лежит пакет */
    row: KRow;
    packetId: string;
    /** Кнопки внизу: добавление или правка */
    footer: ReactNode;
    /** Закрытие крестиком или кликом мимо окна */
    onClose: () => void;
}

/**
 * Один пакет Legal Tech окном: его сервисы, вес и пакет каталога. Остальное
 * наполнение товара здесь не показывается — правится только этот пакет.
 */
export const LtPacketDialog = ({ row, packetId, footer, onClose }: LtPacketDialogProps) => {
    const editor = useCompositionEditor(row);
    const index = editor.composition?.ltOther.findIndex(packet => packet.id === packetId) ?? -1;
    const packet = index >= 0 ? editor.composition?.ltOther[index] : undefined;
    const view = editor.ltPackets.find(item => item.id === packetId);

    return (
        <GlassDialog
            open
            onOpenChange={next => (next ? undefined : onClose())}
            size="lg"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>Пакет Legal Tech</DialogTitle>
                <DialogDescription>
                    Отметьте сервисы — пакет каталога подберётся по их весу.
                </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto pr-1">
                {packet && view ? (
                    <LtOtherPacketCard
                        index={index}
                        packet={packet}
                        view={view}
                        catalog={editor.catalog}
                        onApply={editor.applyComposition}
                    />
                ) : null}
            </div>
            <CompositionMessages
                violations={[]}
                blocked={editor.messages.blocked}
                autoFixes={editor.messages.autoFixes}
            />
            <DialogFooter className="gap-2 border-t pt-3">{footer}</DialogFooter>
        </GlassDialog>
    );
};
