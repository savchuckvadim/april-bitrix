'use client';

import { FC } from 'react';
import { Eraser } from 'lucide-react';
import { IconAction, MicroField } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { ChecklistFieldView } from '../../lib/checklist-field-view';
import { ChecklistFieldControl } from './ChecklistFieldControl';

const STATUS_CLASS = 'text-[0.6875rem]';

/**
 * Одно поле чек-листа: контрол по типу + подпись состояния.
 *
 * «Сейчас: …» стоит отдельно от контрола: менеджер обязан УВИДЕТЬ, что уже
 * записано в CRM (требование заказчика — показывать текущие значения),
 * а не просто получить предзаполненный инпут.
 *
 * Стереть значение можно только ластиком: правка поля пустоту в портал не
 * отправляет — незавершённый ввод даты отдаёт `''` и раньше затирал
 * стоявшую дату (см. changeChecklistField).
 *
 * Значение в CRM есть, а пункт всё равно не закрыт — так бывает при
 * «обязательности изменения» и при истёкшем сроке годности. Тогда подпись
 * «сейчас: …» краснеет и прямо говорит, что нужен новый ответ: без этого
 * менеджер видел заполненное поле и не понимал, чем заблокирована отправка.
 */
export const ChecklistField: FC<{ field: ChecklistFieldView }> = ({
    field,
}) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <MicroField
            label={field.def.title}
            required={field.def.isRequired}
            invalid={field.isMissing}
        >
            <ChecklistFieldControl field={field} />
        </MicroField>

        {field.canClear && (
            <IconAction
                icon={Eraser}
                label="Очистить"
                hint="Стереть значение в карточке клиента."
                disabled={field.isSaving}
                onClick={field.clear}
            />
        )}

        {field.isSaving ? (
            <span className={cn(STATUS_CLASS, 'text-muted-foreground')}>
                сохраняем…
            </span>
        ) : field.isMissing ? (
            // Незакрытый пункт объясняется РАНЬШЕ «сохранено»: при
            // обязательности изменения ответ записан (и правда сохранён), а
            // пункт всё равно не закрыт — зелёная отметка тут врала бы.
            <span
                title={field.currentLabel || undefined}
                className={cn(
                    STATUS_CLASS,
                    'min-w-0 max-w-full truncate font-medium text-destructive',
                )}
            >
                {field.currentLabel
                    ? `сейчас: ${field.currentLabel} — нужен новый ответ`
                    : 'не заполнено'}
            </span>
        ) : field.isSaved ? (
            <span className={cn(STATUS_CLASS, 'text-success')}>сохранено</span>
        ) : field.currentLabel ? (
            // Значение из CRM бывает длинным (названия причин) — не даём ему
            // распирать строку, полное видно по наведению.
            <span
                title={field.currentLabel}
                className={cn(
                    STATUS_CLASS,
                    'min-w-0 max-w-full truncate text-muted-foreground',
                )}
            >
                сейчас: {field.currentLabel}
            </span>
        ) : null}
    </div>
);
