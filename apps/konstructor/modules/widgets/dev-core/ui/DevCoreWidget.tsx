'use client';

import {
    getComplectAttr,
    getComplectStyleOverride,
    selectCatalog,
} from '@/modules/entities/catalog';
import { findMainRow } from '@/modules/entities/row-set';
import { useAppSelector } from '@/modules/app';
import { useDevCore } from '../hooks/use-dev-core';
import { DevControls } from './components/DevControls';
import { RowBuilder } from './components/RowBuilder';
import { CompositionEditor } from './components/CompositionEditor';
import { SetView } from './components/SetView';

/**
 * Dev-витрина ядра конструктора (не продакшн-UI): сборка строк,
 * наполнение любой строки, сравнение, восстановление легаси-слепка.
 * data-complect главного комплекта стоит на корне — цвет комплекта
 * наследуется всеми элементами (кнопки, ринги, бейджи).
 */
export const DevCoreWidget = () => {
    const dev = useDevCore();
    const catalog = useAppSelector(selectCatalog);

    const mainRow = findMainRow(dev.general);
    const mainComplect = mainRow?.refs.complectCode
        ? (catalog.complects.byCode[mainRow.refs.complectCode] ?? null)
        : null;

    return (
        <div
            data-complect={getComplectAttr(mainRow?.refs.complectCode)}
            style={getComplectStyleOverride(mainComplect)}
            className="mx-auto flex max-w-6xl flex-col gap-3 p-4"
        >
            <h1 className="text-lg font-semibold">
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-complect-current" />
                Ядро конструктора — dev
            </h1>

            <DevControls
                context={dev.context}
                controls={dev.controls}
                snapshot={dev.snapshot}
            />
            <RowBuilder builder={dev.builder} />

            <div className="grid gap-3 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                    <SetView
                        title="General (продаём)"
                        set={dev.general}
                        selectedKey={dev.selectedRow?.key ?? null}
                        onSelect={dev.selectRowKey}
                    />
                    {dev.alternative.map((set, index) => (
                        <SetView
                            key={set.id}
                            title={`Сравнение ${index + 1}`}
                            set={set}
                            selectedKey={dev.selectedRow?.key ?? null}
                            onSelect={dev.selectRowKey}
                        />
                    ))}
                </div>
                <CompositionEditor
                    row={dev.selectedRow}
                    composition={dev.composition}
                />
            </div>
        </div>
    );
};
