'use client';

import { FC } from 'react';
import { GradientScale } from '@workspace/april-ui';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    CONTACT_SCALE_RAMP,
    currentItemIndex,
    currentItemName,
    shortFieldName,
} from '../lib/contact-field-view';
import { setPbxContactField } from '../model/PbxContactThunk';

interface PbxContactFieldItemProps {
    contactId: number;
    field: PBXContactFieldData;
}

/**
 * Одна характеристика контакта: короткое имя, текущее значение и кликабельная
 * градиентная шкала — клик по делению выставляет именно его (как в старом
 * «конструкторе»), тултип называет значение под курсором.
 *
 * Занимает две строки вместо кнопки-панели: во фрейме-миниатюре характеристик
 * у контакта до девяти.
 */
export const PbxContactFieldItem: FC<PbxContactFieldItemProps> = ({
    contactId,
    field,
}) => {
    const dispatch = useAppDispatch();
    const index = currentItemIndex(field);
    const name = shortFieldName(field.field.name);
    const value = currentItemName(field);

    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-baseline justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-muted-foreground">
                    {name}
                </span>
                <span
                    className={
                        value
                            ? 'shrink-0 font-medium text-foreground'
                            : 'shrink-0 text-muted-foreground/70'
                    }
                >
                    {value ?? 'не задано'}
                </span>
            </div>
            <GradientScale
                labels={field.items.map(item => item.name)}
                currentIndex={index}
                ramp={CONTACT_SCALE_RAMP}
                onSelect={itemIndex =>
                    dispatch(
                        setPbxContactField(
                            contactId,
                            field.field.code,
                            itemIndex,
                        ),
                    )
                }
                title={name}
                currentWord="сейчас"
                ariaLabel={`${name}: ${value ?? 'не задано'}`}
            />
        </div>
    );
};
