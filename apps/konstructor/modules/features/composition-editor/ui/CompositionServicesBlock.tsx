'use client';

import type { Composition } from '@/modules/entities/composition';
import type { CompositionAction } from '@/modules/entities/composition';
import type { Catalog } from '@/modules/entities/catalog';

interface CompositionServicesBlockProps {
    composition: Composition;
    catalog: Catalog;
    onApply: (action: CompositionAction) => void;
}

/** Консалтинг (эксклюзивный выбор), СТАР и Академия для выбранной строки */
export const CompositionServicesBlock = ({
    composition,
    catalog,
    onApply,
}: CompositionServicesBlockProps) => (
    <>
        <div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Консалтинг / СТАР
            </div>
            <select
                className="mb-2 w-full rounded border bg-background px-2 py-1 text-sm"
                value={composition.consalting ?? ''}
                onChange={event =>
                    onApply({
                        kind: 'setConsalting',
                        code: event.target.value || null,
                    })
                }
            >
                <option value="">Только Горячая линия</option>
                {catalog.services.consalting
                    .filter(service => service.code !== 'hotline')
                    .map(service => (
                        <option key={service.code} value={service.code}>
                            {service.name}
                        </option>
                    ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={composition.star}
                    onChange={event =>
                        onApply({
                            kind: 'toggleStar',
                            checked: event.target.checked,
                        })
                    }
                />
                СТАР
            </label>
        </div>
        <div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Академия
            </div>
            <select
                className="w-full rounded border bg-background px-2 py-1 text-sm"
                value={composition.academy ?? ''}
                onChange={event =>
                    onApply({
                        kind: 'setAcademy',
                        code: event.target.value || null,
                    })
                }
            >
                <option value="">Без академии</option>
                {catalog.academy.map(pkg => (
                    <option key={pkg.code} value={pkg.code}>
                        {pkg.totalHours} ч / {pkg.monthQuantity ?? 'до конца'}{' '}
                        мес — {pkg.price.toLocaleString('ru-RU')} ₽
                    </option>
                ))}
            </select>
        </div>
    </>
);
