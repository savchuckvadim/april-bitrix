'use client';

import { FC } from 'react';
import { MicroSelect } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ChoiceChips } from '@/modules/shared/ui/ChoiceChips';
import { toggleObjection } from '@/modules/entities/EventReport/lib/objection';
import { CHECKLIST_BOOLEAN_OPTIONS } from '../../lib/checklist-boolean';
import {
    hasChecklistChoice,
    joinMultiValue,
    splitMultiValue,
} from '../../lib/checklist-values';
import type { ChecklistFieldView } from '../../lib/checklist-field-view';

/** Переключение пункта множественного справочника; у возражений — с
 * исключающим «Нет возражений» (правило живёт в сущности отчёта). */
const toggleMulti = (
    fieldCode: string | null,
    selected: string[],
    code: string,
): string[] => {
    if (fieldCode === 'op_objection_reason') {
        return toggleObjection(selected, code);
    }
    return selected.includes(code)
        ? selected.filter(item => item !== code)
        : [...selected, code];
};

const NUMERIC_CLASS = 'h-6 w-34 px-2 py-0 text-[0.6875rem]';

/**
 * Контрол вопроса анкеты по его типу.
 *
 * `datetime` — именно `datetime-local`: поле портала хранит дату СО ВРЕМЕНЕМ
 * («Дата последнего счёта», «Направлено КП»), а контрол `type=date` молча
 * терял время и обнулял его обратной записью.
 *
 * `boolean` — селект ТРЕМЯ состояниями («—», «Да», «Нет»), а не галка:
 * выключенная галка неотличима от «менеджер не отвечал», и дефолтное «Нет»
 * закрывало бы обязательный вопрос само.
 *
 * Варианты справочника берутся из резолва (`field.options`): у портальной
 * анкеты это `options` каталога с `bitrixId`, у встроенного вопроса — items
 * поля из слепка. Значение контрола — КОД варианта, в портал уезжает
 * `bitrixId` (см. toPortalFieldValue). Вариант может объявить и сам вопрос
 * (`string` со своим списком) — тогда в поле уходит текст варианта.
 */
export const ChecklistFieldControl: FC<{ field: ChecklistFieldView }> = ({
    field,
}) => {
    const { def } = field;

    // Множественный справочник (возражения): чипы вместо селекта — все
    // варианты видны сразу, выбранных может быть несколько, «Нет
    // возражений» снимает остальные.
    if (
        def.control === 'enumeration' &&
        def.isMultiple &&
        field.options.length > 0
    ) {
        const selected = splitMultiValue(field.value);
        return (
            <ChoiceChips
                ariaLabel={def.title}
                invalid={field.isMissing}
                options={field.options.map(option => ({
                    code: option.code,
                    name: option.title,
                }))}
                selected={selected}
                onToggle={code =>
                    field.setValue(
                        joinMultiValue(
                            toggleMulti(
                                def.legacyFieldCode ?? def.code,
                                selected,
                                code,
                            ),
                        ),
                    )
                }
            />
        );
    }

    if (def.control === 'enumeration' && field.options.length > 0) {
        return (
            <MicroSelect
                ariaLabel={def.title}
                value={field.value || undefined}
                placeholder="Выбрать"
                invalid={field.isMissing}
                options={field.options.map(option => ({
                    value: option.code,
                    label: option.title,
                }))}
                onChange={field.setValue}
            />
        );
    }

    if (def.control === 'boolean') {
        return (
            <MicroSelect
                ariaLabel={def.title}
                // Пустое значение — плейсхолдер «—»: «не выбрано» видно
                // глазом и ответом не считается.
                value={field.value || undefined}
                placeholder="—"
                invalid={field.isMissing}
                options={CHECKLIST_BOOLEAN_OPTIONS.map(option => ({
                    value: option.code,
                    label: option.title,
                }))}
                onChange={field.setValue}
            />
        );
    }

    if (def.control === 'money') {
        return (
            <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={field.value}
                placeholder="0"
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className={NUMERIC_CLASS}
            />
        );
    }

    if (def.control === 'datetime') {
        return (
            <Input
                type="datetime-local"
                value={field.value}
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className="h-6 w-44 px-2 py-0 text-[0.6875rem]"
            />
        );
    }

    if (def.control === 'date') {
        return (
            <Input
                type="date"
                value={field.value}
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className={NUMERIC_CLASS}
            />
        );
    }

    // Многострочный ответ: сюда пишут реплику клиента целиком, и в строку
    // высотой в шесть пикселей она не помещалась — текст уезжал за край без
    // возможности перечитать.
    if (def.control === 'text') {
        return (
            <Textarea
                rows={2}
                value={field.value}
                aria-label={def.title}
                aria-invalid={field.isMissing}
                placeholder={def.placeholder ?? undefined}
                onChange={e => field.setValue(e.target.value)}
                className="min-h-12 w-64 resize-y px-2 py-1 text-[0.6875rem]"
            />
        );
    }

    // Строка со СВОИМ списком ответов: справочника в CRM нет (поле обычное
    // строковое), но отвечать нужно из готового набора формулировок —
    // варианты объявил сам вопрос анкеты.
    if (hasChecklistChoice(def)) {
        return (
            <MicroSelect
                ariaLabel={def.title}
                value={field.value || undefined}
                placeholder="Выбрать"
                invalid={field.isMissing}
                options={def.options.map(option => ({
                    value: option.code,
                    label: option.title,
                }))}
                onChange={field.setValue}
            />
        );
    }

    // Текст (`string`): формулировка клиента своими словами. Плейсхолдер
    // задаётся каталогом — он подсказывает, ЧТО именно записать, и для
    // ответов-цитат это половина смысла контрола.
    return (
        <Input
            type="text"
            value={field.value}
            aria-label={def.title}
            aria-invalid={field.isMissing}
            placeholder={def.placeholder ?? undefined}
            onChange={e => field.setValue(e.target.value)}
            className="h-6 w-56 px-2 py-0 text-[0.6875rem]"
        />
    );
};
