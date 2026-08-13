'use client';

import { FC } from 'react';
import { GradientScale, MicroSelect } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    isFlagTrait,
    isGoodFlagValue,
    currentItemIndex,
    currentItemName,
    shortFieldName,
    traitRamp,
} from '../lib/contact-field-view';
import { setPbxContactField } from '../model/PbxContactThunk';

interface PbxContactFieldItemProps {
    contactId: number;
    field: PBXContactFieldData;
    /** Просмотр: шкала и значение словами, без права задеть значение. */
    readOnly?: boolean;
}

/**
 * Одна характеристика контакта: подпись со значением, градиентная шкала и
 * микро-селект под ней.
 *
 * Подпись стоит НАД шкалой и всегда называет текущее значение словами («Не
 * задано», «Не желает», «Клиент»): сама по себе полоска говорит только про
 * «больше-меньше», а менеджеру нужно точное слово — по нему он решает, что
 * говорить дальше. Селект ниже — чтобы выбрать словами, а не целиться в
 * деление: значений у характеристики бывает до семи.
 */
export const PbxContactFieldItem: FC<PbxContactFieldItemProps> = ({
    contactId,
    field,
    readOnly = false,
}) => {
    const dispatch = useAppDispatch();
    const index = currentItemIndex(field);
    const name = shortFieldName(field.field.name);
    const value = currentItemName(field);
    const error = useAppSelector(
        s => s.contact.fieldErrors[`${contactId}:${field.field.code}`],
    );

    const isFlag = isFlagTrait(field);

    const select = (itemIndex: number) =>
        dispatch(setPbxContactField(contactId, field.field.code, itemIndex));

    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-baseline justify-between gap-2">
                <span className="min-w-0 truncate text-[0.6875rem] text-muted-foreground">
                    {name}
                </span>
                <span
                    className={
                        value
                            ? 'shrink-0 text-[0.6875rem] font-medium text-foreground'
                            : 'shrink-0 text-[0.6875rem] text-muted-foreground/70'
                    }
                >
                    {value ?? 'Не задано'}
                </span>
            </div>

            {isFlag ? (
                <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => select(index === 0 ? 1 : 0)}
                    className={cn(
                        'w-fit rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                        readOnly ? 'cursor-default' : 'cursor-pointer',
                        index < 0 && 'bg-muted text-muted-foreground',
                        index >= 0 &&
                            (isGoodFlagValue(field, index)
                                ? 'bg-success/15 text-[color:color-mix(in_oklab,var(--success),var(--foreground)_var(--tone-soft-mix))]'
                                : 'bg-destructive/15 text-[color:color-mix(in_oklab,var(--destructive),var(--foreground)_var(--tone-soft-mix))]'),
                    )}
                >
                    {value ?? 'Отметить'}
                </button>
            ) : (
                <GradientScale
                    labels={field.items.map(item => item.name)}
                    currentIndex={index}
                    ramp={traitRamp(field.field.code)}
                    onSelect={readOnly ? undefined : select}
                    title={name}
                    currentWord="сейчас"
                    ariaLabel={`${name}: ${value ?? 'не задано'}`}
                />
            )}

            {!readOnly && !isFlag && (
                <MicroSelect
                    ariaLabel={name}
                    value={index >= 0 ? String(index) : undefined}
                    placeholder="Не задано"
                    options={field.items.map((item, itemIndex) => ({
                        value: String(itemIndex),
                        label: item.name,
                    }))}
                    onChange={next => select(Number(next))}
                    className="max-w-none"
                    invalid={Boolean(error)}
                />
            )}

            {error && (
                <span className="text-[0.625rem] text-destructive">
                    {error}
                </span>
            )}
        </div>
    );
};
