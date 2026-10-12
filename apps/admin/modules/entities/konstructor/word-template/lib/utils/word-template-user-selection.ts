import type {
    IDepartmentUser,
    IUserSelectedTemplateSummary,
    IWordTemplateSummury,
} from '../../model';

/** Шаблон + выбор пользователя по нему (если есть). */
export interface UserTemplateRow {
    template: IWordTemplateSummury;
    selection: IUserSelectedTemplateSummary | null;
    isCurrent: boolean;
    isFavorite: boolean;
    isActive: boolean;
}

/**
 * Склейка «шаблоны глазами пользователя»: бэкенд отдаёт список шаблонов и
 * ОТДЕЛЬНО строки выбора (`user_selected_templates`). Соединяем по id
 * шаблона; у шаблона без строки выбора все флаги false.
 *
 * `template_id` в выборе — число, `id` шаблона — строка: сравниваем как
 * строки, чтобы не зависеть от того, что пришлёт генерация.
 */
export function mergeUserSelection(
    templates: readonly IWordTemplateSummury[],
    selected: readonly IUserSelectedTemplateSummary[],
): UserTemplateRow[] {
    const byTemplate = new Map<string, IUserSelectedTemplateSummary>();
    for (const item of selected) {
        byTemplate.set(String(item.template_id), item);
    }
    return templates.map((template) => {
        const selection = byTemplate.get(String(template.id)) ?? null;
        return {
            template,
            selection,
            isCurrent: selection?.is_current ?? false,
            isFavorite: selection?.is_favorite ?? false,
            isActive: selection?.is_active ?? false,
        };
    });
}

/** «Фамилия Имя (email)» для селекта; email — если есть, он отличает тёзок. */
export function formatDepartmentUser(user: IDepartmentUser): string {
    const name = [user.LAST_NAME, user.NAME]
        .map((part) => (part ?? '').trim())
        .filter(Boolean)
        .join(' ');
    const base = name || `Пользователь #${user.ID}`;
    return user.EMAIL ? `${base} (${user.EMAIL})` : base;
}

/** Пользователи отдела, отсортированные по подписи — для стабильного селекта. */
export function sortDepartmentUsers(users: readonly IDepartmentUser[]): IDepartmentUser[] {
    return [...users].sort((a, b) =>
        formatDepartmentUser(a).localeCompare(formatDepartmentUser(b), 'ru'),
    );
}
