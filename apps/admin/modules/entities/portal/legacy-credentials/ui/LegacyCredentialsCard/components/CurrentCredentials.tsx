'use client';

import { Button } from '@workspace/ui/components/button';
import { LEGACY_CREDENTIALS_TEXT } from '../../../consts/legacy-credentials.const';
import type { LegacyCredentials } from '../../../model';
import { CredentialValueRow } from './CredentialValueRow';

interface CurrentCredentialsProps {
    current: LegacyCredentials;
    reveal: boolean;
    keysDiffer: boolean;
    onToggleReveal: () => void;
}

/** Текущие ключ и вебхук портала в online (по умолчанию под маской). */
export const CurrentCredentials = ({
    current,
    reveal,
    keysDiffer,
    onToggleReveal,
}: CurrentCredentialsProps) => (
    <div className="space-y-2">
        <CredentialValueRow
            label={LEGACY_CREDENTIALS_TEXT.currentKey}
            value={current.key}
            reveal={reveal}
        />
        <CredentialValueRow
            label={LEGACY_CREDENTIALS_TEXT.currentHook}
            value={current.C_REST_WEB_HOOK_URL}
            reveal={reveal}
        />
        <div className="flex flex-wrap items-center gap-3">
            <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={onToggleReveal}
            >
                {reveal
                    ? LEGACY_CREDENTIALS_TEXT.hide
                    : LEGACY_CREDENTIALS_TEXT.reveal}
            </Button>
            {keysDiffer && (
                <p className="text-xs text-warning">
                    {LEGACY_CREDENTIALS_TEXT.mismatch}
                </p>
            )}
        </div>
    </div>
);
