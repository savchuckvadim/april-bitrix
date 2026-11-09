import { Camera, Clapperboard } from 'lucide-react';
import type { PlatformShotId, PlatformShotSpec } from '../model/shots';

export interface ShotPlaceholderProps {
    id: PlatformShotId;
    shot: PlatformShotSpec;
}

/** Рамка «что здесь снять» — только при разработке, на проде не рисуется. */
export function ShotPlaceholder({ id, shot }: ShotPlaceholderProps) {
    const Icon = shot.kind === 'video' ? Clapperboard : Camera;
    return (
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 text-center">
            <Icon className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-mono text-xs text-primary">{id}</p>
            <p className="max-w-md text-sm text-foreground">{shot.what}</p>
            <p className="max-w-md text-xs text-muted-foreground">{shot.where}</p>
        </div>
    );
}
