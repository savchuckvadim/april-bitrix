import type {
    CallPageDto as CallPageResponseDto,
    CallPageFactDto as CallPageFactResponseDto,
    CallPageHighlightDto,
    CallPageSectionDto as CallPageSectionResponseDto,
    CallPageSegmentDto,
} from '@workspace/nest-kpi-report-sales-api';

export type {
    CallPageCallDto,
    CallPageCheckpointDto,
    CallPageHighlightDto,
    CallPageMethodologyDto,
    CallPageObjectionDto,
    CallPageScoreDto,
    CallPageSegmentDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Ссылка места разбора на подсветку в расшифровке. Поле необязательное:
 * старый сервер его не отдаёт — тогда кнопки «Показать в разговоре» нет.
 */
interface CallPageHighlightLink {
    highlightId?: string | null;
}

/** Строка «Итогов разговора»; у потребностей, показа, цены и шага — подсветка. */
export type CallPageFactDto = CallPageFactResponseDto & CallPageHighlightLink;

/** Раздел разбора; подсветка — найденная в расшифровке цитата «как было». */
export type CallPageSectionDto = CallPageSectionResponseDto &
    CallPageHighlightLink;

/** Ответ страницы звонка с полями, которых может не быть у старого сервера. */
export interface CallPageDto
    extends Omit<CallPageResponseDto, 'facts' | 'sections'> {
    facts: CallPageFactDto[];
    sections: CallPageSectionDto[];
    /** Подсветки разделов разбора: бейджами над расшифровкой не выводятся. */
    sectionHighlights?: CallPageHighlightDto[];
}

/** Окраска значения: good, bad, warn или neutral. */
export type CallPageTone = CallPageHighlightDto['tone'];

/** Вид подсветки: ошибка менеджера, возражение, риск, методика, сбой, цена. */
export type CallPageHighlightKind = CallPageHighlightDto['kind'];

/** Кто говорит в реплике: менеджер или клиент. */
export type CallPageSpeaker = NonNullable<CallPageSegmentDto['speaker']>;

/** Подсветки одного вида — один бейдж над расшифровкой. */
export interface CallPageHighlightGroup {
    kind: CallPageHighlightKind;
    title: string;
    /** Самая «тревожная» окраска среди подсветок группы. */
    tone: CallPageTone;
    items: CallPageHighlightDto[];
}

/** Что сейчас выделено в расшифровке: вид целиком или одна подсветка. */
export interface CallPageSelection {
    kind: CallPageHighlightKind | null;
    highlightId: string | null;
}

/** Ячейка сводки оценок под шапкой: общая оценка или оценка раздела. */
export interface CallPageScoreCell {
    key: string;
    title: string;
    score: number | null;
    /** Куда прокрутить по нажатию (id раздела на странице); null — некуда. */
    anchorId: string | null;
}
