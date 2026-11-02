'use client';

import { useMemo, useState } from 'react';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
// Глубокий импорт чистого util аудита: его индекс тянет панель аудита.
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit/lib/portal-options.util';
import { usePortals } from '@/modules/entities/portal';
import {
    useMethodologies,
    useMethodologyCatalog,
} from '../../lib/hooks/use-methodologies';
import type { EditorSelection } from '../../lib/methodology-form.state';
import {
    METHODOLOGIES_NO_PORTAL,
    METHODOLOGIES_TEXT,
    type MethodologyDetail,
    type MethodologyItem,
} from '../../model';
import { MethodologyEditor } from '../MethodologyEditor/MethodologyEditor';
import { MethodologyTable } from './components/MethodologyTable';

const selectionKey = (selection: EditorSelection): string =>
    selection.mode === 'new'
        ? 'new'
        : `${selection.mode}:${selection.id ?? `builtin:${selection.code}`}`;

/**
 * Раздел «AI-аналитика ОП → Методики продаж»: портал (для своих методик),
 * таблица общего слоя и портала, редактор-бриф с помощником по документу.
 */
export const MethodologiesPage = () => {
    const texts = METHODOLOGIES_TEXT;
    const portals = usePortals();
    const portalOptions = useMemo(
        () => [
            { value: METHODOLOGIES_NO_PORTAL, label: texts.allPortals },
            ...toPortalOptions(portals.data),
        ],
        [portals.data, texts.allPortals],
    );
    const [domain, setDomain] = useState<string | undefined>(undefined);
    const [selection, setSelection] = useState<EditorSelection | null>(null);
    const items = useMethodologies(domain);
    const catalog = useMethodologyCatalog();

    const open = (item: MethodologyItem, mode: 'edit' | 'copy') =>
        setSelection({ mode, id: item.id, code: item.code });
    const saved = (detail: MethodologyDetail) =>
        setSelection({ mode: 'edit', id: detail.id, code: detail.code });

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{texts.title}</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">{texts.intro}</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
                <FieldCombobox
                    id="methodologies-portal"
                    label={texts.portal}
                    options={portalOptions}
                    value={domain ?? METHODOLOGIES_NO_PORTAL}
                    onChange={value => {
                        setDomain(value === METHODOLOGIES_NO_PORTAL ? undefined : value);
                        setSelection(null);
                    }}
                    placeholder={texts.portalPlaceholder}
                    searchPlaceholder={texts.portalSearch}
                    emptyText={texts.portalEmpty}
                    hint={texts.portalHint}
                    className="w-full max-w-md"
                />
                {!selection && (
                    <Button onClick={() => setSelection({ mode: 'new' })}>
                        {texts.newMethodology}
                    </Button>
                )}
            </div>
            {items.isError && (
                <HookNotice
                    tone="error"
                    title={texts.loadError}
                    message={getApiErrorMessage(items.error)}
                />
            )}
            {catalog.isError && (
                <HookNotice
                    tone="warning"
                    title={texts.catalogError}
                    message={getApiErrorMessage(catalog.error)}
                />
            )}
            {selection ? (
                <MethodologyEditor
                    key={selectionKey(selection)}
                    selection={selection}
                    domain={domain}
                    catalog={catalog.data}
                    onClose={() => setSelection(null)}
                    onSaved={saved}
                />
            ) : (
                <MethodologyTable
                    items={items.data}
                    loading={items.isLoading}
                    onOpen={item => open(item, 'edit')}
                    onCopy={item => open(item, 'copy')}
                />
            )}
        </div>
    );
};
