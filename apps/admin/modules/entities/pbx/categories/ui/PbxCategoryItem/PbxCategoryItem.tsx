'use client';

import * as React from 'react';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { PresenceBadge } from '../../../lib/ui';
import { futureApiMessage, type SingleStoreTarget } from '../../../lib/future-api';
import type {
    PbxCategoryCompareRow,
    PbxStageCompareRow,
} from '../../../lib/model/common';

interface PbxCategoryItemProps {
    row: PbxCategoryCompareRow;
    selected: boolean;
    /** Whether category-level delete is supported by the entity. */
    canDeleteCategory: boolean;
    onToggleSelect: () => void;
    onDeleteCategory: () => void;
    onDeleteStage: (stage: PbxStageCompareRow) => void;
    onEditStage: (stage: PbxStageCompareRow, newValue: string) => Promise<void>;
    isStagePending?: boolean;
}

export function PbxCategoryItem({
    row,
    selected,
    canDeleteCategory,
    onToggleSelect,
    onDeleteCategory,
    onDeleteStage,
    onEditStage,
    isStagePending,
}: PbxCategoryItemProps) {
    const [editingCode, setEditingCode] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState('');
    const [notice, setNotice] = React.useState<string | null>(null);
    const stub = (target: SingleStoreTarget) =>
        setNotice(futureApiMessage('Изменить стадию', target));

    const startEdit = (stage: PbxStageCompareRow) => {
        setEditingCode(stage.code);
        setDraft(stage.name);
    };
    const submitEdit = async (stage: PbxStageCompareRow) => {
        await onEditStage(stage, draft);
        setEditingCode(null);
        setDraft('');
    };

    return (
        <AccordionItem value={row.code} className="rounded-md border px-3">
            <div className="flex items-center gap-3 py-1">
                <Checkbox
                    checked={selected}
                    disabled={!row.inTemplate}
                    onCheckedChange={onToggleSelect}
                    aria-label={`Выбрать ${row.code}`}
                />
                <AccordionTrigger className="flex-1">
                    <div className="flex w-full items-center gap-3 pr-3">
                        <span className="font-mono text-xs text-muted-foreground">
                            {row.code}
                        </span>
                        <span className="flex-1 text-left">{row.name}</span>
                        <span className="flex items-center gap-1 text-xs">
                            Ш <PresenceBadge present={row.inTemplate} />
                            BX <PresenceBadge present={row.inBitrix} />
                            БД <PresenceBadge present={row.inDb} />
                        </span>
                    </div>
                </AccordionTrigger>
                {canDeleteCategory && (row.inBitrix || row.inDb) && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDeleteCategory}
                    >
                        Удалить
                    </Button>
                )}
            </div>
            <AccordionContent>
                {row.stages.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">Нет стадий</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-40">Code</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead className="w-20 text-center">Ш</TableHead>
                                <TableHead className="w-20 text-center">BX</TableHead>
                                <TableHead className="w-20 text-center">БД</TableHead>
                                <TableHead className="w-48">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {row.stages.map((stage) => {
                                const isEditing = editingCode === stage.code;
                                // PortalDB mirror color (installed) wins; fall back
                                // to the template color so unsynced template stages
                                // still preview their intended Bitrix color.
                                const stageColor =
                                    stage.installed?.color || stage.template?.color;
                                return (
                                    <TableRow key={stage.code}>
                                        <TableCell className="font-mono text-xs">
                                            {stage.code}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    value={draft}
                                                    onChange={(e) =>
                                                        setDraft(e.target.value)
                                                    }
                                                />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <StageColorSwatch
                                                        color={stageColor}
                                                        fromMirror={Boolean(
                                                            stage.installed?.color,
                                                        )}
                                                    />
                                                    {stage.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <PresenceBadge present={stage.inTemplate} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <PresenceBadge present={stage.inBitrix} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <PresenceBadge present={stage.inDb} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                submitEdit(stage)
                                                            }
                                                            disabled={isStagePending}
                                                        >
                                                            Сохранить
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setEditingCode(null)
                                                            }
                                                        >
                                                            Отмена
                                                        </Button>
                                                    </>
                                                ) : (
                                                    (stage.inBitrix || stage.inDb) && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    startEdit(stage)
                                                                }
                                                            >
                                                                Изменить
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => stub('bitrix')}
                                                            >
                                                                BX
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => stub('portal')}
                                                            >
                                                                Portal
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    onDeleteStage(stage)
                                                                }
                                                            >
                                                                Удалить
                                                            </Button>
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
                {notice && (
                    <p className="pt-2 text-xs text-amber-600">{notice}</p>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

/**
 * Small swatch rendering the stage's Bitrix color. `fromMirror` distinguishes a
 * real PortalDB-installed color (solid border) from a template-only preview
 * (dashed border). Renders a neutral placeholder when no color is known.
 */
function StageColorSwatch({
    color,
    fromMirror,
}: {
    color?: string;
    fromMirror: boolean;
}) {
    if (!color) {
        return (
            <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm border border-dashed border-muted-foreground/40"
                title="Цвет стадии не задан"
                aria-hidden
            />
        );
    }
    return (
        <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm border"
            style={{
                backgroundColor: color,
                borderStyle: fromMirror ? 'solid' : 'dashed',
            }}
            title={`Цвет стадии ${color}${
                fromMirror ? ' (PortalDB)' : ' (шаблон)'
            }`}
        />
    );
}
