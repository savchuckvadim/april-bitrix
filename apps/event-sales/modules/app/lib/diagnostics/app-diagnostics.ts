import type { RootState } from '../../model/store';
import type { AppGuard } from '../../model/slice/AppSlice';
import type { APP_DISPLAY_MODE } from '../../types/app/app-type';

/** Откуда взялось значение конфига: настройки портала или хардкод по домену. */
export type ConfigSource = 'портал' | 'домен';

export interface AppDiagnostics {
    domain: string;
    /** Режим встройки (display.mode). */
    display: APP_DISPLAY_MODE;
    /** Контекст сущности (company/deal/lead). */
    from: string;
    /** Полноэкранная заглушка вместо приложения, если включена. */
    guard: AppGuard | null;
    /** Текст ошибки инициализации; пусто — бут прошёл. */
    error: string;
    userId: number;
    companyId: number;
    dealId: number;
    leadId: number;
    taskId: number;
    taskGroupId: number;
    taskGroupIdSource: ConfigSource;
    bossId: number;
    bossIdSource: ConfigSource;
    isConfigFetched: boolean;
    tasksCount: number;
    /** Состояние загрузки списка дел — объясняет нулевой счётчик. */
    tasksStatus: string;
    /** Код текущего прогноза компании; null — не задан. */
    prospectCode: string | null;
    /** Поле прогноза найдено в слепке портала. */
    prospectHasField: boolean;
    /** Прогноз меняли в этой сессии (условие отправки withColorRequired). */
    prospectIsChanged: boolean;
}

const toId = (value: unknown): number => Number(value ?? 0) || 0;

const sourceOf = (
    portalKeys: string[],
    key: 'taskGroupId' | 'bossId',
): ConfigSource => (portalKeys.includes(key) ? 'портал' : 'домен');

/**
 * Снимок состояния приложения для консоли — ровно то, чем на проде
 * объясняются жалобы «ничего не работает».
 *
 * Чистая функция над стором: печать и подписка на инициализацию — снаружи
 * (print-app-diagnostics / app-diagnostics-listener). Данных клиента здесь
 * нет и быть не должно: только идентификаторы, режим и конфиг.
 */
export const buildAppDiagnostics = (state: RootState): AppDiagnostics => {
    const app = state.app;
    const color = state.company.color;

    return {
        domain: app.domain || '—',
        display: app.display.mode,
        from: app.bitrix.from ?? '—',
        guard: app.guard,
        error: app.error.status ? app.error.message : '',
        userId: toId(app.bitrix.user?.ID),
        companyId: toId(app.bitrix.company?.ID),
        dealId: toId(app.bitrix.deal?.ID),
        leadId: toId(app.bitrix.lead?.ID),
        taskId: toId(app.bitrix.task?.id),
        taskGroupId: app.config.taskGroupId,
        taskGroupIdSource: sourceOf(app.configPortalKeys, 'taskGroupId'),
        bossId: app.config.bossId,
        bossIdSource: sourceOf(app.configPortalKeys, 'bossId'),
        isConfigFetched: app.isConfigFetched,
        tasksCount: state.eventTask.tasks?.length ?? 0,
        tasksStatus: state.eventTask.status,
        prospectCode: color.current?.code ?? null,
        prospectHasField: Boolean(color.field),
        prospectIsChanged: color.isChanged,
    };
};

/**
 * Снимок → строки консоли. Формат отдельно от печати, чтобы его можно было
 * проверить тестом, а не глазами в проде.
 */
export const formatAppDiagnostics = (
    diagnostics: AppDiagnostics,
): string[] => [
    `домен: ${diagnostics.domain}`,
    `встройка: ${diagnostics.display}, from: ${diagnostics.from}${
        diagnostics.guard ? `, заглушка: ${diagnostics.guard}` : ''
    }${diagnostics.error ? `, ошибка: ${diagnostics.error}` : ''}`,
    `сущности: user ${diagnostics.userId}, company ${diagnostics.companyId}, deal ${diagnostics.dealId}, lead ${diagnostics.leadId}, task ${diagnostics.taskId}`,
    `taskGroupId: ${diagnostics.taskGroupId} (${diagnostics.taskGroupIdSource}), bossId: ${diagnostics.bossId} (${diagnostics.bossIdSource}), настройки получены: ${
        diagnostics.isConfigFetched ? 'да' : 'нет'
    }`,
    `дела: ${diagnostics.tasksCount} (${diagnostics.tasksStatus})`,
    `прогноз: ${diagnostics.prospectCode ?? 'не задан'}, поле на портале: ${
        diagnostics.prospectHasField ? 'есть' : 'нет'
    }, менялся: ${diagnostics.prospectIsChanged ? 'да' : 'нет'}`,
];
