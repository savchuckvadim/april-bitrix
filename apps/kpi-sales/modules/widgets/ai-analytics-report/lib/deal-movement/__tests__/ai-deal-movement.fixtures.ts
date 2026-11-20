import type {
    AiDealMovementDeal,
    AiDealMovementHonesty,
    AiDealMovementManagerStatuses,
    AiDealMovementMatrixBlock,
    AiDealMovementMatrixCell,
    AiDealMovementNight,
    AiDealMovementStatus,
    AiDealMovementStatusCell,
} from '@/modules/entities/ai-analytics';

/** Подписи статусов — как их отдаёт сервер. */
export const STATUS_TITLES: Record<AiDealMovementStatus, string> = {
    rolled_back: 'Вернулась назад',
    abandoned: 'Без внимания',
    stuck: 'Без продвижения',
    at_risk: 'Под риском',
    moving: 'Движется',
};

export const cell = (
    status: AiDealMovementStatus,
    count: number,
    amountSum: number | null = count * 100_000,
): AiDealMovementStatusCell => ({
    status,
    title: STATUS_TITLES[status],
    count,
    amountSum,
});

/** Пять ячеек отдела в порядке сервера. */
export const departmentCells = (): AiDealMovementStatusCell[] => [
    cell('rolled_back', 2),
    cell('abandoned', 5),
    cell('stuck', 7),
    cell('at_risk', 3),
    cell('moving', 40),
];

export const manager = (
    managerId: string,
    problemCount: number,
    problemAmountSum: number,
    managerName: string | null = `Менеджер ${managerId}`,
): AiDealMovementManagerStatuses => ({
    managerId,
    managerName,
    cells: departmentCells(),
    total: problemCount + 10,
    problemCount,
    problemAmountSum,
});

export const night = (
    day: string,
    department: AiDealMovementStatusCell[] | null,
): AiDealMovementNight => ({ day, form: department ? 2 : 1, department, managers: [] });

export const deal = (overrides: Partial<AiDealMovementDeal> = {}): AiDealMovementDeal => ({
    dealId: '9041',
    url: 'https://april.bitrix24.ru/crm/deal/details/9041/',
    title: 'ООО «Ромашка» — Гарант',
    managerId: '447',
    managerName: 'Иванова Анна',
    status: 'stuck',
    statusTitle: 'Без продвижения',
    amount: 150_000,
    stageTitle: 'Презентация',
    stageCode: 'sales_pres',
    daysInStage: 34,
    stageLimitDays: 21,
    stageLimitSource: 'history',
    reasons: 'в стадии 34 дня при пороге 21 день',
    since: '2026-11-16T09:00:00.000Z',
    ...overrides,
});

const matrixCell = (
    scoreBand: AiDealMovementMatrixCell['scoreBand'],
    progress: number,
    count: number,
): AiDealMovementMatrixCell => {
    const buyAnyway = scoreBand === 'low' && progress >= 4;
    return {
        scoreBand,
        progress,
        count,
        flag: buyAnyway ? 'buy_anyway' : null,
        flagTitle: buyAnyway ? 'клиент купил бы и без менеджера' : null,
    };
};

export const matrixBlock = (): AiDealMovementMatrixBlock => ({
    bands: [
        { code: 'low', title: 'Низкая оценка (1–4)', min: 1, max: 4.9 },
        { code: 'mid', title: 'Средняя оценка (5–7)', min: 5, max: 7.9 },
        { code: 'high', title: 'Высокая оценка (8–10)', min: 8, max: 10 },
    ],
    progressLevels: [1, 2, 3, 4, 5],
    noScore: 2,
    department: {
        n: 20,
        // Клетки без пары (mid × 5) нет — она должна стать нулём.
        cells: [
            matrixCell('low', 1, 4),
            matrixCell('low', 4, 3),
            matrixCell('mid', 2, 10),
            matrixCell('high', 5, 3),
        ],
        buyAnyway: 3,
        fewCalls: false,
        note: null,
    },
    managers: [
        {
            managerId: '447',
            managerName: 'Иванова Анна',
            n: 12,
            cells: [matrixCell('mid', 2, 12)],
            buyAnyway: 0,
            fewCalls: false,
            note: null,
        },
        {
            managerId: '512',
            managerName: null,
            n: 3,
            cells: [matrixCell('low', 4, 3)],
            buyAnyway: 3,
            fewCalls: true,
            note: 'мало звонков',
        },
    ],
});

export const honesty = (
    overrides: Partial<AiDealMovementHonesty> = {},
): AiDealMovementHonesty => ({
    highProgress: 40,
    checked: 30,
    still: 9,
    moved: 21,
    pending: 6,
    unchecked: 4,
    stillPct: 30,
    fewCalls: false,
    note: null,
    ...overrides,
});
