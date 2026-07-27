'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
    CONVERSION_METHOD_HINTS,
    CONVERSION_METHOD_LABELS,
} from '../lib/conversion-catalog';
import type { ConversionMethod } from '../model/conversion.types';

interface ConversionMethodSwitchProps {
    method: ConversionMethod;
    onChange: (method: ConversionMethod) => void;
}

const METHODS: ConversionMethod[] = ['chain', 'fromBase'];

/** Переключатель способа расчёта конверсий (стиль вкладок типов отчёта). */
export const ConversionMethodSwitch: React.FC<ConversionMethodSwitchProps> = ({
    method,
    onChange,
}) => (
    <div className="flex items-center gap-2">
        {METHODS.map(item => (
            <Tooltip key={item}>
                <TooltipTrigger asChild>
                    <Button
                        variant={method === item ? 'default' : 'outline'}
                        className="text-xs h-6 px-2"
                        onClick={() => onChange(item)}
                    >
                        {CONVERSION_METHOD_LABELS[item]}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                    {CONVERSION_METHOD_HINTS[item]}
                </TooltipContent>
            </Tooltip>
        ))}
    </div>
);
