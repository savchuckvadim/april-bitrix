'use client';

import { FC, useRef, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useIsClamped } from '../lib/use-is-clamped';

/**
 * Сколько текста видно до тумана.
 *
 * Обычная карточка живёт в столбце с десятком соседей — там три строки.
 * Просторная — единственное дело на экране (встройка в задачу), и прятать в
 * туман то, ради чего экран открыт, незачем.
 */
const CLAMP_HEIGHT = {
    normal: 'max-h-[4.125rem]',
    spacious: 'max-h-[13rem]',
} as const;

interface FogTextProps {
    text: string;
    /** Карточка одна на экране — отдаём тексту больше высоты. */
    spacious?: boolean;
    className?: string;
}

/**
 * Длинный текст, уходящий в «туман»: после ~3 строк растворяется градиентной
 * маской, «Развернуть» возвращает целиком. Во фрейме-миниатюре (detail tab
 * 630×600) вертикаль дороже всего — длинный комментарий не должен выталкивать
 * действия карточки за экран.
 */
export const FogText: FC<FogTextProps> = ({ text, spacious, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);
    // В раскрытом виде замер заморожен, иначе кнопка «Свернуть» пропадала
    // из-под фокуса на кадр после клика (см. use-is-clamped).
    const isClamped = useIsClamped(textRef, text, !isOpen);
    const isFogged = !isOpen && isClamped;

    return (
        <div className={cn('relative', isFogged && 'pb-5', className)}>
            <p
                ref={textRef}
                className={cn(
                    'text-sm leading-relaxed text-muted-foreground',
                    !isOpen && [
                        spacious ? CLAMP_HEIGHT.spacious : CLAMP_HEIGHT.normal,
                        'overflow-hidden',
                    ],
                    // Маска — только когда текст реально обрезан: проценты
                    // градиента считаются от фактической высоты элемента, и на
                    // коротком тексте туман съедал бы половину единственной
                    // строки без возможности раскрыть.
                    isFogged &&
                        '[mask-image:linear-gradient(180deg,black_45%,transparent_98%)]',
                )}
            >
                {text}
            </p>
            {(isClamped || isOpen) && (
                <Button
                    variant="link"
                    size="sm"
                    className={cn(
                        'h-auto p-0 text-xs',
                        isFogged && 'absolute bottom-0 left-0',
                    )}
                    onClick={() => setIsOpen(open => !open)}
                >
                    {isOpen ? 'Свернуть' : 'Развернуть'}
                </Button>
            )}
        </div>
    );
};
