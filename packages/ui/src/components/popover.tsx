'use client';

import * as React from 'react';
/*
 * Импорт через сборный `radix-ui`, а НЕ через @radix-ui/react-popover напрямую:
 * pnpm резолвил их в разные физические копии @radix-ui/react-dismissable-layer
 * (у Dialog одна, у Popover другая). Контекст слоёв там — модульный синглтон,
 * поэтому Popover внутри модального Dialog не знал, что тот выставил
 * `body { pointer-events: none }`, и не возвращал себе `pointer-events: auto`:
 * клики проваливались СКВОЗЬ список под попап, фокус не держался в поиске,
 * Esc закрывал окно вместе с попапом. Сборный пакет даёт один инстанс на всех.
 */
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@workspace/ui/lib/utils';

function Popover({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

function PopoverAnchor({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
