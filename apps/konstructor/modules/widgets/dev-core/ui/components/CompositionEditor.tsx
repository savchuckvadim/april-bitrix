'use client';

import { useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';
import type { useDevCore } from '../../hooks/use-dev-core';

/**
 * Редактор наполнения ВЫБРАННОЙ строки (любой garant-строки любого сета) —
 * снятие легаси-ограничения «наполнение только у главного товара».
 * Тумблер rules/free: в free правила не принуждают, только подсвечивают.
 */
export const CompositionEditor = ({
    row,
    composition,
}: {
    row: KRow | null;
    composition: ReturnType<typeof useDevCore>['composition'];
}) => {
    const catalog = useAppSelector(selectCatalog);
    const value = row?.composition;

    if (!row || !value) {
        return (
            <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
                Выберите garant-строку — наполнение доступно каждой
            </div>
        );
    }

    const infoblocks = Object.values(catalog.infoblocks).filter(
        block => block.groupType === 'infoblocks',
    );
    const ers = Object.values(catalog.infoblocks).filter(
        block => block.groupType === 'er' && block.groupCode !== 'per',
    );
    const erPackets = Object.values(catalog.infoblocks).filter(
        block => block.groupCode === 'per',
    );

    const checkboxList = (
        title: string,
        items: { code: string; name: string }[],
        checked: (code: string) => boolean,
        onToggle: (code: string, next: boolean) => void,
    ) => (
        <div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                {title}
            </div>
            <div className="flex flex-col gap-0.5">
                {items.map(item => (
                    <label
                        key={item.code}
                        className="flex items-center gap-2 text-sm"
                    >
                        <input
                            type="checkbox"
                            checked={checked(item.code)}
                            onChange={event =>
                                onToggle(item.code, event.target.checked)
                            }
                        />
                        <span className="truncate">{item.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const { applyComposition, toggleMode, lastResult, weightCheck } =
        composition;

    return (
        <div className="rounded-lg border bg-card p-3">
            <div className="mb-2 flex items-center gap-3">
                <span className="text-sm font-semibold">
                    Наполнение: {row.names.shortName}
                </span>
                <button
                    type="button"
                    onClick={toggleMode}
                    className={`ml-auto rounded px-2 py-1 text-xs ${
                        value.mode === 'rules'
                            ? 'bg-success text-success-foreground'
                            : 'bg-warning text-warning-foreground'
                    }`}
                >
                    {value.mode === 'rules' ? 'По правилам' : 'Без правил'}
                </button>
            </div>

            {weightCheck ? (
                <div
                    className={`mb-2 rounded px-2 py-1 text-xs ${
                        weightCheck.matches
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                    }`}
                >
                    Вес: {weightCheck.weight} / эталон {weightCheck.expected}
                </div>
            ) : null}

            {lastResult?.violations.length ? (
                <div className="mb-2 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
                    {lastResult.violations.map(violation => (
                        <div key={violation.code}>{violation.message}</div>
                    ))}
                </div>
            ) : null}
            {lastResult?.autoFixes.length ? (
                <div className="mb-2 rounded bg-info/10 px-2 py-1 text-xs text-info">
                    {lastResult.autoFixes.map(fix => (
                        <div key={fix}>{fix}</div>
                    ))}
                </div>
            ) : null}

            <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3">
                {checkboxList(
                    'Инфоблоки',
                    infoblocks,
                    code => value.infoblocks.includes(code),
                    (code, next) =>
                        applyComposition({
                            kind: 'toggleInfoblock',
                            code,
                            checked: next,
                        }),
                )}
                {checkboxList(
                    'Пакеты ЭР',
                    erPackets,
                    code => value.erPackets.includes(code),
                    (code, next) =>
                        applyComposition({
                            kind: 'toggleErPacket',
                            code,
                            checked: next,
                        }),
                )}
                {checkboxList(
                    'ЭР',
                    ers,
                    code =>
                        value.ers.includes(code) ||
                        value.ersInPacket.includes(code),
                    (code, next) =>
                        applyComposition({ kind: 'toggleEr', code, checked: next }),
                )}
                {checkboxList(
                    'Legal Tech',
                    catalog.services.lt,
                    code =>
                        value.lt.includes(code) ||
                        value.ltInPacket.includes(code),
                    (code, next) =>
                        applyComposition({ kind: 'toggleLt', code, checked: next }),
                )}
                <div>
                    <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Консалтинг / СТАР
                    </div>
                    <select
                        className="mb-2 w-full rounded border bg-background px-2 py-1 text-sm"
                        value={value.consalting ?? ''}
                        onChange={event =>
                            applyComposition({
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
                            checked={value.star}
                            onChange={event =>
                                applyComposition({
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
                        value={value.academy ?? ''}
                        onChange={event =>
                            applyComposition({
                                kind: 'setAcademy',
                                code: event.target.value || null,
                            })
                        }
                    >
                        <option value="">Без академии</option>
                        {catalog.academy.map(pkg => (
                            <option key={pkg.code} value={pkg.code}>
                                {pkg.totalHours} ч /{' '}
                                {pkg.monthQuantity ?? 'до конца'} мес —{' '}
                                {pkg.price.toLocaleString('ru-RU')} ₽
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
