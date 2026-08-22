'use client';

import { FC } from 'react';
import { Eye, Pencil, UserPlus, UserSearch } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';

interface ContactActionsProps {
    /** Контакт выбран — есть что смотреть; иначе одно действие «создать». */
    hasContact: boolean;
    onView: () => void;
    onEdit: () => void;
    /** «Плюс» без контакта: сразу окно создания (решение владельца 14.08). */
    onCreate?: () => void;
    /** Быстрый выбор существующего: дозвонились другому — заменили. */
    onPick?: () => void;
}

/**
 * Действия карточки контакта: посмотреть и изменить.
 *
 * Разделены намеренно. Смотрят характеристики часто, а правят редко — и шкала
 * реагирует на клик: в общем окне листание грозило бы сбить значение. Глаз
 * открывает то же окно без единого поля ввода.
 */
export const ContactActions: FC<ContactActionsProps> = ({
    hasContact,
    onView,
    onEdit,
    onCreate,
    onPick,
}) => {
    if (!hasContact) {
        return (
            <>
                <IconAction
                    icon={UserPlus}
                    label="Создать контакт"
                    hint="ФИО и телефон — остальное можно дозаполнить после"
                    onClick={onCreate ?? onEdit}
                />
                {onPick && (
                    <IconAction
                        icon={UserSearch}
                        label="Выбрать существующего"
                        hint="Поиск по контактам всех связей клиента"
                        onClick={onPick}
                    />
                )}
            </>
        );
    }

    return (
        <>
            {onPick && (
                <IconAction
                    icon={UserSearch}
                    label="Заменить контакт"
                    hint="Дозвонились другому? Выберите его или создайте"
                    onClick={onPick}
                />
            )}
            <IconAction
                icon={Eye}
                label="Посмотреть"
                hint="Характеристики, телефон, почта"
                onClick={onView}
            />
            <IconAction
                icon={Pencil}
                label="Изменить"
                hint="Выбрать другого человека, править характеристики"
                onClick={onEdit}
            />
        </>
    );
};
