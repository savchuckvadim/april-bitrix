import { describe, expect, it } from 'vitest';
import type { RootState } from '../../model/store';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { getDomainConfig } from '../../consts/domain-config';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import { buildAppDiagnostics, formatAppDiagnostics } from './app-diagnostics';

type StateOverrides = {
    questionnaireSource?: 'server' | 'fallback';
    questionnaireStatus?: 'idle' | 'loading' | 'ready' | 'error';
    configPortalKeys?: string[];
    taskGroupId?: number;
    bossId?: number;
    tasks?: number;
    prospectCode?: string | null;
    hasProspectField?: boolean;
    isChanged?: boolean;
    error?: string;
};

const makeState = (overrides: StateOverrides = {}): RootState => {
    const config = {
        ...getDomainConfig('april-dev.bitrix24.ru'),
        ...(overrides.taskGroupId ? { taskGroupId: overrides.taskGroupId } : {}),
        ...(overrides.bossId ? { bossId: overrides.bossId } : {}),
    };

    return {
        app: {
            domain: 'april-dev.bitrix24.ru',
            guard: null,
            error: {
                status: Boolean(overrides.error),
                message: overrides.error ?? '',
            },
            bitrix: {
                user: { ID: '55' },
                company: { ID: '101' },
                deal: { ID: '202' },
                lead: null,
                task: { id: 303 },
                from: APP_FROM_ENUM.COMPANY,
            },
            display: { mode: APP_DISPLAY_MODE.CALL_CARD },
            config,
            isConfigFetched: true,
            configPortalKeys: overrides.configPortalKeys ?? [],
        },
        questionnaireCatalog: {
            status: overrides.questionnaireStatus ?? 'error',
            domain: 'april-dev.bitrix24.ru',
            contract: 1,
            version: 0,
            hash: null,
            defs: FALLBACK_CATALOG,
            source: overrides.questionnaireSource ?? 'fallback',
        },
        eventTask: {
            tasks: Array.from({ length: overrides.tasks ?? 3 }, () => ({})),
            status: 'ready',
        },
        company: {
            color: {
                current:
                    overrides.prospectCode === null
                        ? null
                        : { code: overrides.prospectCode ?? 'green' },
                field: overrides.hasProspectField === false ? null : {},
                isChanged: overrides.isChanged ?? false,
            },
        },
    } as unknown as RootState;
};

describe('buildAppDiagnostics', () => {
    it('собирает контекст встройки и идентификаторы', () => {
        const diagnostics = buildAppDiagnostics(makeState());

        expect(diagnostics.domain).toBe('april-dev.bitrix24.ru');
        expect(diagnostics.display).toBe(APP_DISPLAY_MODE.CALL_CARD);
        expect(diagnostics.from).toBe(APP_FROM_ENUM.COMPANY);
        expect(diagnostics.userId).toBe(55);
        expect(diagnostics.companyId).toBe(101);
        expect(diagnostics.dealId).toBe(202);
        // Лида в контексте нет — это 0, а не NaN.
        expect(diagnostics.leadId).toBe(0);
        expect(diagnostics.taskId).toBe(303);
        expect(diagnostics.tasksCount).toBe(3);
    });

    it('различает источник настроек: хардкод по домену', () => {
        const diagnostics = buildAppDiagnostics(makeState());

        // april-dev: taskGroupId 9 из DOMAIN_OVERRIDES.
        expect(diagnostics.taskGroupId).toBe(9);
        expect(diagnostics.taskGroupIdSource).toBe('домен');
        expect(diagnostics.bossIdSource).toBe('домен');
    });

    it('различает источник настроек: портальные настройки', () => {
        const diagnostics = buildAppDiagnostics(
            makeState({ configPortalKeys: ['taskGroupId'], taskGroupId: 77 }),
        );

        expect(diagnostics.taskGroupId).toBe(77);
        expect(diagnostics.taskGroupIdSource).toBe('портал');
        // bossId портал не присылал — остаётся доменным.
        expect(diagnostics.bossIdSource).toBe('домен');
    });

    it('видит незаданный прогноз и отсутствие поля на портале', () => {
        const diagnostics = buildAppDiagnostics(
            makeState({ prospectCode: null, hasProspectField: false }),
        );

        expect(diagnostics.prospectCode).toBeNull();
        expect(diagnostics.prospectHasField).toBe(false);
        expect(diagnostics.prospectIsChanged).toBe(false);
    });
});

describe('formatAppDiagnostics', () => {
    it('печатает источник настроек и прогноз человекочитаемо', () => {
        const lines = formatAppDiagnostics(
            buildAppDiagnostics(
                makeState({
                    configPortalKeys: ['taskGroupId', 'bossId'],
                    taskGroupId: 107,
                    bossId: 2153,
                    prospectCode: 'green',
                    isChanged: true,
                }),
            ),
        );

        expect(lines).toContain('домен: april-dev.bitrix24.ru');
        expect(lines).toContain(
            'taskGroupId: 107 (портал), bossId: 2153 (портал), настройки получены: да',
        );
        expect(lines).toContain(
            'прогноз: green, поле на портале: есть, менялся: да',
        );
    });

    it('печатает, на каком составе анкет работает фрейм', () => {
        // Каталог не доехал — это норма (fallback), но она обязана быть
        // видна: иначе «анкеты не применились» не отличить от «состав тот же».
        const fallback = formatAppDiagnostics(buildAppDiagnostics(makeState()));
        expect(fallback).toContain(
            `анкеты: встроенный, наборов: ${FALLBACK_CATALOG.length} (каталог не получен)`,
        );

        const portal = formatAppDiagnostics(
            buildAppDiagnostics(
                makeState({
                    questionnaireSource: 'server',
                    questionnaireStatus: 'ready',
                }),
            ),
        );
        expect(portal).toContain(
            `анкеты: портал, наборов: ${FALLBACK_CATALOG.length} (каталог получен)`,
        );
    });

    it('провал инициализации попадает в ту же группу', () => {
        const lines = formatAppDiagnostics(
            buildAppDiagnostics(
                makeState({ error: 'Не найдена сущность контекста' }),
            ),
        );

        expect(lines[1]).toContain('ошибка: Не найдена сущность контекста');
    });
});
