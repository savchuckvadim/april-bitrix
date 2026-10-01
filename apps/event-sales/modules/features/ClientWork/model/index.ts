import type {
    ClientWorkDealDto,
    ClientWorkJoinRequestDto,
    ClientWorkRequestDto,
    ClientWorkResponseDto,
    JoinToMainResultDto,
    SalesHookOperationDto,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md): бэкенд
// переименует поле — правится только этот файл.
export type ClientWork = ClientWorkResponseDto;
export type ClientWorkDeal = ClientWorkDealDto;
export type ClientWorkRequest = ClientWorkRequestDto;
export type ClientWorkJoinRequest = ClientWorkJoinRequestDto;
export type ClientWorkJoinOperationResult = JoinToMainResultDto;
export type SalesHookOperation = SalesHookOperationDto;

/** Загрузка списка — панель рисует по статусу, а не по набору флагов. */
export type ClientWorkStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Присоединение: кнопка → подтверждение → операция → итог. */
export type ClientWorkJoinStatus =
    | 'idle'
    | 'armed'
    | 'joining'
    | 'done'
    | 'error';

/** Итог присоединения для человека. */
export interface ClientWorkJoinSummary {
    readonly mainDealId: number;
    /** Сколько сделок присоединено. */
    readonly joined: number;
    /** Пропущены (уже закрыты, чужая воронка…) — номера. */
    readonly skippedIds: number[];
    readonly tasksMoved: number;
    readonly activitiesMoved: number;
    readonly warnings: string[];
}
