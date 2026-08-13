'use client';

import { FC } from 'react';
import { getAppUrl } from '@/modules/app/lib/utills/url';
import { FlowShowcaseImage } from '../lib/flow-progress';

interface FlowShowcaseProps {
    image: FlowShowcaseImage | null;
}

/**
 * Кадр-заставка на время ожидания очереди.
 *
 * Обычный `<img>`, а не `next/image`: приложение живёт под basePath `/sales`
 * во фрейме портала, и оптимизатор (`/_next/image?url=…`) там не доезжает —
 * картинки лежали в `public`, а на экране не появлялись. Путь собирает
 * `getAppUrl` — единственное место, где к внутренним ссылкам добавляется
 * префикс. Оптимизировать тут всё равно нечего: три маленьких PNG.
 *
 * `key` по src нужен, чтобы React перемонтировал картинку на смене кадра —
 * иначе анимация появления проиграется один раз и больше не повторится.
 * Место под картинку зарезервировано всегда: без этого экран прыгает, когда
 * первый кадр появляется через полторы секунды.
 */
export const FlowShowcase: FC<FlowShowcaseProps> = ({ image }) => (
    <div className="relative h-40 w-full">
        {image && (
            // eslint-disable-next-line @next/next/no-img-element -- см. коммент выше
            <img
                key={image.src}
                src={getAppUrl(image.src)}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full rounded-lg border border-border object-contain opacity-90 shadow-sm duration-700 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
            />
        )}
    </div>
);
