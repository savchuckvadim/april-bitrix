'use client';

import { FC } from 'react';
import { GradientScale, MicroSelect } from '@workspace/april-ui';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
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
 * Одна характеристика контакта в развёрнутом виде: имя, градиентная шкала и
 * микро-селект под ней.
 *
 * Шкала и селект — про одно и то же значение, но нужны оба: по шкале видно
 * положение среди остальных значений и ставится «на глаз» в один клик, а
 * селект называет варианты словами — их у характеристики бывает до семи, и
 * угадывать деление по тултипу неудобно.
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

    const select = (itemIndex: number) =>
        dispatch(setPbxContactField(contactId, field.field.code, itemIndex));

    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <span className="min-w-0 truncate text-[0.6875rem] text-muted-foreground">
                {name}
            </span>
            <GradientScale
                labels={field.items.map(item => item.name)}
                currentIndex={index}
                ramp={traitRamp(field.field.code)}
                onSelect={readOnly ? undefined : select}
                title={name}
                currentWord="сейчас"
                ariaLabel={`${name}: ${value ?? 'не задано'}`}
            />
            {readOnly ? (
                <span
                    className={
                        value
                            ? 'truncate text-xs font-medium'
                            : 'truncate text-xs text-muted-foreground/70'
                    }
                >
                    {value ?? 'не задано'}
                </span>
            ) : (
                <MicroSelect
                    ariaLabel={name}
                    value={index >= 0 ? String(index) : undefined}
                    placeholder="не задано"
                    options={field.items.map((item, itemIndex) => ({
                        value: String(itemIndex),
                        label: item.name,
                    }))}
                    onChange={next => select(Number(next))}
                    className="max-w-none"
                />
            )}
        </div>
    );
};
