'use client';

import {
    getComplectAttr,
    getComplectIcon,
    getComplectStyleOverride,
    type KComplect,
} from '@/modules/entities/catalog';

interface CurrentComplectNameProps {
    complect: KComplect | null;
}

/** Имя текущего комплекта (главной строки) с темой и иконкой комплекта */
export const CurrentComplectName = ({ complect }: CurrentComplectNameProps) => {
    if (!complect) {
        return (
            <span className="text-sm text-muted-foreground">
                Комплект не выбран
            </span>
        );
    }
    const Icon = getComplectIcon(complect.code);
    return (
        <span
            data-complect={getComplectAttr(complect.code)}
            style={getComplectStyleOverride(complect)}
            className="flex items-center gap-2"
        >
            <Icon className="h-5 w-5 text-complect-current" />
            <span className="text-base font-semibold text-foreground">
                {complect.fullTitle}
            </span>
            <span className="rounded bg-complect-current px-1.5 py-0.5 text-[10px] uppercase text-complect-current-foreground">
                {complect.type}
            </span>
        </span>
    );
};
