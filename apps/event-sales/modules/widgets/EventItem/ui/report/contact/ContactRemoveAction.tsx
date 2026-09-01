'use client';

import { FC, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';

interface ContactRemoveActionProps {
    /** Чей контакт снимаем: отчёта или плана. По умолчанию — отчёт. */
    type?: EV_CONTACT_TYPE;
}

/** Подписи по стороне: у плана свои слова (todo3108: «нет возможности
 * убрать контакт из плана — а должна быть»). */
const REMOVE_LABEL: Record<EV_CONTACT_TYPE, { label: string; hint: string }> = {
    [EV_CONTACT_TYPE.REPORT]: {
        label: 'Убрать из отчёта',
        hint: 'Контакт останется в CRM — уйдёт только из этого отчёта',
    },
    [EV_CONTACT_TYPE.PLAN]: {
        label: 'Убрать из плана',
        hint: 'Контакт останется в CRM — следующая задача пойдёт без него',
    },
};

/**
 * Снять контакт с отчёта или плана — с переспросом.
 *
 * Переспрашиваем потому, что кнопка стоит рядом с «посмотреть» и «изменить»,
 * а промах стоит дорого: контакт разговора — это то, по чему потом ищут
 * историю общения. Сам человек в CRM остаётся: здесь отвязка от формы, и
 * подпись говорит об этом прямо.
 */
export const ContactRemoveAction: FC<ContactRemoveActionProps> = ({
    type = EV_CONTACT_TYPE.REPORT,
}) => {
    const dispatch = useAppDispatch();
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isConfirming) {
        return (
            <IconAction
                icon={Trash2}
                label={REMOVE_LABEL[type].label}
                hint={REMOVE_LABEL[type].hint}
                onClick={() => setIsConfirming(true)}
            />
        );
    }

    return (
        <span className="inline-flex items-center gap-1">
            <span className="text-[0.625rem] whitespace-nowrap text-muted-foreground">
                Точно убрать?
            </span>
            <Button
                size="sm"
                variant="destructive"
                className="h-6 px-2 text-[0.65rem]"
                onClick={() => {
                    dispatch(
                        eventContactActions.clearCurrentContact({ type }),
                    );
                    setIsConfirming(false);
                }}
            >
                Убрать
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[0.65rem]"
                onClick={() => setIsConfirming(false)}
            >
                Отмена
            </Button>
        </span>
    );
};
