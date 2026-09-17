import type { Tone } from '@workspace/april-ui';
import type {
    InnCandidate,
    InnConflict,
    InnCurrent,
    InnStrength,
} from '../model';

/**
 * Чистые функции представления вкладки «ИНН».
 *
 * Никаких текстов «от себя» про источники и расхождения: подписи приходят с
 * бэка готовыми (`label`, `message`) — там же, где принимается решение об их
 * силе. Здесь только раскладка и тон.
 */

/** Видимые варианты и скрытые — двумя списками. */
export function splitInnCandidates(candidates: readonly InnCandidate[]): {
    visible: InnCandidate[];
    hidden: InnCandidate[];
} {
    return {
        visible: candidates.filter(candidate => !candidate.hidden),
        hidden: candidates.filter(candidate => candidate.hidden),
    };
}

/** Тон бейджа разрядности: 10 знаков — юрлицо, 12 — ИП или физлицо. */
export const innDigitsLabel = (digits: number): string =>
    digits === 12 ? '12 знаков · ИП' : '10 знаков · юрлицо';

/** Слабый вариант (только из названия) видно по тону. */
export const innStrengthTone = (strength: InnStrength): Tone =>
    strength === 'weak'
        ? 'warning'
        : strength === 'strong'
          ? 'success'
          : 'muted';

/** Тон плашки расхождения. */
export const innConflictTone = (conflict: InnConflict): Tone =>
    conflict.level === 'error'
        ? 'destructive'
        : conflict.level === 'warning'
          ? 'warning'
          : 'muted';

/** Подпись происхождения текущего ИНН — короткой строкой под значением. */
export function innOriginLabel(current: InnCurrent): string {
    switch (current.origin) {
        case 'requisite':
            return 'из привязанного реквизита';
        case 'manual':
            return current.userName
                ? `выбрал ${current.userName}`
                : 'выбран вручную';
        case 'auto':
            return 'проставлен автоматически';
        case 'unknown':
            return 'происхождение неизвестно';
        default:
            return '';
    }
}

/**
 * Человеческий текст неудачной записи.
 *
 * Причина лежит в `response.data.message`: именно там Nest отдаёт «данные
 * изменились — обновите вкладку» (409) и «сделка закрыта». Без этого разбора
 * менеджер увидел бы «Request failed with status code 409».
 */
export function innWriteErrorText(error: unknown): string {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
    if (message) return String(message);
    return error instanceof Error
        ? error.message
        : 'Не удалось сохранить — попробуйте ещё раз.';
}

/** Реквизит по этому ИНН уже привязан к другой сделке — предупреждаем. */
export const otherDealsLabel = (dealIds: readonly number[]): string =>
    dealIds.length
        ? `по этому реквизиту уже есть ${dealIds.length === 1 ? 'сделка' : 'сделки'} ${dealIds
              .map(id => `№${id}`)
              .join(', ')}`
        : '';
