'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ArrowDown, ArrowUp, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import {
    QUESTIONNAIRE_EDITOR_TEXT,
    QUESTIONNAIRE_ITEM_FLAG_TEXT,
} from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../../../model';
import {
    QUESTIONNAIRE_CODE,
    QUESTIONNAIRE_FIELD_BOUND_CHANNELS,
    pickQuestionnaireCode,
    questionnaireCodeOptions,
} from '../../../model';
import {
    getItemControlOptions,
    getRequireChangeLock,
    getStaleAfterDaysLock,
} from '../../../lib/item-editor-view';
import type { QuestionnaireDraftIssue } from '../../../lib/validate-questionnaire-draft';
import { QuestionnaireItemFieldRow } from './QuestionnaireItemFieldRow';
import { QuestionnaireItemLiveField } from './QuestionnaireItemLiveField';
import { QuestionnaireItemOptions } from './QuestionnaireItemOptions';
import { QuestionnaireItemSmartTarget } from './QuestionnaireItemSmartTarget';
import { QuestionnaireItemTargetEntity } from './QuestionnaireItemTargetEntity';

interface QuestionnaireItemCardProps {
    item: PortalQuestionnaireItemSave;
    schema: PortalQuestionnaireSchema | undefined;
    /** Нарушения правил бэка, относящиеся к этому вопросу. */
    issues: QuestionnaireDraftIssue[];
    /**
     * Вопрос уже лежит в базе: физически убрать его нельзя — код вопроса
     * это ключ уже собранных ответов.
     */
    isSaved: boolean;
    isFirst: boolean;
    isLast: boolean;
    /** Ручка перетаскивания: только за неё карточку и тащат. */
    dragHandleProps?: {
        onMouseDown: () => void;
        onMouseUp: () => void;
    };
    onPatch: (patch: Partial<PortalQuestionnaireItemSave>) => void;
    onPickField: () => void;
    /** Перечитать привязанное поле из Битрикса. */
    onSyncField?: () => void;
    isSyncingField?: boolean;
    onMove: (offset: number) => void;
    onDrop: () => void;
}

/**
 * Карточка одного вопроса.
 *
 * Всё, что бэк отвергнет, здесь либо отфильтровано, либо заперто с
 * объяснением: список типов отображения оставляет только исполнимые для
 * выбранного поля, «требовать новое значение» доступно лишь ответу в поле
 * CRM, «срок годности» — только датам. Владелец не должен узнавать правила
 * из ошибки сохранения.
 */
