import type { Tone } from '@workspace/april-ui';
import type {
    DuplicateCandidate,
    DuplicateEntityType,
    DuplicateMatchReason,
    RelatedStage,
} from '../model';
import { DUPLICATE_ENTITY_TYPE } from '../model';

/**
 * Представление кандидата: подписи, тона, пороги.
 *
 * Живёт в `lib`, а не в компонентах — правило репо «данные отдельно от UI».
 * Компонент только рисует то, что здесь посчитано.
 */

/** Как называем тип сущности в интерфейсе. */
export const ENTITY_TYPE_LABEL: Record<DuplicateEntityType, string> = {
    [DUPLICATE_ENTITY_TYPE.LEAD]: 'Лид',
    [DUPLICATE_ENTITY_TYPE.CONTACT]: 'Контакт',
    [DUPLICATE_ENTITY_TYPE.COMPANY]: 'Компания',
    [DUPLICATE_ENTITY_TYPE.DEAL]: 'Сделка',
};

/** Путь к сущности в Битриксе — по клику открываем карточку в слайдере. */
const ENTITY_PATH: Record<DuplicateEntityType, string> = {
    [DUPLICATE_ENTITY_TYPE.LEAD]: 'lead',
    [DUPLICATE_ENTITY_TYPE.CONTACT]: 'contact',
    [DUPLICATE_ENTITY_TYPE.COMPANY]: 'company',
    [DUPLICATE_ENTITY_TYPE.DEAL]: 'deal',
};

export const buildCrmUrl = (
    domain: string,
    entityType: DuplicateEntityType,
    id: number,
): string =>
    `https://${domain}/crm/${ENTITY_PATH[entityType]}/details/${id}/`;

/**
 * Тон причины. ИНН — точное совпадение, красим тревожно; телефон и email
 * чуть мягче; название — только намёк.
 */
export function reasonTone(reason: DuplicateMatchReason): Tone {
    if (reason.kind === 'inn') {
        // ИНН, выковырянный из названия, — не то же самое, что ИНН из поля.
        return reason.via === 'TITLE' || reason.via === 'COMPANY_TITLE'
            ? 'warning'
            : 'destructive';
    }
    if (reason.kind === 'phone' || reason.kind === 'email') return 'warning';
    return 'muted';
}

/** Короткая подпись причины — влезает в узкую колонку. */
export function reasonLabel(reason: DuplicateMatchReason): string {
    switch (reason.kind) {
        case 'inn':
            return reason.via === 'RQ_INN'
                ? `ИНН в реквизитах ${reason.value}`
                : `ИНН ${reason.value}`;
        case 'phone':
            return `телефон ${formatPhone(reason.value)}`;
        case 'email':
            return `email ${reason.value}`;
        default:
            return 'похожее название';
    }
}

/** `9991234567` → `+7 999 123-45-67`: бэкенд хранит нормализованные 10 цифр. */
export function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) return value;
    return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
}

/**
 * Тон карточки по уверенности. Ниже 60 — «возможно», такое не должно
 * кричать красным: менеджер перестанет доверять панели.
 */
export function candidateTone(candidate: DuplicateCandidate): Tone {
    if (candidate.score >= 90) return 'destructive';
    if (candidate.score >= 60) return 'warning';
    return 'muted';
}

/** Текстовая оценка — понятнее числа. */
export function candidateConfidence(candidate: DuplicateCandidate): string {
    if (candidate.score >= 90) return 'Точный дубль';
    if (candidate.score >= 60) return 'Вероятный дубль';
    return 'Возможное совпадение';
}

export function candidateTitle(candidate: DuplicateCandidate): string {
    return (
        candidate.title?.trim() ||
        `${ENTITY_TYPE_LABEL[candidate.entityType]} ${candidate.id}`
    );
}

/**
 * Доля заполнения полоски стадии. Без `order`/`total` (стадии нет в настройках
 * портала) полоску не рисуем вовсе — врать про прогресс хуже, чем молчать.
 */
export function stageProgress(stage: RelatedStage): number | null {
    if (stage.order === undefined || !stage.total) return null;
    return Math.min(1, (stage.order + 1) / stage.total);
}

/** Цвет стадии из настроек портала; нет цвета — нейтральная подложка. */
export function stageColor(stage: RelatedStage): string | undefined {
    const color = stage.color?.trim();
    if (!color) return undefined;
    return color.startsWith('#') ? color : `#${color}`;
}
