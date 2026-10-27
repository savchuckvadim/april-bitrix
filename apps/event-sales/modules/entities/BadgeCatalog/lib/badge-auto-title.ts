import { composeEventTitle } from './badge-visibility';

export interface AutoTitleInput {
    /** Что сейчас в поле «Название». */
    currentName: string;
    /** Что подставили сами в прошлый раз (пусто — ещё не подставляли). */
    lastAutoTitle: string;
    /** Тип события выбран: без типа автоподстановки нет. */
    hasType: boolean;
    /** Основной текст типа портала; null — его нет (общий набор). */
    defaultText: string | null;
    clientName: string;
    maxLength: number;
}

/**
 * Что поставить в название события сейчас; null — ничего не трогать.
 *
 * Согласованное «Звонок + имя клиента» (27.10.2026): слово типа заголовок
 * задачи добавляет сам («<тип>  <название>  <контакт>»), поэтому в поле
 * ставится одно имя клиента, а если портал завёл основной текст типа —
 * «<текст> — <клиент>».
 *
 * Бережно: написанное рукой не затираем — подставляем только в пустое поле
 * или поверх своего же прошлого автотекста (сменил тип — название
 * сменилось вместе с ним). Длинное название обрезается до предела поля,
 * иначе проверка отправки отказала бы за то, чего менеджер не писал.
 */
export const resolveAutoTitle = ({
    currentName,
    lastAutoTitle,
    hasType,
    defaultText,
    clientName,
    maxLength,
}: AutoTitleInput): string | null => {
    if (!hasType) return null;
    const current = currentName.trim();
    if (current && current !== lastAutoTitle) return null;

    const composed = defaultText
        ? composeEventTitle(defaultText, clientName)
        : clientName.trim();
    const title = composed.slice(0, maxLength).trim();
    if (!title || title === current) return null;
    return title;
};
