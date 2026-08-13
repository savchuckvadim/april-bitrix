'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getClientContext } from '@/modules/app/lib/utills/app-state-util';
import { deepSearchDuplicates } from '@/modules/features/Duplicates';
import { innActions } from '@/modules/features/Inn';
import {
    getCurrentInn,
    getInnTarget,
} from '@/modules/features/Inn/lib/inn-selectors';
import {
    ACTION_PROMPT_PRIORITY,
    pickActionPrompt,
    type ActionPrompt,
} from '../action-prompt';

export interface ActionPromptsView {
    current: ActionPrompt | null;
    /** «Позже»: гасим до перезагрузки — не запоминаем навсегда. */
    dismiss: () => void;
}

/**
 * Какая подсказка сейчас уместна.
 *
 * Правила читают уже загруженное состояние — своих запросов подсказки не
 * делают: спрашивать сервер ради того, чтобы что-то предложить, значит
 * платить задержкой за необязательное.
 *
 * Гашение живёт в компоненте, а не в сторе: «позже» — это решение на сейчас.
 * Хранить его дольше сессии нельзя, иначе менеджер один раз отмахнётся и
 * больше никогда не увидит подсказку.
 */
export const useActionPrompts = (): ActionPromptsView => {
    const dispatch = useAppDispatch();
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    const context = useAppSelector(getClientContext);
    const innTarget = useAppSelector(getInnTarget);
    const currentInn = useAppSelector(getCurrentInn);
    const duplicatesStatus = useAppSelector(s => s.duplicates.status);
    const candidatesCount = useAppSelector(s => s.duplicates.candidates.length);

    const prompts: ActionPrompt[] = [];

    // ИНН — самый сильный сигнал поиска дублей (вес 100 на бэке) и
    // обязательное поле для продажи.
    if (innTarget && !currentInn) {
        prompts.push({
            id: 'fill-inn',
            question: 'Записать ИНН клиента?',
            hint: 'По нему сразу проверим, не ведёт ли клиента кто-то ещё.',
            actionLabel: 'Записать',
            tone: context === 'dealNoCompany' ? 'warning' : 'info',
            priority: ACTION_PROMPT_PRIORITY.RISK,
            run: () => dispatch(innActions.setEditorOpen({ isOpen: true })),
        });
    }

    // Поиск отработал и нашёл пересечения — глубокий уровень покажет остальное.
    if (duplicatesStatus === 'ready' && candidatesCount > 0) {
        prompts.push({
            id: 'deep-duplicates',
            question: `Проверить пересечения глубже? Нашлось ${candidatesCount}`,
            hint: 'Второй уровень поиска смотрит связи и историю, а не только прямые совпадения.',
            actionLabel: 'Искать глубже',
            tone: 'warning',
            priority: ACTION_PROMPT_PRIORITY.HELPFUL,
            run: () => dispatch(deepSearchDuplicates()),
        });
    }

    return {
        current: pickActionPrompt(prompts, dismissedIds),
        dismiss: () => {
            const id = pickActionPrompt(prompts, dismissedIds)?.id;
            if (id) setDismissedIds(ids => [...ids, id]);
        },
    };
};
