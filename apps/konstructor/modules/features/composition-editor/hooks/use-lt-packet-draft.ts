'use client';

import { addLtOtherPacket } from '@/modules/entities/composition';
import type { KRow } from '@/modules/entities/row-set';
import { useCompositionDraft } from './use-composition-draft';
import { useCompositionEditor } from './use-composition-editor';

export interface LtPacketDraftOptions {
    /** Новый пакет: в черновик кладётся пустой пакет с этим id */
    create?: boolean;
    /** После сохранения — закрыть окно */
    onDone: () => void;
}

/**
 * Один доп. пакет LT в черновике окна. Строку товара пакет даёт, только когда
 * его вес собрал пакет каталога, — сохранить можно только собранный пакет,
 * иначе строка пропала бы из таблицы.
 */
export const useLtPacketDraft = (row: KRow, packetId: string, { create, onDone }: LtPacketDraftOptions) => {
    const draft = useCompositionDraft(
        row,
        create ? composition => addLtOtherPacket(composition, packetId) : undefined,
    );
    const editor = useCompositionEditor(draft.row, draft.write);
    const index = editor.composition?.ltOther.findIndex(packet => packet.id === packetId) ?? -1;
    const packet = index >= 0 ? (editor.composition?.ltOther[index] ?? null) : null;
    const view = editor.ltPackets.find(item => item.id === packetId) ?? null;

    return {
        editor,
        index,
        packet,
        view,
        /** Вес собрал пакет каталога — пакет станет строкой товара */
        assembled: Boolean(view?.package),
        changed: draft.changed,
        confirm: () => {
            draft.save();
            onDone();
        },
    };
};

export type LtPacketDraftState = ReturnType<typeof useLtPacketDraft>;
