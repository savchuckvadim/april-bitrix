'use client';

import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    className?: string;
}

const ColorPicker = ({ color, onChange, className }: ColorPickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-[220px] justify-start text-left font-normal',
                        !color && 'text-muted-foreground',
                        className,
                    )}
                >
                    <div
                        className="mr-2 h-4 w-4 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    {color}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
                <HexColorPicker color={color} onChange={onChange} />
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;
