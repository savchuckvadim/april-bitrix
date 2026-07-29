'use client';

import { X } from 'lucide-react';
import { useCompositionEditor } from '../hooks/use-composition-editor';
import { CompositionCheckboxList } from './CompositionCheckboxList';
import { CompositionServicesBlock } from './CompositionServicesBlock';

/**
 * Панель наполнения выбранной строки: чекбоксы = проекция composition,
 * тумблер «По правилам / Без правил», вес и нарушения правил.
 */
export const CompositionEditorPanel = () => {
    const {
        row,
        composition,
        catalog,
        groups,
        applyComposition,
        toggleMode,
        close,
        lastResult,
        weightCheck,
    } = useCompositionEditor();

    if (!row || !composition) return null;

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
                        composition.mode === 'rules'
                            ? 'bg-success text-success-foreground'
                            : 'bg-warning text-warning-foreground'
                    }`}
                >
                    {composition.mode === 'rules' ? 'По правилам' : 'Без правил'}
                </button>
                <button
                    type="button"
                    onClick={close}
                    aria-label="Закрыть наполнение"
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
                >
                    <X className="h-4 w-4" />
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
                <CompositionCheckboxList
                    title="Инфоблоки"
                    items={groups.infoblocks}
                    isChecked={code => composition.infoblocks.includes(code)}
                    onToggle={(code, next) =>
                        applyComposition({
                            kind: 'toggleInfoblock',
                            code,
                            checked: next,
                        })
                    }
                />
                <CompositionCheckboxList
                    title="Пакеты ЭР"
                    items={groups.erPackets}
                    isChecked={code => composition.erPackets.includes(code)}
                    onToggle={(code, next) =>
                        applyComposition({
                            kind: 'toggleErPacket',
                            code,
                            checked: next,
                        })
                    }
                />
                <CompositionCheckboxList
                    title="ЭР"
                    items={groups.ers}
                    isChecked={code =>
                        composition.ers.includes(code) ||
                        composition.ersInPacket.includes(code)
                    }
                    onToggle={(code, next) =>
                        applyComposition({ kind: 'toggleEr', code, checked: next })
                    }
                />
                <CompositionCheckboxList
                    title="Legal Tech"
                    items={catalog.services.lt}
                    isChecked={code =>
                        composition.lt.includes(code) ||
                        composition.ltInPacket.includes(code)
                    }
                    onToggle={(code, next) =>
                        applyComposition({ kind: 'toggleLt', code, checked: next })
                    }
                />
                <CompositionServicesBlock
                    composition={composition}
                    catalog={catalog}
                    onApply={applyComposition}
                />
            </div>
        </div>
    );
};
