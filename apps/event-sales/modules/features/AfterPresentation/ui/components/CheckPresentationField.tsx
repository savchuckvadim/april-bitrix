'use client';

import { FC } from 'react';
import { MicroSegmented, type MicroSegmentedOption } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ChoiceChips } from '@/modules/shared/ui/ChoiceChips';
import { toDateInputValue } from '@/modules/shared/lib/crm-date';
import { getDisplayTitle } from '../../lib/check-presentation.groups';
import {
    EMPTY_SURVEY_BLOCK,
    type SurveyBlockDraft,
} from '../../lib/check-presentation.blocks';
import {
    CheckPresentationFieldType,
    CheckPresentationItem,
    CheckPresentationValue,
} from '../../type/check-presentation-type';
import { SurveyBlockField } from './SurveyBlockField';

const BOOLEAN_OPTIONS: MicroSegmentedOption[] = [
    { value: 'yes', label: 'Да' },
    { value: 'no', label: 'Нет' },
];

/**
 * Ответ → сегмент. Всё, кроме честных `true`/`false` (в том числе ещё не
 * тронутый вопрос), — «не выбрано»: ни один сегмент не подсвечен.
 */
const BOOLEAN_ANSWER: Record<string, string | undefined> = {
    true: 'yes',
    false: 'no',
};

/** Обработчики блока с подвопросами; нужны только позициям с `questions`. */
export interface SurveyBlockHandlers {
    blocks: Record<string, SurveyBlockDraft>;
    onBlockText: (id: string, text: string) => void;
    onBlockSub: (id: string, index: number, text: string) => void;
    onBlockExpanded: (id: string, expanded: boolean) => void;
}

interface CheckPresentationFieldProps extends SurveyBlockHandlers {
    item: CheckPresentationItem;
    value: CheckPresentationValue | undefined;
    isMissing: boolean;
    onChange: (value: CheckPresentationValue) => void;
}

const toggleCode = (selected: string[], code: string): string[] =>
    selected.includes(code)
        ? selected.filter(item => item !== code)
        : [...selected, code];

/** Одно поле опросника: рендер по типу (string/boolean/date/enumeration). */
export const CheckPresentationField: FC<CheckPresentationFieldProps> = ({
    item,
    value,
    isMissing,
    onChange,
    blocks,
    onBlockText,
    onBlockSub,
    onBlockExpanded,
}) => {
    // Блок с подвопросами — свой виджет: заголовок с тултипом, разворот.
    if (item.type === CheckPresentationFieldType.STRING && item.questions) {
        return (
            <SurveyBlockField
                item={item}
                block={blocks[item.id] ?? EMPTY_SURVEY_BLOCK}
                isMissing={isMissing}
                onText={text => onBlockText(item.id, text)}
                onSub={(index, text) => onBlockSub(item.id, index, text)}
                onExpanded={expanded => onBlockExpanded(item.id, expanded)}
            />
        );
    }

    // Множественный справочник без вариантов на портале не рисуется вовсе:
    // выбирать не из чего, а пустая подпись читалась бы как сломанное поле.
    if (
        item.type === CheckPresentationFieldType.ENUMERATION &&
        item.isMultiple &&
        !item.options?.length
    ) {
        return null;
    }

    return (
        <div className="space-y-1.5">
            <Label className={isMissing ? 'text-destructive' : undefined}>
                {getDisplayTitle(item)}
                {item.required && ' *'}
            </Label>

            {item.type === CheckPresentationFieldType.STRING && (
                <Textarea
                    rows={2}
                    value={typeof value === 'string' ? value : ''}
                    placeholder={item.placeholder}
                    aria-invalid={isMissing}
                    onChange={e => onChange(e.target.value)}
                />
            )}

            {item.type === CheckPresentationFieldType.BOOLEAN && (
                /*
                 * Три состояния, а не тумблер. Тумблер по умолчанию стоял в
                 * «Нет» и выглядел ответом: экран показывал заполненность
                 * там, где менеджер ничего не выбирал, а «Нет» уезжало в
                 * поле клиента как осознанный ответ. Ничего не выбрано —
                 * не подсвечен ни один сегмент, и обязательный вопрос
                 * блокирует сохранение.
                 */
                <div className="flex items-center gap-2">
                    <MicroSegmented
                        ariaLabel={item.title}
                        value={BOOLEAN_ANSWER[String(value)]}
                        options={BOOLEAN_OPTIONS}
                        onChange={next => onChange(next === 'yes')}
                    />
                    {BOOLEAN_ANSWER[String(value)] === undefined && (
                        <span
                            className={
                                isMissing
                                    ? 'text-xs font-medium text-destructive'
                                    : 'text-xs text-muted-foreground'
                            }
                        >
                            не выбрано
                        </span>
                    )}
                </div>
            )}

            {item.type === CheckPresentationFieldType.DATE && (
                <Input
                    type="date"
                    // Ответ мог приехать из портала в его формате (ручная
                    // правка того же поля мимо опросника) — контрол принимает
                    // только `YYYY-MM-DD`.
                    value={toDateInputValue(value)}
                    aria-invalid={isMissing}
                    onChange={e => onChange(e.target.value)}
                />
            )}

            {item.type === CheckPresentationFieldType.ENUMERATION &&
                item.isMultiple && (
                    <ChoiceChips
                        ariaLabel={item.title}
                        invalid={isMissing}
                        options={(item.options ?? []).map(option => ({
                            code: option.code,
                            name: option.title,
                        }))}
                        selected={Array.isArray(value) ? value : []}
                        onToggle={code =>
                            onChange(
                                toggleCode(
                                    Array.isArray(value) ? value : [],
                                    code,
                                ),
                            )
                        }
                    />
                )}

            {item.type === CheckPresentationFieldType.ENUMERATION &&
                !item.isMultiple && (
                    <Select
                        value={typeof value === 'string' ? value : undefined}
                        onValueChange={onChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={item.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {(item.options ?? []).map(option => (
                                <SelectItem
                                    key={option.code}
                                    value={option.code}
                                >
                                    {option.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
        </div>
    );
};
