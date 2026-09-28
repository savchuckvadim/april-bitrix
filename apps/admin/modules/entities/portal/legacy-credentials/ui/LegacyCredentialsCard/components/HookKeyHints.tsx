import { LEGACY_CREDENTIALS_TEXT } from '../../../consts/legacy-credentials.const';
import type { SecretsCarryOver } from '../../../model';

interface HookKeyHintsProps {
    draft: string;
    nextKey: string;
    error: string | null;
    secretsCarryOver: SecretsCarryOver | null;
}

/** Подсказки под вводом: ошибка или итоговый ключ и судьба client ID/secret. */
export const HookKeyHints = ({
    draft,
    nextKey,
    error,
    secretsCarryOver,
}: HookKeyHintsProps) => {
    if (!draft.trim()) return null;
    if (error) return <p className="text-xs text-destructive">{error}</p>;

    return (
        <div className="space-y-1 text-xs text-muted-foreground">
            <p>
                {LEGACY_CREDENTIALS_TEXT.willSave}:{' '}
                <code className="font-mono text-foreground">{nextKey}</code>
            </p>
            {secretsCarryOver && (
                <p>{LEGACY_CREDENTIALS_TEXT.secrets[secretsCarryOver]}</p>
            )}
        </div>
    );
};