export const QuestionnaireItemCard = ({
    item,
    schema,
    issues,
    isSaved,
    isFirst,
    isLast,
    dragHandleProps,
    onPatch,
    onPickField,
    onSyncField,
    isSyncingField = false,
    onMove,
    onDrop,
}: QuestionnaireItemCardProps) => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    const targetMode = item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto;
    const isActive = item.isActive !== false;
    const isSmart = channel === QUESTIONNAIRE_CODE.channel.smart;
    const isFieldBound = QUESTIONNAIRE_FIELD_BOUND_CHANNELS.includes(channel);

    const controls = getItemControlOptions(item, schema);
    // Подписи и порядок — из реестра, коды сужены до контракта: значение,
    // которого тело сохранения не принимает, предлагать нечестно.
    const channels = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.channel,
        schema?.channels,
    );
    const targetModes = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.targetMode,
        schema?.targetModes,
    );
    const requireChangeLock = getRequireChangeLock(item);
    const staleLock = getStaleAfterDaysLock(item);

    return (
        <div
            className={cn(
                'space-y-4 rounded-lg border bg-card p-4',
                !isActive && 'opacity-60',
            )}
        >
            <div className="flex items-start gap-2">
                <span
                    {...dragHandleProps}
                    aria-hidden
                    className="mt-1 shrink-0 cursor-grab text-muted-foreground"
                >
                    <GripVertical className="h-4 w-4" />
                </span>

                <div className="flex flex-1 flex-wrap items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.code}
                    </code>
                    {!isActive && (
                        <Badge
                            variant="outline"
                            title={QUESTIONNAIRE_EDITOR_TEXT.itemDisabledHint}
                        >
                            {QUESTIONNAIRE_EDITOR_TEXT.itemDisabled}
                        </Badge>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    aria-label={QUESTIONNAIRE_EDITOR_TEXT.itemMoveUp}
                    onClick={() => onMove(-1)}
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLast}
                    aria-label={QUESTIONNAIRE_EDITOR_TEXT.itemMoveDown}
                    onClick={() => onMove(1)}
                >
                    <ArrowDown className="h-4 w-4" />
                </Button>

                {/* Сохранённый вопрос гасим, а не удаляем: иначе ответы,
                    уже записанные в CRM, останутся без вопроса. */}
                {isSaved ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        title={QUESTIONNAIRE_EDITOR_TEXT.itemDisabledHint}
                        onClick={() => onPatch({ isActive: !isActive })}
                    >
                        <EyeOff className="h-4 w-4" />
                        {isActive
                            ? QUESTIONNAIRE_EDITOR_TEXT.itemDisable
                            : QUESTIONNAIRE_EDITOR_TEXT.itemEnable}
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={QUESTIONNAIRE_EDITOR_TEXT.itemDrop}
                        onClick={onDrop}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemTitleLabel}</Label>
                    <Input
                        value={item.title}
                        onChange={event =>
                            onPatch({ title: event.target.value })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemGroupLabel}</Label>
                    <Input
                        value={item.groupTitle ?? ''}
                        placeholder={
                            QUESTIONNAIRE_EDITOR_TEXT.itemGroupPlaceholder
                        }
                        onChange={event =>
                            onPatch({
                                groupTitle: event.target.value || null,
                            })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>
                        {QUESTIONNAIRE_EDITOR_TEXT.itemPlaceholderLabel}
                    </Label>
                    <Input
                        value={item.placeholder ?? ''}
                        onChange={event =>
                            onPatch({
                                placeholder: event.target.value || null,
                            })
                        }
                    />
                </div>
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemHintLabel}</Label>
                    <Input
                        value={item.hint ?? ''}
                        onChange={event =>
                            onPatch({
                                hint: event.target.value || null,
                            })
                        }
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemControlLabel}</Label>
                    <Select
                        value={item.control}
                        disabled={controls.length === 0}
                        onValueChange={value => {
                            const next = controls.find(
                                control => control.code === value,
                            );
                            if (next) onPatch({ control: next.code });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {controls.map(control => (
                                <SelectItem
                                    key={control.code}
                                    value={control.code}
                                >
                                    {control.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Пустой список означает, что поле такого типа анкета
                        заполнить не умеет — выбирать нечего. */}
                    {controls.length === 0 && (
                        <p className="text-xs text-destructive">
                            {QUESTIONNAIRE_EDITOR_TEXT.itemControlLocked}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemChannelLabel}</Label>
                    <Select
                        value={channel}
                        onValueChange={value => {
                            const next = pickQuestionnaireCode(
                                QUESTIONNAIRE_CODE.channel,
                                value,
                            );
                            if (next) onPatch({ channel: next });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {channels.map(option => (
                                <SelectItem
                                    key={option.code}
                                    value={option.code}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Носитель ответа есть только у записи в CRM: ответ в
                    отчёт адресует путь, а ответ в комментарий события
                    никуда, кроме события, не идёт. */}
                {channel === QUESTIONNAIRE_CODE.channel.dto ? (
                    <div className="space-y-1">
                        <Label>
                            {QUESTIONNAIRE_EDITOR_TEXT.itemDtoPathLabel}
                        </Label>
                        <Select
                            value={item.dtoPath ?? ''}
                            onValueChange={value => {
                                const descriptor = schema?.dtoPaths.find(
                                    path => path.path === value,
                                );
                                // Путь в отчёте заполняется ровно одним
                                // типом отображения — ставим его сразу.
                                onPatch({
                                    dtoPath: value,
                                    control:
                                        descriptor?.control ?? item.control,
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        QUESTIONNAIRE_EDITOR_TEXT.itemDtoPathLabel
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {(schema?.dtoPaths ?? []).map(path => (
                                    <SelectItem
                                        key={path.path}
                                        value={path.path}
                                    >
                                        {path.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : channel === QUESTIONNAIRE_CODE.channel.crm ? (
                    <div className="space-y-1">
                        <Label>
                            {QUESTIONNAIRE_EDITOR_TEXT.itemTargetModeLabel}
                        </Label>
                        <Select
                            value={targetMode}
                            onValueChange={value => {
                                const next = pickQuestionnaireCode(
                                    QUESTIONNAIRE_CODE.targetMode,
                                    value,
                                );
                                if (!next) return;
                                onPatch({
                                    targetMode: next,
                                    targetEntity:
                                        next ===
                                        QUESTIONNAIRE_CODE.targetMode.entity
                                            ? item.targetEntity
                                            : null,
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {targetModes.map(option => (
                                    <SelectItem
                                        key={option.code}
                                        value={option.code}
                                    >
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : null}
            </div>

            {/* Привязка к полю есть у двух каналов: «Поле CRM» и «Поле
                элемента смарта». Отличаются они носителем: у смарта он
                самоописывающий — элемент заводит поток события, и выбирать
                там нечего. */}
            {isFieldBound && (
                <>
                    <div className="grid gap-3 md:grid-cols-2">
                        <QuestionnaireItemFieldRow
                            item={item}
                            schema={schema}
                            onPick={onPickField}
                            onSync={onSyncField}
                            isSyncing={isSyncingField}
                        />

                        {isSmart ? (
                            <QuestionnaireItemSmartTarget schema={schema} />
                        ) : (
                            <QuestionnaireItemTargetEntity
                                item={item}
                                schema={schema}
                                onPatch={onPatch}
                            />
                        )}
                    </div>

                    {/* Правда портала: как поле выглядит в Битриксе прямо
                        сейчас. Владелец обязан видеть её рядом со своим
                        текстом, не открывая портал. */}
                    <QuestionnaireItemLiveField item={item} onPatch={onPatch} />
                </>
            )}

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                    <label className="flex items-start gap-2 text-sm">
                        <Checkbox
                            checked={item.isRequired ?? false}
                            onCheckedChange={checked =>
                                onPatch({ isRequired: checked === true })
                            }
                        />
                        <span>{QUESTIONNAIRE_ITEM_FLAG_TEXT.isRequired}</span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.itemRequiredHint}
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="flex items-start gap-2 text-sm">
                        <Checkbox
                            checked={item.requireChange ?? false}
                            disabled={!!requireChangeLock}
                            onCheckedChange={checked =>
                                onPatch({ requireChange: checked === true })
                            }
                        />
                        <span>
                            {QUESTIONNAIRE_ITEM_FLAG_TEXT.requireChange}
                        </span>
                    </label>
                    {/* Заперт — объясняем почему, иначе — что флаг делает. */}
                    <p className="text-xs text-muted-foreground">
                        {requireChangeLock ??
                            QUESTIONNAIRE_EDITOR_TEXT.itemRequireChangeHint}
                    </p>
                </div>

                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_ITEM_FLAG_TEXT.staleAfterDays}</Label>
                    <Input
                        inputMode="numeric"
                        disabled={!!staleLock}
                        value={
                            item.staleAfterDays === null ||
                            item.staleAfterDays === undefined
                                ? ''
                                : String(item.staleAfterDays)
                        }
                        onChange={event => {
                            const raw = event.target.value.trim();
                            onPatch({
                                staleAfterDays: raw ? Number(raw) : null,
                            });
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        {staleLock ??
                            QUESTIONNAIRE_EDITOR_TEXT.itemStaleAfterDaysHint}
                    </p>
                </div>
            </div>

            {item.control === QUESTIONNAIRE_CODE.control.enumeration && (
                <QuestionnaireItemOptions
                    options={item.options ?? []}
                    channel={channel}
                    onChange={options => onPatch({ options })}
                />
            )}

            {issues.length > 0 && (
                <ul className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                    {issues.map((issue, position) => (
                        <li
                            key={`${issue.itemCode ?? issue.scope}-${position}`}
                            className="text-xs text-destructive"
                        >
                            {issue.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
