import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT, TONE_TEXT, type Tone } from '@workspace/april-ui/tones';

interface OverviewTileProps {
    label: string;
    value: string;
    hint?: string;
    tone?: Tone;
    /** Куда ведёт плитка (страница админки). */
    href?: string;
}

/** Плитка показателя в шапке сводки: число/состояние, подпись, подсказка. */
export const OverviewTile = ({ label, value, hint, tone = 'muted', href }: OverviewTileProps) => {
    const body = (
        <div className={cn('flex h-full flex-col gap-1 rounded-lg p-3', TONE_SOFT[tone])}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={cn('text-lg font-semibold leading-tight', TONE_TEXT[tone])}>{value}</span>
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
    );
    return href ? (
        <Link href={href} className="block transition-opacity hover:opacity-80">
            {body}
        </Link>
    ) : (
        body
    );
};
