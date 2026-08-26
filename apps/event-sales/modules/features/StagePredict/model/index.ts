import type {
    StagePredictRequestDto,
    StagePredictResponseDto,
} from '@workspace/nest-event-sales-api';

/**
 * Доменные алиасы generated-типов предикта стадии основной воронки.
 * Лестница стадий живёт ТОЛЬКО на бэке (getSalesBaseTargetStageCode) —
 * фронтовый дубль уже расходился с реальностью; предикт — единственный
 * источник ответа «сменится ли стадия отправкой».
 */
export type StagePredictRequest = StagePredictRequestDto;
export type StagePredictResult = StagePredictResponseDto;
