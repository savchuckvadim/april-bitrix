'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export interface RegionsButtonProps {
    onClick: () => void;
}

/** Кнопка у регионального блока: открывает окно выбора регионов состава. */
export const RegionsButton = ({ onClick }: RegionsButtonProps) => (
    <span className="flex shrink-0 items-center pr-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClick} className="h-6 gap-1 px-2 text-xs">
            <MapPin aria-hidden className="size-3" />
            Регионы
        </Button>
    </span>
);
