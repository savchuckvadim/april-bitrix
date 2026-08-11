'use client';

import { FC } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { LEAD_REQUEST_BOOL_LABEL } from '../consts/lead-request.const';
import type { LeadRequestBoolPatchKey } from '../lib/hooks/use-lead-request';
import type { LeadRequestCard } from '../model';

interface LeadRequestMarksProps {
    card: LeadRequestCard;
    disabled: boolean;
    onChange: (key: LeadRequestBoolPatchKey, value: boolean) => void;
}

/** Чекбоксы булевых маркеров заявки (boost / НПП / чёрный список). */
export const LeadRequestMarks: FC<LeadRequestMarksProps> = ({
    card,
    disabled,
    onChange,
}) => {
    const marks: [LeadRequestBoolPatchKey, boolean][] = [
        ['boostSale', card.boostSale],
        ['nppReported', card.nppReported],
        ['blackShort', card.blackShort],
    ];
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            {marks.map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 text-xs">
                    <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={value => onChange(key, value === true)}
                    />
                    {LEAD_REQUEST_BOOL_LABEL[key]}
                </label>
            ))}
        </div>
    );
};
