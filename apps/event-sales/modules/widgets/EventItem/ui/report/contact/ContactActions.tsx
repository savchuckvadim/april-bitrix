'use client';

import { FC } from 'react';
import { Eye, Pencil, UserPlus } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';

interface ContactActionsProps {
    /** Контакт выбран — есть что смотреть; иначе одно действие «выбрать». */
    hasContact: boolean;
    onView: () => void;
    onEdit: () => void;
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
}) => {
    if (!hasContact) {
        return (
            <IconAction
                icon={UserPlus}
                label="Выбрать контакт"
                hint="С кем именно вы говорили"
                onClick={onEdit}
            />
        );
    }

    return (
        <>
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
