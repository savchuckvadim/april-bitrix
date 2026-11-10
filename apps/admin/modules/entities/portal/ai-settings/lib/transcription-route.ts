import type {
    AiTranscriptionSlotDto,
    PortalTranscriptionRouteDto,
} from '@workspace/nest-admin-api';

/**
 * Маршрут распознавания портала (бэк: portal-transcription-route.types):
 * кто переводит в текст длинные и короткие звонки, кто запасной, кто «для
 * скорости» и «для точности». Решение владельца 10.11.2026. Здесь — черновик
 * формы и его перевод в тело запроса; правила зеркалят нормализацию бэка,
 * чтобы админ видел русскую ошибку формы, а не 400.
 */

/** Сентинел селекта «как в режиме» (Radix Select не принимает ''). */
export const ROUTE_NOT_SET = '__route_not_set__';

export const ROUTE_LONG_MIN_SEC = { min: 30, max: 7200 } as const;
export const ROUTE_MAX_FALLBACKS = 3;
export const ROUTE_MODEL_MAX_LENGTH = 120;

/** Транскрибаторы — зеркало AI_TRANSCRIPTION_PROVIDERS бэка. */
export const ROUTE_PROVIDER_OPTIONS = [
    {
        value: 'bitrix-vibecode',
        label: 'VibeCode Битрикса',
        modelPlaceholder: 'bitrix/bitrixgpt-5.6-transcribe',
    },
    { value: 'yandex', label: 'Яндекс SpeechKit', modelPlaceholder: null },
    {
        value: 'local-whisper',
        label: 'Whisper-совместимый сервис',
        modelPlaceholder: 'whisper-large-v3-turbo',
    },
] as const;
export type RouteProvider = (typeof ROUTE_PROVIDER_OPTIONS)[number]['value'];

export const ROUTE_PRIORITY_OPTIONS = [
    {
        value: 'normal',
        label: 'Обычно: по длительности',
        hint: 'Длинные звонки распознаёт роль «Длинные», короткие — роль «Короткие».',
    },
    {
        value: 'fast',
        label: 'Скорость',
        hint: 'Все звонки распознаёт роль «Для скорости» — например, когда накопилась очередь.',
    },
    {
        value: 'precise',
        label: 'Точность',
        hint: 'Все звонки распознаёт роль «Для точности» — например, перед переразбором для отчёта.',
    },
] as const;
export type RoutePriority = (typeof ROUTE_PRIORITY_OPTIONS)[number]['value'];

export type RouteRole = 'long' | 'short' | 'fast' | 'precise';

/** Роли в порядке показа: подпись и пояснение простыми словами. */
export const ROUTE_ROLES: readonly {
    role: RouteRole;
    label: string;
    hint: string;
}[] = [
    {
        role: 'long',
        label: 'Длинные звонки',
        hint: 'Презентации и долгие разговоры. Здесь важнее надёжность на большой записи.',
    },
    {
        role: 'short',
        label: 'Короткие звонки',
        hint: 'Их больше всего, поэтому здесь важнее цена.',
    },
    {
        role: 'fast',
        label: 'Для скорости',
        hint: 'Работает, только когда выше выбрано «Скорость».',
    },
    {
        role: 'precise',
        label: 'Для точности',
        hint: 'Работает, только когда выше выбрано «Точность».',
    },
];

export interface RouteSlotDraft {
    /** Транскрибатор или ROUTE_NOT_SET. */
    provider: string;
    model: string;
}

export interface TranscriptionRouteDraft {
    longMinSec: string;
    long: RouteSlotDraft;
    short: RouteSlotDraft;
    fast: RouteSlotDraft;
    precise: RouteSlotDraft;
    /** false — запасные как в режиме; true — свой список (пустой = без запасных). */
    customFallbacks: boolean;
    fallbacks: RouteSlotDraft[];
    priority: RoutePriority;
}

export const emptyRouteSlot = (): RouteSlotDraft => ({
    provider: ROUTE_NOT_SET,
    model: '',
});

const isProvider = (value: string): value is RouteProvider =>
    ROUTE_PROVIDER_OPTIONS.some(option => option.value === value);

