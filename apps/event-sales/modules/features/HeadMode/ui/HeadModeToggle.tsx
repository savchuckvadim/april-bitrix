'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { useHeadMode } from '../lib/hooks/use-head-mode';
import { HEAD_MODE_TEXT } from '../lib/head-mode-texts';

/** Тумблер режима руководителя — виден только тому, у кого есть сотрудники. */
export const HeadModeToggle: FC = () => {
    const { isHead, enabled, toggle } = useHeadMode();

    if (!isHead) return null;

    return (
        <HintTooltip title={HEAD_MODE_TEXT.toggleHint}>
            <div className="flex items-center gap-2">
                <Label
                    htmlFor="head-mode"
                    className="cursor-pointer text-xs text-muted-foreground"
                >
                    {HEAD_MODE_TEXT.toggle}
                </Label>
                <Switch
                    id="head-mode"
                    checked={enabled}
                    onCheckedChange={toggle}
                    className="cursor-pointer"
                />
            </div>
        </HintTooltip>
    );
};
