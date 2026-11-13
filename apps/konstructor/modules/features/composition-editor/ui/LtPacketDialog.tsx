'use client';

import type { ReactNode } from 'react';
import { GlassDialog } from '@workspace/april-ui';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import type { LtPacketDraftState } from '../hooks/use-lt-packet-draft';
import { CompositionMessages } from './CompositionMessages';
import { LtOtherPacketCard } from './LtOtherPacketCard';

export interface LtPacketDialogProps {
    /** Пакет в черновике окна */
    draft: LtPacketDraftState;
    /** Кнопки внизу: добавление или правка */
    footer: ReactNode;
    /** Крестик, Esc или клик мимо окна — как «Отмена» */
    onClose: () => void;
}

/**
 * Один пакет Legal Tech окном: его сервисы, вес и пакет каталога. Остальное
 * наполнение товара здесь не показывается. Правки живут в окне, пока их не
 * сохранили; убрать пакет целиком — кнопкой в его строке.
 */
export const LtPacketDialog = ({ draft, footer, onClose }: LtPacketDialogProps) => (
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
                Отметьте сервисы — пакет каталога подберётся по их весу. В таблицу пакет попадёт
                после сохранения.
            </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">
            {draft.packet && draft.view ? (
                <LtOtherPacketCard
                    index={draft.index}
                    packet={draft.packet}
                    view={draft.view}
                    catalog={draft.editor.catalog}
                    removable={false}
                    onApply={draft.editor.applyComposition}
                />
            ) : null}
        </div>
        <CompositionMessages
            violations={[]}
            blocked={draft.editor.messages.blocked}
            autoFixes={draft.editor.messages.autoFixes}
        />
        <DialogFooter className="gap-2 border-t pt-3">{footer}</DialogFooter>
    </GlassDialog>
);
