'use client';

import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
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
    row: KRow;
    packetId: string;
    canConfirm: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Новый пакет Legal Tech с шага цен: в окне только этот пакет — его
 * сервисы, вес и пакет каталога. Остальное наполнение товара здесь не нужно.
 */
export const LtPacketDialog = ({ row, packetId, canConfirm, onConfirm, onCancel }: LtPacketDialogProps) => {
    const editor = useCompositionEditor(row);
    const index = editor.composition?.ltOther.findIndex(packet => packet.id === packetId) ?? -1;
    const packet = index >= 0 ? editor.composition?.ltOther[index] : undefined;
    const view = editor.ltPackets.find(item => item.id === packetId);

    return (
        <GlassDialog
            open
            onOpenChange={next => (next ? undefined : onConfirm())}
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
            <DialogFooter className="gap-2 border-t pt-3">
                <Button variant="outline" onClick={onCancel}>
                    Отменить
                </Button>
                <Button disabled={!canConfirm} onClick={onConfirm}>
                    Добавить пакет
                </Button>
            </DialogFooter>
        </GlassDialog>
    );
};
