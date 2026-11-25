'use client';

import { IconAction, type IconActionProps } from '@workspace/april-ui';

/** Кнопка шапки: всё от иконки-действия, кроме вида и положения подсказки. */
export type HeaderActionProps = Omit<
    IconActionProps,
    'variant' | 'size' | 'side' | 'align'
>;

/**
 * Кнопка шапки отчёта: иконка в рамке без подписи, название и пояснение — в
 * подсказке. Подсказка открывается вниз: шапка прижата к верху окна. Все
 * действия шапки выглядят одинаково; со словами остаются только переключатель
 * фильтров и «Применить».
 */
export const HeaderAction = (props: HeaderActionProps) => (
    <IconAction
        variant="outline"
        size="md"
        side="bottom"
        align="end"
        {...props}
    />
);