const isPriority = (value: string | null | undefined): value is RoutePriority =>
    ROUTE_PRIORITY_OPTIONS.some(option => option.value === value);

/** У Яндекса модель не выбирается — поле модели не показываем. */
export const routeSlotHasModel = (provider: string): boolean =>
    isProvider(provider) && provider !== 'yandex';

const slotToDraft = (
    slot: AiTranscriptionSlotDto | null | undefined,
): RouteSlotDraft =>
    slot && isProvider(slot.provider)
        ? { provider: slot.provider, model: slot.model ?? '' }
        : emptyRouteSlot();

/** Сохранённый маршрут → черновик формы. */
export function routeToDraft(
    route: PortalTranscriptionRouteDto | null | undefined,
): TranscriptionRouteDraft {
    const priority = route?.priority;
    return {
        longMinSec: route?.longMinSec == null ? '' : String(route.longMinSec),
        long: slotToDraft(route?.long),
        short: slotToDraft(route?.short),
        fast: slotToDraft(route?.fast),
        precise: slotToDraft(route?.precise),
        customFallbacks: Array.isArray(route?.fallbacks),
        fallbacks: (route?.fallbacks ?? []).map(slotToDraft),
        priority: isPriority(priority) ? priority : 'normal',
    };
}

const draftToSlot = (slot: RouteSlotDraft): AiTranscriptionSlotDto | null => {
    if (!isProvider(slot.provider)) return null;
    const model = slot.model.trim();
    return {
        provider: slot.provider,
        model: routeSlotHasModel(slot.provider) && model ? model : null,
    };
};

const slotKey = (slot: AiTranscriptionSlotDto): string =>
    `${slot.provider}|${slot.model ?? ''}`;

/**
 * Черновик → тело запроса. Ничего не задано — `null` («как в режиме»).
 * Ошибка — русский текст вместо маршрута.
 */
export function draftToRoute(
    draft: TranscriptionRouteDraft,
): PortalTranscriptionRouteDto | null | string {
    let longMinSec: number | null = null;
    const rawSec = draft.longMinSec.trim();
    if (rawSec !== '') {
        const value = Number(rawSec);
        const { min, max } = ROUTE_LONG_MIN_SEC;
        if (!Number.isInteger(value) || value < min || value > max) {
            return `«Длинный звонок — от»: ожидается целое число секунд ${min}–${max}, получено «${rawSec}»`;
        }
        longMinSec = value;
    }
    const slots = [
        draft.long,
        draft.short,
        draft.fast,
        draft.precise,
        ...draft.fallbacks,
    ];
    const tooLong = slots.find(
        slot => slot.model.trim().length > ROUTE_MODEL_MAX_LENGTH,
    );
    if (tooLong) {
        return `Название модели длиннее ${ROUTE_MODEL_MAX_LENGTH} знаков: «${tooLong.model.trim().slice(0, 40)}…»`;
    }

    let fallbacks: AiTranscriptionSlotDto[] | null = null;
    if (draft.customFallbacks) {
        const seen = new Set<string>();
        fallbacks = [];
        for (const slot of draft.fallbacks.map(draftToSlot)) {
            if (!slot || seen.has(slotKey(slot))) continue;
            seen.add(slotKey(slot));
            fallbacks.push(slot);
        }
        if (fallbacks.length > ROUTE_MAX_FALLBACKS) {
            return `Запасных не больше ${ROUTE_MAX_FALLBACKS}`;
        }
    }

    const route: PortalTranscriptionRouteDto = {
        longMinSec,
        long: draftToSlot(draft.long),
        short: draftToSlot(draft.short),
        fallbacks,
        fast: draftToSlot(draft.fast),
        precise: draftToSlot(draft.precise),
        priority: draft.priority === 'normal' ? null : draft.priority,
    };
    const isEmpty =
        route.longMinSec === null &&
        route.long === null &&
        route.short === null &&
        route.fallbacks === null &&
        route.fast === null &&
        route.precise === null &&
        route.priority === null;
    return isEmpty ? null : route;
}
