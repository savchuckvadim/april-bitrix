'use client';

import { useDigestSummary } from '../hooks/use-digest-summary';
import { DigestTile } from '../../digest-section';

/** Итоги дня по выборке: шесть плиток. */
export const DigestSummary = () => {
    const { tiles, scopeLabel } = useDigestSummary();
    return (
        <section aria-label={`Итоги дня, ${scopeLabel}`}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {tiles.map(tile => (
                    <DigestTile key={tile.key} tile={tile} />
                ))}
            </div>
        </section>
    );
};
