'use client';

import { UserPlus, type LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';

export interface ReportTool {
    id: string;
    icon: LucideIcon;
    label: string;
    hint: string;
    run: () => void;
}

/**
 * Инструменты отчёта — то, чего в нём ещё НЕТ.
 *
 * Пустые карточки («Контакт не выбран», «Записей нет») размазывали экран:
 * места занимают, а сказать им нечего. Вместо этого — иконка в панели пульта:
 * нажал, добавил, иконка исчезла, на её месте появилась настоящая карточка с
 * данными и своими действиями.
 *
 * Панель живёт и в свёрнутом пульте, и в развёрнутом: добавлять недостающее
 * менеджеру нужно чаще, чем разворачивать отчёт.
 */
export const useReportTools = (): ReportTool[] => {
    const dispatch = useAppDispatch();
    const hasContact = useAppSelector(s => Boolean(s.contact.current.report));
    const hasCandidates = useAppSelector(s => s.contact.contacts.length > 0);

    const tools: ReportTool[] = [];

    if (!hasContact) {
        tools.push({
            id: 'contact',
            icon: UserPlus,
            label: 'Контакт',
            // Есть из кого выбирать — открываем выбор, иначе сразу создание:
            // лишний экран «список из нуля строк» никому не нужен.
            hint: hasCandidates
                ? 'Выбрать, с кем говорили, или создать нового'
                : 'Создать контакт: ФИО и телефон',
            run: () =>
                hasCandidates
                    ? dispatch(
                          eventContactActions.openContactDialog({
                              mode: 'edit',
                              side: EV_CONTACT_TYPE.REPORT,
                          }),
                      )
                    : dispatch(
                          eventContactActions.setCreatingContact({
                              isCreating: true,
                              type: EV_CONTACT_TYPE.REPORT,
                          }),
                      ),
        });
    }

    return tools;
};
