'use client';

import { Button } from '@workspace/ui/components/button';
import { MessageSquarePlus, Plus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../../../model';
import { useItemDrag } from '../../../lib/hooks/use-item-drag';
import {
    issuesForItem,
    withGroupDividers,
} from '../../../lib/item-editor-view';
import type { QuestionnaireDraftIssue } from '../../../lib/validate-questionnaire-draft';
import { QuestionnaireItemCard } from './QuestionnaireItemCard';

interface QuestionnaireItemsListProps {
    items: PortalQuestionnaireItemSave[];
    schema: PortalQuestionnaireSchema | undefined;
    issues: QuestionnaireDraftIssue[];
    /** Коды вопросов, которые уже лежат в базе. */
    savedCodes: string[];
    onPatchItem: (
        index: number,
        patch: Partial<PortalQuestionnaireItemSave>,
    ) => void;
    onPickField: (index: number) => void;
    /** Перечитать поле вопроса из Битрикса. */
    onSyncField: (index: number) => void;
    /** Какой вопрос сейчас читается; `null` — ни один. */
    syncingIndex: number | null;
    onReorder: (from: number, to: number) => void;
    onRemoveItem: (index: number) => void;
    onAddFields: () => void;
    onAddComment: () => void;
}

/**
 * Состав анкеты: порядок вопросов и разделители групп.
 *
 * Порядок здесь — не украшение: ровно в нём менеджер увидит вопросы, и
 * ровно он уедет в `sort`. Перетаскивание дублируется стрелками на
 * карточке, поэтому список остаётся доступным и без мыши.
 */
export const QuestionnaireItemsList = ({
    items,
    schema,
    issues,
    savedCodes,
    onPatchItem,
    onPickField,
    onSyncField,
    syncingIndex,
    onReorder,
    onRemoveItem,
    onAddFields,
    onAddComment,
}: QuestionnaireItemsListProps) => {
    const drag = useItemDrag(onReorder);
    const rows = withGroupDividers(items);

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                    <h2 className="font-semibold">
                        {QUESTIONNAIRE_EDITOR_TEXT.itemsTitle}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.itemsHint}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={onAddFields}>
                        <Plus className="h-4 w-4" />
                        {QUESTIONNAIRE_EDITOR_TEXT.addFromField}
                    </Button>
                    {/* Поля в CRM ещё нет, а спрашивать уже надо: ответ
                        уйдёт в комментарий события и не потеряется. */}
                    <Button
                        variant="outline"
                        size="sm"
                        title={QUESTIONNAIRE_EDITOR_TEXT.addCommentHint}
                        onClick={onAddComment}
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                        {QUESTIONNAIRE_EDITOR_TEXT.addComment}
                    </Button>
                </div>
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.itemsEmptyEditor}
                </p>
            ) : (
                <ul className="space-y-3">
                    {rows.map(row => (
                        <li
                            key={row.item.code}
                            draggable={drag.isDraggable(row.index)}
                            onDragStart={drag.onDragStart(row.index)}
                            onDragOver={drag.onDragOver(row.index)}
                            onDrop={drag.onDrop(row.index)}
                            onDragEnd={drag.onDragEnd}
                            className={cn(
                                'space-y-3 rounded-lg transition-opacity',
                                drag.dragIndex === row.index && 'opacity-50',
                                drag.overIndex === row.index &&
                                    drag.dragIndex !== row.index &&
                                    'ring-2 ring-primary',
                            )}
                        >
                            {/* Разделитель там, где сменилась группа: она
                                задаётся полем вопроса, отдельной сущности
                                «группа» на бэке нет. */}
                            {row.isGroupStart && (
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {row.groupTitle ??
                                            QUESTIONNAIRE_EDITOR_TEXT.groupUngrouped}
                                    </span>
                                    <span className="h-px flex-1 bg-border" />
                                </div>
                            )}

                            <QuestionnaireItemCard
                                item={row.item}
                                schema={schema}
                                issues={issuesForItem(issues, row.item.code)}
                                isSaved={savedCodes.includes(row.item.code)}
                                isFirst={row.index === 0}
                                isLast={row.index === items.length - 1}
                                // Тащить можно только за ручку: иначе поля
                                // ввода карточки потеряли бы выделение
                                // текста мышью.
                                dragHandleProps={drag.handleProps(row.index)}
                                onPatch={patch => onPatchItem(row.index, patch)}
                                onPickField={() => onPickField(row.index)}
                                onSyncField={() => onSyncField(row.index)}
                                isSyncingField={syncingIndex === row.index}
                                onMove={offset =>
                                    onReorder(row.index, row.index + offset)
                                }
                                onDrop={() => onRemoveItem(row.index)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
