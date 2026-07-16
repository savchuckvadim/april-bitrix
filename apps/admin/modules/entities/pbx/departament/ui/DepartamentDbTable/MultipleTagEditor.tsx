'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { DEPARTAMENT_MULTIPLE_TAGS } from '../../lib/model/departament';

const NONE = '__none__';
const CUSTOM = '__custom__';

function isKnownTag(tag: string): boolean {
    return (DEPARTAMENT_MULTIPLE_TAGS as readonly string[]).includes(tag);
}

/**
 * Editor for `multiple_tag`: a select with the known tags (ОП / ОС), «не задан»
 * and «свой тэг» (reveals a free-text input). Emits `null` when the tag is unset.
 */
export function MultipleTagEditor({
    value,
    onChange,
    disabled,
}: {
    value: string | null;
    onChange: (tag: string | null) => void;
    disabled?: boolean;
}) {
    const [customMode, setCustomMode] = React.useState(
        value !== null && !isKnownTag(value),
    );

    const selectValue =
        customMode ? CUSTOM : value === null ? NONE : value;

    const onSelect = (v: string) => {
        if (v === NONE) {
            setCustomMode(false);
            onChange(null);
        } else if (v === CUSTOM) {
            setCustomMode(true);
            if (value !== null && isKnownTag(value)) onChange(null);
        } else {
            setCustomMode(false);
            onChange(v);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={selectValue} onValueChange={onSelect} disabled={disabled}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={NONE}>— не задан</SelectItem>
                    {DEPARTAMENT_MULTIPLE_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                            {tag}
                        </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM}>свой тэг…</SelectItem>
                </SelectContent>
            </Select>
            {customMode && (
                <Input
                    value={value ?? ''}
                    placeholder="custom-тэг"
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value || null)}
                    className="w-32"
                />
            )}
        </div>
    );
}