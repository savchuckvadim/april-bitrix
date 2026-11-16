import type {
    CallPageHighlightDto,
    CallPageSegmentDto,
} from '@workspace/nest-kpi-report-sales-api';

export type {
    CallPageCallDto,
    CallPageCheckpointDto,
    CallPageDto,
    CallPageFactDto,
    CallPageHighlightDto,
    CallPageMethodologyDto,
    CallPageObjectionDto,
    CallPageScoreDto,
    CallPageSectionDto,
    CallPageSegmentDto,
} from '@workspace/nest-kpi-report-sales-api';

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
