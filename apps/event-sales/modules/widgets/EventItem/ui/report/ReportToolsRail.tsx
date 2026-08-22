'use client';

import { FC } from 'react';
import { ContactToolButton } from './ContactToolButton';
import { RequestToolButton } from './RequestToolButton';

/**
 * Панель привязок дела: ровно две иконки — заявка и контакт.
 *
 * Раньше здесь показывалось «чего не хватает», и иконка исчезала, как только
 * элемент добавили: по экрану нельзя было понять, есть у дела заявка с
 * контактом или нет. Теперь иконки на месте всегда и ЗАЖИГАЮТСЯ, когда
 * элемент прикреплён к самой задаче.
 *
 * Стоит в правом верхнем углу пульта абсолютно — и в свёрнутом виде, и в
 * развёрнутом место одно и то же, так что рука привыкает.
 */
export const ReportToolsRail: FC = () => (
    <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5">
        <RequestToolButton />
        <ContactToolButton />
    </span>
);
