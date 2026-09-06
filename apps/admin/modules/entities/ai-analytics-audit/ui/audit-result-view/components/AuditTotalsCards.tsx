import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import type { AuditTotalTile } from '../../../lib/audit-report.catalog';

interface AuditTotalsCardsProps {
    tiles: readonly AuditTotalTile[];
}

/** Плитки итогов окна: счётчики report.totals и доли «достаточных» ячеек. */
export const AuditTotalsCards = ({ tiles }: AuditTotalsCardsProps) => (
    <div className="space-y-2">
        <h3 className="text-sm font-semibold">{AUDIT_TEXT.totalsTitle}</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map(tile => (
                <div
                    key={tile.key}
                    className="rounded-lg border border-border bg-muted/40 px-3 py-2"
                >
                    <p className="text-xs text-muted-foreground">{tile.title}</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {tile.value}
                    </p>
                </div>
            ))}
        </div>
    </div>
);
