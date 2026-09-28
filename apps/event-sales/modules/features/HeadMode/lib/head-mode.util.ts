import type { BXUser } from '@workspace/bx';

/**
 * РЕЖИМ РУКОВОДИТЕЛЯ — чистые правила (решения владельца 28.09.2026).
 *
 * Руководитель видит дела своих сотрудников и отрабатывает их ОТ ИМЕНИ
 * сотрудника: отчёт и следующее дело записываются на сотрудника, сделки на
 * руководителя не переходят. Сам руководитель уезжает в отчёте отдельной
 * пометкой — её ставит бэк.
 *
 * Кто кому подчинён, фронт не считает: список приходит с бэка одним полем
 * (тот же расчёт, которым бэк проверяет отчёт за сотрудника).
 */

/** Что нужно знать, чтобы решить, за кого идёт работа. */
export interface ActingEmployeeInput {
    /** Режим включён тумблером. */
    enabled: boolean;
    /** Текущий пользователь; 0 — ещё неизвестен. */
    myId: number;
    subordinateIds: readonly number[];
    /** Ответственный открытого дела; null — дела нет (новое событие). */
    taskResponsibleId: number | null;
}

const toId = (raw: unknown): number => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : 0;
};

/**
 * Чьи дела показывать в списке: свои, а в режиме руководителя — ещё и
 * сотрудников. Пустой периметр или выключенный режим — только свои.
 */
export const resolveTaskResponsibleIds = (
    myId: number,
    subordinateIds: readonly number[],
    enabled: boolean,
): number[] => {
    const own = toId(myId);
    if (!enabled || !subordinateIds.length) return own ? [own] : [];
    const ids = new Set<number>(own ? [own] : []);
    for (const id of subordinateIds) {
        const value = toId(id);
        if (value) ids.add(value);
    }
    return [...ids];
};

/**
 * За кого идёт работа по открытому делу; null — за себя.
 *
 * Чужим считается только дело СВОЕГО сотрудника: дело человека вне
 * периметра руководитель отрабатывает от себя, как любой менеджер.
 */
export const resolveActingEmployeeId = (
    input: ActingEmployeeInput,
): number | null => {
    if (!input.enabled) return null;
    const employeeId = toId(input.taskResponsibleId);
    if (!employeeId || employeeId === toId(input.myId)) return null;
    return input.subordinateIds.includes(employeeId) ? employeeId : null;
};

/**
 * Имя ответственного из самой задачи. Битрикс отдаёт его объектом
 * `{ id, name, … }`, хотя тип задачи в пакете описывает там пользователя
 * портала — поэтому читаем защитно, без доверия к типу.
 */
export const taskResponsibleName = (
    task: { responsible?: unknown } | null | undefined,
): string => {
    const responsible = task?.responsible;
    if (!responsible || typeof responsible !== 'object') return '';
    const name = (responsible as { name?: unknown }).name;
    return typeof name === 'string' ? name.trim() : '';
};

/** «Фамилия Имя»; пустое имя — нейтральная подпись с номером. */
export const userFullName = (
    user: Pick<BXUser, 'ID' | 'NAME' | 'LAST_NAME'> | null | undefined,
): string => {
    if (!user) return '';
    const name = [user.LAST_NAME, user.NAME]
        .map(part => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join(' ');
    return name || `Сотрудник ${String(user.ID)}`;
};

/**
 * Сотрудник по id — из списка отдела. Нет в списке (работает в соседнем
 * подразделении) — минимальная запись с именем из самой задачи: отчёту
 * нужен только идентификатор, а человеку на экране — имя.
 */
export const findAssignee = (
    userId: number,
    users: readonly BXUser[],
    fallbackName = '',
): BXUser => {
    const found = users.find(user => toId(user.ID) === userId);
    if (found) return found;
    return {
        ID: userId,
        NAME: fallbackName.trim() || `Сотрудник ${userId}`,
    } as unknown as BXUser;
};

/** Что уходит в отчёт полем «кто отчитался за сотрудника». */
export interface ActingManagerPayload {
    ID: number;
    NAME?: string;
}

/**
 * Пометка отчёта; undefined — отчёт обычный.
 *
 * Условие то же, что проверит бэк: режим включён, дело записывается на
 * сотрудника из периметра, и этот сотрудник — не сам руководитель.
 */
export const buildActingManager = (input: {
    enabled: boolean;
    me: BXUser | null;
    planResponsibleId: number;
    subordinateIds: readonly number[];
}): ActingManagerPayload | undefined => {
    const myId = toId(input.me?.ID);
    if (!input.enabled || !myId) return undefined;
    const employeeId = toId(input.planResponsibleId);
    if (!employeeId || employeeId === myId) return undefined;
    if (!input.subordinateIds.includes(employeeId)) return undefined;
    return { ID: myId, NAME: userFullName(input.me) };
};

/** Вариант выбора «кому дело». */
export interface AssigneeOption {
    value: string;
    label: string;
    hint?: string;
}

/**
 * Кому можно записать следующее дело.
 *
 * Дело сотрудника — только сотрудникам: руководитель не забирает чужую
 * работу себе. Своё дело или новое событие — себе либо любому сотруднику.
 */
export const buildAssigneeOptions = (input: {
    me: BXUser | null;
    users: readonly BXUser[];
    subordinateIds: readonly number[];
    /** Открыто дело сотрудника. */
    isActing: boolean;
    /** Уже выбранный — остаётся в списке, даже если его нет в отделе. */
    current: BXUser | null;
}): AssigneeOption[] => {
    const myId = toId(input.me?.ID);
    const options = new Map<number, AssigneeOption>();
    const push = (user: BXUser | null, hint?: string): void => {
        const id = toId(user?.ID);
        if (!id || options.has(id)) return;
        options.set(id, {
            value: String(id),
            label: userFullName(user),
            hint: hint ?? (user?.WORK_POSITION || undefined),
        });
    };

    if (!input.isActing && input.me) push(input.me, 'это вы');
    for (const id of input.subordinateIds) {
        push(findAssignee(toId(id), input.users));
    }
    const currentId = toId(input.current?.ID);
    if (currentId && (currentId !== myId || !input.isActing)) {
        push(input.current);
    }
    return [...options.values()];
};
