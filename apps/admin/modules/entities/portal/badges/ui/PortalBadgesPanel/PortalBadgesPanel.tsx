'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { ConfirmDialog } from '@/modules/shared/ui';
import { BADGES_TEXT as TEXT } from '../../consts/badges.const';
import { useBadgeSchema } from '../../lib/hooks/use-badges';
import { useBadgesEditor } from '../../lib/hooks/use-badges-editor';
import type { BadgeMode } from '../../model';
import { BadgeGroupTable } from './components/BadgeGroupTable';

interface PortalBadgesPanelProps {
    portalId: number;
}

/**
 * Раздел «Бейджики» карточки портала.
 *
 * Сверху — какой набор действует: общий из кода или свой. В режиме «общие»
 * набор показан только для чтения (править его здесь нельзя — он один на
 * все порталы). В режиме «свои» — редактор: текст, цвет, привязки к итогам
 * работы и типам события, порядок, выключение. Сохраняется целиком, одной
 * кнопкой; что бэк не примет — показано до нажатия.
 */
export const PortalBadgesPanel = ({ portalId }: PortalBadgesPanelProps) => {
    const schema = useBadgeSchema(portalId);
    const editor = useBadgesEditor(portalId);
    const [confirmCopy, setConfirmCopy] = useState(false);

    if (editor.isLoading || schema.isLoading) {
        return <p className="text-sm text-muted-foreground">{TEXT.loading}</p>;
    }
    if (editor.isError || !editor.base) {
        return <p className="text-sm text-destructive">{TEXT.loadError}</p>;
    }
    if (schema.isError || !schema.data) {
        return <p className="text-sm text-destructive">{TEXT.schemaLoadError}</p>;
    }

    const isOwn = editor.mode === 'own';
    const shown = isOwn ? editor.items : editor.base.defaults;

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold">{TEXT.title}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">{TEXT.subtitle}</p>
                <p className="text-xs text-muted-foreground">
                    {TEXT.version(editor.base.version, editor.base.updatedAt)}
                </p>
            </header>

            <section className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">{TEXT.modeTitle}</h3>
                <div role="radiogroup" className="flex flex-wrap gap-2">
                    {schema.data.modes.map(option => {
                        const active = editor.mode === option.code;
                        return (
                            <button
                                key={option.code}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => editor.setMode(option.code as BadgeMode)}
                                className={cn(
                                    'max-w-sm rounded-lg border p-3 text-left transition-colors',
                                    active
                                        ? 'border-primary bg-primary/5'
                                        : 'border-input hover:bg-accent',
                                )}
                            >
                                <p className="text-sm font-medium">{option.name}</p>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    {isOwn
                        ? editor.items.length === 0
                            ? TEXT.modeOwnEmptyHint
                            : null
                        : TEXT.modeDefaultHint}
                </p>
            </section>

            {isOwn && (
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            editor.items.length ? setConfirmCopy(true) : editor.takeDefaults()
                        }
                    >
                        <Copy className="size-3.5" />
                        {TEXT.copyDefaults}
                    </Button>
                </div>
            )}

            <BadgeGroupTable
                target="comment"
                items={shown}
                schema={schema.data}
                readOnly={!isOwn}
                onAdd={() => editor.add('comment')}
                onChange={editor.update}
                onMove={editor.move}
                onRemove={editor.remove}
            />
            <BadgeGroupTable
                target="title"
                items={shown}
                schema={schema.data}
                readOnly={!isOwn}
                onAdd={() => editor.add('title')}
                onChange={editor.update}
                onMove={editor.move}
                onRemove={editor.remove}
            />

            {editor.issues.length > 0 && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
                    <p className="mb-1 font-medium text-destructive">{TEXT.issuesTitle}</p>
                    <ul className="list-inside list-disc text-destructive">
                        {editor.issues.map(issue => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            <footer className="flex items-center gap-2 border-t pt-4">
                <Button
                    type="button"
                    onClick={editor.save}
                    disabled={!editor.dirty || editor.issues.length > 0 || editor.isSaving}
                >
                    {editor.isSaving ? TEXT.saving : TEXT.save}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={editor.discard}
                    disabled={!editor.dirty || editor.isSaving}
                >
                    {TEXT.discard}
                </Button>
            </footer>

            <ConfirmDialog
                open={confirmCopy}
                onOpenChange={setConfirmCopy}
                title={TEXT.copyDefaultsConfirmTitle}
                description={TEXT.copyDefaultsConfirmText}
                onConfirm={() => {
                    editor.takeDefaults();
                    setConfirmCopy(false);
                }}
            />
        </div>
    );
};
