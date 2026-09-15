import type { FC } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    THEORY_SCREEN_ASPECT_CLASS,
    THEORY_SCREEN_PREFIX,
} from '../../constants/theory-copy';
import type { TheoryScreen as TheoryScreenContent } from '../../theory-types';

/**
 * Место под скриншот интерфейса.
 *
 * Без `src` — рамка с подписью «СКРИН: …»: владелец снимает по списку, а
 * читатель видит, что здесь будет картинка, а не дыра. С `src` — сама
 * картинка в той же рамке, подпись остаётся под ней.
 */
export const TheoryScreen: FC<TheoryScreenContent> = ({
    label,
    aspect,
    src,
}) => {
    const caption = `${THEORY_SCREEN_PREFIX}: ${label}`;

    return (
        <figure className="w-full">
            <div
                className={cn(
                    'bg-muted/30 relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border',
                    src ? 'border-solid' : 'border-dashed',
                    aspect ? THEORY_SCREEN_ASPECT_CLASS[aspect] : 'min-h-40',
                )}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={label}
                        fill
                        sizes="(min-width: 1024px) 896px, 100vw"
                        className="object-contain"
                    />
                ) : (
                    <ImageIcon
                        className="text-muted-foreground/50 size-8"
                        aria-hidden
                    />
                )}
            </div>
            <figcaption className="text-muted-foreground mt-2 text-center text-xs font-semibold tracking-wide uppercase">
                {caption}
            </figcaption>
        </figure>
    );
};
