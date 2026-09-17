'use client';

import { FC } from 'react';
import { ToneBadge } from '@workspace/april-ui';
import type { InnCurrent } from '../model';
import { innDigitsLabel, innOriginLabel } from '../lib/inn-deal-view';

interface InnCurrentBlockProps {
    current: InnCurrent | null;
}

/**
 * Первое, что видит менеджер: ИНН договора крупно — или красная плашка
 * «не выбран».
 *
 * Значение показывается моноширинным: ИНН сверяют посимвольно с бумагой, и
 * пропорциональный шрифт для этого не годится.
 */
export const InnCurrentBlock: FC<InnCurrentBlockProps> = ({ current }) => {
    if (!current) {
        return (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2">
                <p className="text-sm font-semibold text-destructive">
                    ИНН договора не выбран
                </p>
                <p className="text-xs text-muted-foreground">
                    Выберите плательщика ниже — по нему уйдут счёт и документы.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-lg font-semibold tracking-wide">
                    {current.inn}
                </span>
                <ToneBadge tone="muted" variant="soft" size="sm">
                    {innDigitsLabel(current.digits)}
                </ToneBadge>
                {current.unverified && (
                    <ToneBadge
                        tone="warning"
                        variant="soft"
                        size="sm"
                        title="Значение проставил ночной догон при нескольких вариантах — подтвердите выбор."
                    >
                        проставлено автоматически, подтвердите
                    </ToneBadge>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                {innOriginLabel(current)}
            </p>
        </div>
    );
};
