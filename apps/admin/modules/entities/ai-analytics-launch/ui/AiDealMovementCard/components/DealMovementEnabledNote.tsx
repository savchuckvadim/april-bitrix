'use client';

import Link from 'next/link';
import {
    DEAL_MOVEMENT_TEXT,
    dealMovementSettingsHref,
} from '../../../consts/deal-movement.const';

interface DealMovementEnabledNoteProps {
    enabled: boolean;
    portalId: number;
}

/**
 * Включён ли ночной счёт на портале; выключен — где включить, со ссылкой
 * на категорию «Движение сделок» в настройках приложений портала.
 */
export const DealMovementEnabledNote = ({
    enabled,
    portalId,
}: DealMovementEnabledNoteProps) =>
    enabled ? (
        <p className="text-sm text-success">{DEAL_MOVEMENT_TEXT.enabled}</p>
    ) : (
        <div className="space-y-1 rounded-md border border-warning/50 bg-warning/5 p-3 text-sm">
            <p>{DEAL_MOVEMENT_TEXT.disabled}</p>
            <Link
                href={dealMovementSettingsHref(portalId)}
                className="underline underline-offset-2 hover:text-foreground"
            >
                {DEAL_MOVEMENT_TEXT.settingsLink}
            </Link>
        </div>
    );
