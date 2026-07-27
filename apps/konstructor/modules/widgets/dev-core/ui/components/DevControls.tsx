'use client';

import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import type { RowSetContext } from '@/modules/entities/row-set';
import type { useDevCore } from '../../hooks/use-dev-core';

/** Контекст цен (регион/налог) + фикстура + v1-слепок + сброс */
export const DevControls = ({
    context,
    controls,
    snapshot,
}: {
    context: RowSetContext;
    controls: ReturnType<typeof useDevCore>['controls'];
    snapshot: ReturnType<typeof useDevCore>['snapshot'];
}) => {
    const catalog = useAppSelector(selectCatalog);

    return (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card p-3">
            <label className="flex flex-col gap-1 text-xs">
                Регион
                <select
                    className="rounded border bg-background px-2 py-1 text-sm"
                    value={context.regionCode ?? ''}
                    onChange={event => controls.setRegion(event.target.value)}
                >
                    {catalog.regions.items.map(region => (
                        <option key={region.code} value={region.code}>
                            {region.title}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex items-center gap-2 pb-1 text-sm">
                <input
                    type="checkbox"
                    checked={context.withTax}
                    onChange={event => controls.setWithTax(event.target.checked)}
                />
                Налог поставщика 5%
            </label>
            <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm"
                onClick={controls.loadFixture}
            >
                Каталог из oldinit
            </button>
            <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm"
                onClick={snapshot.loadSnapshot}
            >
                Восстановить v1-слепок
            </button>
            <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm text-destructive"
                onClick={controls.resetAll}
            >
                Сброс
            </button>
            {snapshot.snapshotWarnings.length ? (
                <div className="w-full rounded bg-warning/10 px-2 py-1 text-xs text-warning">
                    {snapshot.snapshotWarnings.map(warning => (
                        <div key={warning}>{warning}</div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
