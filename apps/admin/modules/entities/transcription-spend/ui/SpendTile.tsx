import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT, TONE_TEXT, type Tone } from '@workspace/april-ui/tones';

interface SpendTileProps {
    label: string;
    value: string;
    hint?: string;
    tone?: Tone;
}

/** Плитка показателя расхода: подпись, значение, подсказка. */
export const SpendTile = ({ label, value, hint, tone = 'muted' }: SpendTileProps) => (
    <div className={cn('flex h-full flex-col gap-1 rounded-lg p-3', TONE_SOFT[tone])}>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('text-lg font-semibold leading-tight', TONE_TEXT[tone])}>{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
);
