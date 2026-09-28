import { maskHookKey } from '../../../lib/legacy-credentials.util';

interface CredentialValueRowProps {
    label: string;
    value?: string;
    reveal: boolean;
}

/** Одна строка «подпись — значение» с маской ключа. */
export const CredentialValueRow = ({
    label,
    value,
    reveal,
}: CredentialValueRowProps) => (
    <div className="grid gap-1 sm:grid-cols-[18rem_1fr] sm:items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <code className="break-all font-mono text-xs">
            {reveal ? value || '—' : maskHookKey(value)}
        </code>
    </div>
);
