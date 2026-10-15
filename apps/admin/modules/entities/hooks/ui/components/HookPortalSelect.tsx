'use client';

import { useMemo } from 'react';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { usePortals } from '@/modules/entities/portal';
import { HOOK_SELECT_NONE_VALUE, HOOKS_TEXT } from '../../consts/hooks.const';
import { parsePortalIdParam, toPortalSelectOptions } from '../../lib/hooks-view';

interface HookPortalSelectProps {
    value: number | undefined;
    onChange: (portalId: number | undefined) => void;
}

/** Селект портала глобального раздела: без портала виден только каталог. */
export const HookPortalSelect = ({ value, onChange }: HookPortalSelectProps) => {
    const portals = usePortals();
    const options = useMemo(
        () => toPortalSelectOptions(portals.data),
        [portals.data],
    );

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="hooks-portal">{HOOKS_TEXT.portal}</Label>
            <Select
                value={value ? String(value) : HOOK_SELECT_NONE_VALUE}
                onValueChange={next =>
                    onChange(
                        next === HOOK_SELECT_NONE_VALUE
                            ? undefined
                            : parsePortalIdParam(next),
                    )
                }
            >
                <SelectTrigger id="hooks-portal" className="w-80">
                    <SelectValue placeholder={HOOKS_TEXT.portalPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={HOOK_SELECT_NONE_VALUE}>
                        {HOOKS_TEXT.portalNone}
                    </SelectItem>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {portals.isError && (
                <span className="text-xs text-destructive">
                    {HOOKS_TEXT.portalLoadError}
                </span>
            )}
        </div>
    );
};
