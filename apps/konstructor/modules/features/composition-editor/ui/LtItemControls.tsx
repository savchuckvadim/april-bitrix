'use client';

import { Lock } from 'lucide-react';
import type { LtPlacement } from '@/modules/entities/composition';
import type { LtItemInfo } from '../lib/composition-sections.util';
import { IskraSubtitleEditor } from './IskraSubtitleEditor';
import { LtPlacementTag } from './LtPlacementTag';

export interface LtItemControlsProps {
    lt: LtItemInfo;
    /** Без правил метку можно нажать и перенести сервис */
    onMove?: (to: LtPlacement) => void;
    onSubtitle: (code: string, subtitle: string | null) => void;
}

/** Правая часть пункта LT: подпись и счётчик Искры, замок, куда попал сервис. */
export const LtItemControls = ({ lt, onMove, onSubtitle }: LtItemControlsProps) => {
    const { iskra } = lt;
    if (!iskra && !lt.placement && !lt.locked) return null;

    return (
        <span className="flex shrink-0 items-center gap-1.5 pr-2">
            {iskra && iskra.count > 0 ? (
                <>
                    <span
                        title="Сколько раз сервис входит в сборку: основной список и доп. пакеты"
                        className="text-[0.6875rem] leading-none text-muted-foreground tabular-nums"
                    >
                        ×{iskra.count}
                    </span>
                    <IskraSubtitleEditor
                        baseName={iskra.baseName}
                        subtitle={iskra.subtitle}
                        onChange={subtitle => onSubtitle(iskra.code, subtitle)}
                    />
                </>
            ) : null}
            {lt.locked ? <Lock aria-label="Входит всегда" className="size-3 text-muted-foreground" /> : null}
            {lt.placement ? <LtPlacementTag placement={lt.placement} onMove={onMove} /> : null}
        </span>
    );
};
