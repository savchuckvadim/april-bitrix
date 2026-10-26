import type { BXUser } from '@workspace/bx';
import type { ComboboxOption } from '@workspace/april-ui/fields';

/**
 * Сотрудники отдела как варианты выбора «кому» (передать заявку, передать
 * работу): «Имя Фамилия», должность подсказкой. `excludeIds` — кого не
 * показывать (себя, текущего владельца работы): передать ему значит ничего
 * не передать.
 */
export const toUserOptions = (
    users: readonly BXUser[],
    excludeIds: readonly number[] = [],
): ComboboxOption[] => {
    const excluded = new Set(excludeIds.filter(id => id > 0));
    return users
        .filter(user => !excluded.has(Number(user.ID)))
        .map(user => ({
            value: String(user.ID),
            label:
                [user.NAME, user.LAST_NAME].filter(Boolean).join(' ').trim() ||
                `Сотрудник ${user.ID}`,
            hint: user.WORK_POSITION || undefined,
        }));
};
