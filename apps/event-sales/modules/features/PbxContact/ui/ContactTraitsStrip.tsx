'use client';

import { FC } from 'react';
import { GradientScale } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    currentItemIndex,
    currentItemName,
    shortFieldName,
    traitDirection,
    traitRamp,
} from '../lib/contact-field-view';

interface ContactTraitsStripProps {
    fields: PBXContactFieldData[];
    /**
     * `column` — полоски этажами, по одной в строке. Нужен в узких местах:
     * в ряд три шкалы по 25px превращаются в нечитаемые чёрточки.
     */
    direction?: 'row' | 'column';
    /** Клик по миниатюре — раскрыть карточку контакта целиком. */
    onOpen?: () => void;
    className?: string;
}

/** Подпись направления: тултип должен объяснять, почему хвост зелёный/красный. */
const DIRECTION_NOTE: Record<string, string | null> = {
    up: 'Чем правее — тем лучше',
    down: 'Чем правее — тем хуже',
    neutral: null,
};

/**
 * Миниатюра характеристик: по тонкой полоске на каждую.
 *
 * Характеристик у контакта до девяти, и в карточке дела (а во фрейме-вкладке
 * это 630×600) списком они не помещаются вовсе. Полоски дают то, ради чего на
 * них смотрят мельком: где контакт слаб, где силён и что вообще не заполнено —
 * пустой трек видно сразу. Названия и значения — в тултипах, подробности — в
 * развёрнутой карточке.
 */
export const ContactTraitsStrip: FC<ContactTraitsStripProps> = ({
    fields,
    direction = 'row',
    onOpen,
    className,
}) => {
    if (!fields.length) return null;

    return (
        <div
            className={cn(
                'flex min-w-0 gap-1',
                direction === 'column'
                    ? 'flex-col items-stretch gap-0.5'
                    : 'items-center',
                className,
            )}
            onClick={onOpen}
        >
            {fields.map(field => {
                const name = shortFieldName(field.field.name);
                const value = currentItemName(field);
                const note = DIRECTION_NOTE[traitDirection(field.field.code)];

                return (
                    <GradientScale
                        key={field.bitrixId}
                        className={cn(
                            'min-w-0 py-0.5',
                            direction === 'row' && 'flex-1',
                            onOpen && 'cursor-pointer',
                        )}
                        labels={field.items.map(item => item.name)}
                        currentIndex={currentItemIndex(field)}
                        ramp={traitRamp(field.field.code)}
                        title={name}
                        currentWord="сейчас"
                        note={
                            note && (
                                <p className="text-primary-foreground/60">
                                    {note}
                                </p>
                            )
                        }
                        ariaLabel={`${name}: ${value ?? 'не задано'}`}
                    />
                );
            })}
        </div>
    );
};
