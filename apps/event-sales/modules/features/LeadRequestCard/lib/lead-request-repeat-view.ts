import type { LeadRequestRepeat } from '../model';
import { LEAD_REQUEST_REPEAT_TEXT } from '../consts/lead-request.const';

/** Что показать в блоке «повторное обращение» — без вёрстки. */
export interface LeadRequestRepeatView {
    stageLine: string | null;
    responsibleLine: string | null;
    /** Предупреждение: прежнего ответственного нет в круге. */
    rotationWarning: string | null;
}

/**
 * Строки блока «повторное обращение» — чистая функция: текст не
 * собирается в компоненте (правило front-refactor).
 */
export function buildLeadRequestRepeatView(
    repeat: LeadRequestRepeat,
    currentUserId: number,
): LeadRequestRepeatView {
    const T = LEAD_REQUEST_REPEAT_TEXT;
    const stageLine = repeat.stageBeforeName
        ? `${T.stageBefore} «${repeat.stageBeforeName}»` +
          (repeat.willReturnStage ? ` — ${T.willReturn}` : '')
        : null;

    const who = repeat.responsible;
    if (!who) return { stageLine, responsibleLine: null, rotationWarning: null };

    const name =
        who.id === currentUserId ? T.you : (who.name ?? `#${who.id}`);
    const rotationWarning = !who.active
        ? T.dismissed
        : !who.inRotation
          ? T.notInRotation
          : null;
    return {
        stageLine,
        responsibleLine: `${T.responsible}: ${name}`,
        rotationWarning,
    };
}
