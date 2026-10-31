'use client';

import type { LtPacketView } from '@/modules/entities/composition';
import { cn } from '@workspace/ui/lib/utils';
import { describeLtPacketLines } from '../lib/lt-packet-line.util';

export interface LtPacketsStripProps {
    packets: LtPacketView[];
}

/** Полоса пакетов над списком LT: галочки одни, а раскладку по пакетам видно сразу. */
export const LtPacketsStrip = ({ packets }: LtPacketsStripProps) => {
    if (!packets.length) return null;

    return (
        <ul className="flex flex-col gap-1 rounded-md bg-muted/50 px-3 py-2 text-xs">
            {describeLtPacketLines(packets).map(line => (
                <li key={line.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="shrink-0 text-muted-foreground">{line.label}</span>
                    <span className="min-w-0 font-medium">{line.title}</span>
                    <span
                        className={cn(
                            'ml-auto tabular-nums',
                            line.isWarning ? 'text-warning' : 'text-muted-foreground',
                        )}
                    >
                        {line.note}
                    </span>
                </li>
            ))}
        </ul>
    );
};
