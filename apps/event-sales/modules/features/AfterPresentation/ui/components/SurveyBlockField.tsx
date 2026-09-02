'use client';

import { FC } from 'react';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { HintTooltip, IconAction } from '@workspace/april-ui';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import {
    countAnsweredSub,
    type SurveyBlockDraft,
} from '../../lib/check-presentation.blocks';
import type { CheckPresentationItem } from '../../type/check-presentation-type';

interface SurveyBlockFieldProps {
    item: CheckPresentationItem;
    block: SurveyBlockDraft;
    isMissing: boolean;
    onText: (text: string) => void;
    onSub: (index: number, text: string) => void;
    onExpanded: (expanded: boolean) => void;
}

/**
 * Высота свёрнутого поля в строках: по числу подвопросов, чтобы
 * плейсхолдер-список был виден целиком; потолок шесть — колонка из пяти
 * блоков не должна превращаться в простыню.
 */
const collapsedRows = (questions: readonly string[]): number =>
    Math.min(Math.max(questions.length, 2) + 1, 6);

/**
 * Блок опросника «5К»/«Хвост»: Вопрос с подвопросами (02.09.2026).
 *
 * Подвопросы видны ТРЕМЯ способами: тултипом на заголовке (доступен
 * всегда, даже посреди набора), плейсхолдером пустого поля и — по кнопке
 * «Развернуть подробно» — отдельными полями. Обязателен родитель: текст в
 * строке Вопроса или ответ хоть на один подвопрос (см. `isSurveyBlockAnswered`).
 *
 * Свёрнутый вид показывает собственный текст блока, а не собранное
 * значение поля: подответы остаются в значении и видны бейджем «ответов: N».
 */
export const SurveyBlockField: FC<SurveyBlockFieldProps> = ({
    item,
    block,
    isMissing,
    onText,
    onSub,
    onExpanded,
}) => {
    const questions = item.questions ?? [];
    const answered = countAnsweredSub(block);
    const numbered = questions.map(
        (question, index) => `${index + 1}. ${question}`,
    );

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <HintTooltip title="Подвопросы" lines={numbered} side="right">
                    <Label
                        className={cn(
                            'cursor-help',
                            isMissing && 'text-destructive',
                        )}
                    >
                        {item.title}
                        {item.required && ' *'}
                    </Label>
                </HintTooltip>

                <div className="flex items-center gap-1">
                    {!block.expanded && answered > 0 && (
                        <span className="text-xs text-muted-foreground">
                            ответов: {answered}
                        </span>
                    )}
                    <IconAction
                        icon={block.expanded ? ChevronsDownUp : ChevronsUpDown}
                        label={
                            block.expanded ? 'Свернуть' : 'Развернуть подробно'
                        }
                        hint="Каждый подвопрос — отдельным полем"
                        pressed={block.expanded}
                        onClick={() => onExpanded(!block.expanded)}
                    />
                </div>
            </div>

            {block.expanded ? (
                <div
                    className={cn(
                        'space-y-2 rounded-md border p-2',
                        isMissing ? 'border-destructive/50' : 'border-border/60',
                    )}
                >
                    <Textarea
                        rows={2}
                        value={block.text}
                        placeholder="Общий ответ (необязательно)"
                        aria-label={`${item.title}: общий ответ`}
                        onChange={e => onText(e.target.value)}
                    />
                    {questions.map((question, index) => (
                        <div key={question} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                                {index + 1}. {question}
                            </Label>
                            <Textarea
                                rows={2}
                                value={block.sub[index] ?? ''}
                                aria-label={question}
                                onChange={e => onSub(index, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Textarea
                    rows={collapsedRows(questions)}
                    value={block.text}
                    placeholder={item.placeholder}
                    aria-invalid={isMissing}
                    onChange={e => onText(e.target.value)}
                />
            )}
        </div>
    );
};
