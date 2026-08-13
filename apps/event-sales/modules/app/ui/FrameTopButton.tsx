'use client';

import { FC } from 'react';
import { Maximize2 } from 'lucide-react';
import { Bitrix } from '@workspace/bitrix';
import { useUiDensity } from '../lib/hooks/use-ui-density';

/**
 * Вернуть встройку в поле зрения.
 *
 * Во вкладке карточки приложение — блок посреди чужой длинной страницы. Стоит
 * раскрыть комментарий или историю, и фрейм вырастает вниз: кнопки отчёта
 * оказываются ниже края экрана, а прокручивать надо РОДИТЕЛЬСКУЮ страницу, до
 * которой изнутри не дотянуться обычным скроллом. Отсюда кнопка: она просит
 * портал подкрутить себя к началу встройки.
 *
 * Приём подсмотрен в старом конструкторе (иконка «дисплей» в шапке) — там он
 * решал ровно эту боль.
 *
 * В полноэкранных встройках кнопки нет: там прокрутка своя и проблемы не
 * существует.
 */
export const FrameTopButton: FC = () => {
    const { isSelfSized } = useUiDensity();

    if (!isSelfSized) return null;

    const scrollToFrame = () => {
        try {
            Bitrix.getService().api.scrollParentTo(0);
        } catch (error) {
            // Вне фрейма сервиса Bitrix нет — в dev это норма.
            console.debug('scrollParentWindow skipped', error);
        }
    };

    return (
        <button
            type="button"
            onClick={scrollToFrame}
            title="Показать приложение целиком"
            aria-label="Показать приложение целиком"
            className="cursor-pointer rounded-md p-1 text-muted-foreground transition-transform hover:text-foreground active:scale-90"
        >
            <Maximize2 aria-hidden size={16} />
        </button>
    );
};
