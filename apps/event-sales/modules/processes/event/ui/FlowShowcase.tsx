'use client';

import { FC } from 'react';
import Image from 'next/image';
import { FlowShowcaseImage } from '../lib/flow-progress';

interface FlowShowcaseProps {
    image: FlowShowcaseImage | null;
}

/**
 * Кадр-заставка на время ожидания очереди.
 *
 * `key` по src нужен, чтобы React перемонтировал картинку на смене кадра —
 * иначе анимация появления проиграется один раз и больше не повторится.
 * Место под картинку зарезервировано всегда: без этого экран прыгает, когда
 * первый кадр появляется через полторы секунды.
 */
export const FlowShowcase: FC<FlowShowcaseProps> = ({ image }) => (
    <div className="relative h-40 w-full">
        {image && (
            <Image
                key={image.src}
                src={image.src}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 90vw, 384px"
                priority={false}
                className="rounded-lg border border-border object-contain opacity-90 shadow-sm duration-700 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
            />
        )}
    </div>
);
