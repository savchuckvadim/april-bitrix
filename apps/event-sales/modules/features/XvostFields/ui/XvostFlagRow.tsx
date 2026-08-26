'use client';

import { FC } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import type { XvostFlagView } from '../lib/hooks/use-xvost-fields';

/**
 * Один булев вопрос «Разговора»: подпись слева, свитч с «Да/Нет» справа.
 * Свитч отражает записанное значение и переключается по факту ответа CRM
 * (запись пессимистичная), а не по клику.
 */
export const XvostFlagRow: FC<{ flag: XvostFlagView }> = ({ flag }) => (
    <div className="flex min-w-0 items-center justify-between gap-2">
        <Label className="min-w-0 flex-1 text-xs font-normal text-muted-foreground">
            <span title={flag.label} className="block truncate">
                {flag.label}
            </span>
        </Label>
        <span className="flex shrink-0 items-center gap-1.5">
            <Switch checked={flag.value} onCheckedChange={flag.setValue} />
            <span className="min-w-6 text-xs text-muted-foreground">
                {flag.value ? 'Да' : 'Нет'}
            </span>
        </span>
    </div>
);
