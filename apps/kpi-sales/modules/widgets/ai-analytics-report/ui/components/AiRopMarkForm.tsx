'use client';

import { useId } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import { MicroSegmented, type MicroSegmentedOption } from '@workspace/april-ui';
import type { AiRopMarkSection } from '@/modules/entities/ai-analytics';
import {
    AI_ROP_MARK_SCORES,
    AI_ROP_MARK_SECTIONS,
    AI_ROP_MARK_TEXT_MAX,
    type AiRopMarkFormValues,
} from '../../lib/ai-rop-mark.util';

const AGREE_OPTIONS: MicroSegmentedOption[] = [
    { value: 'yes', label: 'Согласен с AI' },
    { value: 'no', label: 'Не согласен' },
];

const agreeValue = (agree: boolean | null): string | undefined =>
    agree === null ? undefined : agree ? 'yes' : 'no';

interface AiRopMarkFormProps {
    form: AiRopMarkFormValues;
    /** Ошибка проверки формы либо текст 400/403 сервера. */
    error: string | null;
    pending: boolean;
    onAgree: (agree: boolean) => void;
    onScore: (score: number | null) => void;
    onToggleSection: (code: AiRopMarkSection) => void;
    onWhy: (value: string) => void;
    onHowTo: (value: string) => void;
    onSubmit: () => void;
    /** Есть только у повторной метки (первую отменить нельзя — форма и есть проверка). */
    onCancel?: () => void;
}

/**
 * Форма слепой метки: согласие с оценкой AI (обязательно), своя оценка
 * 1–10 (необязательно, повторный клик снимает), разделы рубрики,
 * «почему так» и «как лучше» (≤ 2000 символов). Оценка AI до сохранения
 * не показывается.
 */
export const AiRopMarkForm = ({
    form,
    error,
    pending,
    onAgree,
    onScore,
    onToggleSection,
    onWhy,
    onHowTo,
    onSubmit,
    onCancel,
}: AiRopMarkFormProps) => {
    const idPrefix = useId();

    return (
        <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">
                    Оценка AI по звонку
                </span>
                <MicroSegmented
                    ariaLabel="Согласие с оценкой AI"
                    size="sm"
                    options={AGREE_OPTIONS}
                    value={agreeValue(form.agree)}
                    onChange={value => onAgree(value === 'yes')}
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                    Ваша оценка
                </span>
                <div
                    role="radiogroup"
                    aria-label="Оценка руководителя 1–10"
                    className="flex flex-wrap gap-1"
                >
                    {AI_ROP_MARK_SCORES.map(score => {
                        const active = form.ropScore === score;
                        return (
                            <Button
                                key={score}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                variant={active ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 w-7 px-0 text-xs tabular-nums"
                                disabled={pending}
                                onClick={() => onScore(active ? null : score)}
                            >
                                {score}
                            </Button>
                        );
                    })}
                </div>
                <span className="text-[0.6875rem] text-muted-foreground">
                    необязательно
                </span>
            </div>
            <div>
                <span className="text-xs text-muted-foreground">
                    Разделы, к которым относится замечание
                </span>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {AI_ROP_MARK_SECTIONS.map(section => {
                        const id = `${idPrefix}-${section.code}`;
                        return (
                            <div
                                key={section.code}
                                className="flex items-center gap-1.5"
                            >
                                <Checkbox
                                    id={id}
                                    checked={form.sections.includes(
                                        section.code,
                                    )}
                                    disabled={pending}
                                    onCheckedChange={() =>
                                        onToggleSection(section.code)
                                    }
                                />
                                <Label
                                    htmlFor={id}
                                    className="text-xs font-normal"
                                >
                                    {section.label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
                <Textarea
                    value={form.why}
                    onChange={event => onWhy(event.target.value)}
                    maxLength={AI_ROP_MARK_TEXT_MAX}
                    placeholder="Почему так: что вы услышали в звонке"
                    className="min-h-16 text-sm"
                    disabled={pending}
                    aria-label="Почему так"
                />
                <Textarea
                    value={form.howTo}
                    onChange={event => onHowTo(event.target.value)}
                    maxLength={AI_ROP_MARK_TEXT_MAX}
                    placeholder="Как лучше: что сделать в следующий раз"
                    className="min-h-16 text-sm"
                    disabled={pending}
                    aria-label="Как лучше"
                />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                    className={cn(
                        'text-xs',
                        error ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {error ?? 'До сохранения метки оценка AI не показывается'}
                </span>
                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={pending}
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={pending}
                        onClick={onSubmit}
                    >
                        <Send className="h-3.5 w-3.5" />
                        {pending ? 'Сохраняем…' : 'Сохранить метку'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
