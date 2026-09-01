#!/usr/bin/env node
/**
 * diff-back — контроль анти-дрейфа пакета @workspace/event-sales-flow.
 *
 * Сравнивает зеркальные файлы src/* с живым бэком и печатает постатейно:
 *   - идентичны;
 *   - отличаются только импортами/логгером (эвристика: после вырезания
 *     import-стейтментов и нормализации AppLogger→Logger содержимое
 *     совпадает — покрывает и многострочные import-блоки, чьи diff-строки
 *     начинаются с `import`/`} from`; сюда же входят санкционированные
 *     А2-замены обращений к транспорту — плоский call-домен и flush()
 *     порта FlowTransport ≡ доменные сервисы и батч-хвост бэкового
 *     BitrixService (карта — в шапке src/ports/flow-transport.port.ts),
 *     и jest→vitest в спеках: vi.fn/vi.spyOn ≡ jest.*);
 *   - DTO эквивалентны по полям (только src/dto/: после среза декораторов и
 *     комментариев и нормализации class→interface / implements→extends
 *     содержимое совпадает — санкционированный А0 перевод классов
 *     с class-validator/swagger в интерфейсы);
 *   - перенесены частично / адаптированы фейки (карта PARTIAL_PORTS:
 *     санкционированные вырезы серверных кейсов из спек и контракт-заглушки
 *     до А2, а также спеки А2 на фейках порта — кейсы 1:1);
 *   - адаптированы (пометка `// package-adapted: <причина>` в шапке файла:
 *     санкционированный срез серверных кусков из зеркала; пометка НЕ верится
 *     на слово — скрипт проверяет, что строки пакета остаются УПОРЯДОЧЕННЫМ
 *     ПОДМНОЖЕСТВОМ строк донора, иначе файл честно падает в
 *     «содержательно», а лишняя пометка на неизменённом файле — в замечание);
 *   - отличаются содержательно (всё остальное — проверь осознанность);
 *   - есть только в пакете (швы: ports/, version, index, batch, bitrix-типы);
 *   - бэковый донор пропал (дрейф!);
 *   - есть на бэке, но ещё не перенесены (сервисы приезжают в А1/А2).
 *
 * Режим CI — warning: код выхода всегда 0.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BACK_ROOT = resolve(PKG_ROOT, '../../../back');
const EVENT_REPORT = 'apps/event-sales/src/event-report';

/** Каталоги пакета, зеркалящие каталоги бэка (префикс → префикс). */
const MIRROR_DIRS = [
    ['src/types', `${EVENT_REPORT}/types`],
    ['src/dto', `${EVENT_REPORT}/dto`],
    ['src/services', `${EVENT_REPORT}/services`],
    ['src/use-cases', `${EVENT_REPORT}/use-cases`],
    ['src/constants', `${EVENT_REPORT}/constants`],
    // shared зеркалит app-шаред бэка (questionnaire-answers и т.п.)
    ['src/shared', 'apps/event-sales/src/shared'],
    // спеки event-report (jest→vitest: разница — только import из 'vitest')
    ['src/__tests__', `${EVENT_REPORT}/__tests__`],
    // соседние app-модули, чьи ЧИСТЫЕ доноры нужны post-flow билдерам
    ['src/zpr-flow', 'apps/event-sales/src/zpr-flow'],
    ['src/presentation-flow', 'apps/event-sales/src/presentation-flow'],
    ['src/sales-hooks', 'apps/event-sales/src/sales-hooks'],
];

/** Точечные зеркала: файлы, чей бэковый дом — вне event-report. */
const FILE_OVERRIDES = new Map([
    ['src/types/pbx-sales-event-field.type.ts',
        'libs/portal-lib/pbx/domain/src/field/type/sales/event/pbx-sales-event-field.type.ts'],
    ['src/shared/lib/pbx-field-type.util.ts',
        'libs/portal-lib/pbx/domain/src/field/type/pbx-field-type.util.ts'],
    ['src/shared/pbx-sales-kpi-list/type/pbx-sales-kpi-list-field.type.ts',
        'libs/portal-lib/pbx/pbx-sales-kpi-list/type/pbx-sales-kpi-list-field.type.ts'],
    ['src/shared/pbx-lead-request/type/pbx-lead-request.enum.ts',
        'libs/portal-lib/pbx/pbx-lead-request/type/pbx-lead-request.enum.ts'],
    ['src/shared/lib/contract-months.ts', 'libs/shared/src/lib/date/contract-months.ts'],
    ['src/shared/lib/parse-portal-input.ts', 'libs/shared/src/lib/date/parse-portal-input.ts'],
    ['src/shared/lib/timezone.ts', 'libs/shared/src/lib/date/timezone.ts'],
    ['src/shared/lib/to-crm-datetime.ts', 'libs/shared/src/lib/date/to-crm-datetime.ts'],
    ['src/shared/lib/to-ru-human.ts', 'libs/shared/src/lib/date/to-ru-human.ts'],
    ['src/shared/lib/to-task-deadline.ts', 'libs/shared/src/lib/date/to-task-deadline.ts'],
    ['src/shared/utils/date-convert.util.ts', 'libs/shared/src/lib/utils/date-convert.util.ts'],
    // --- доноры группы А1b (KPI/история/лид/задачи/анкеты) ---
    ['src/shared/event-type-registry/event-type-registry.ts',
        'libs/portal-lib/pbx/event-type-registry/event-type-registry.ts'],
    ['src/shared/questionnaires/portal-questionnaires.schema.ts',
        'libs/portal-lib/store/questionnaires/portal-questionnaires.schema.ts'],
    ['src/shared/pbx-presentation-smart/type/pbx-presentation-smart.type.ts',
        'libs/portal-lib/pbx/pbx-presentation-smart/type/pbx-presentation-smart.type.ts'],
    ['src/shared/pbx-zpr-smart/type/pbx-zpr-smart.type.ts',
        'libs/portal-lib/pbx/pbx-zpr-smart/type/pbx-zpr-smart.type.ts'],
    ['src/shared/pbx-duplicate/type/duplicate.type.ts',
        'libs/portal-lib/pbx/duplicate/src/type/duplicate.type.ts'],
    ['src/shared/pbx-duplicate/lib/normalize.util.ts',
        'libs/portal-lib/pbx/duplicate/src/lib/normalize.util.ts'],
    // --- доноры группы А1a (контекст/entity/deal/дата-библиотека) ---
    ['src/shared/lib/date/bitrix-datetime.ts', 'libs/shared/src/lib/date/bitrix-datetime.ts'],
    ['src/shared/lib/date/pbx-datetime.ts', 'libs/portal-lib/pbx/domain/src/date/pbx-datetime.ts'],
    ['src/shared/batch/batch-text.ts', 'libs/bitrix/src/consts/batch.consts.ts'],
    ['src/shared/batch/__tests__/batch-text.spec.ts',
        'libs/bitrix/src/consts/__tests__/batch.consts.spec.ts'],
    ['src/types/pbx-deal-sales-base-stages.const.ts',
        'libs/portal-lib/pbx/domain/src/portal-deal/sales/base/const/pbx-deal-sales-base-stages.const.ts'],
    ['src/types/pbx-deal-sales-xo.type.ts',
        'libs/portal-lib/pbx/domain/src/portal-deal/sales/xo/type/pbx-deal-sales-xo.type.ts'],
    ['src/types/pbx-deal-sales-presentation.type.ts',
        'libs/portal-lib/pbx/domain/src/portal-deal/sales/presentation/type/pbx-deal-sales-presentation.type.ts'],
    ['src/types/pbx-deal-sales-tmc.type.ts',
        'libs/portal-lib/pbx/domain/src/portal-deal/sales/tmc/type/pbx-deal-sales-tmc.type.ts'],
    // --- доноры группы А2 (адаптация I/O-сервисов) ---
    ['src/types/portal-deal.type.ts',
        'libs/portal-lib/portal/src/services/types/deals/portal.deal.type.ts'],
    ['src/shared/portal-fields/crm-ref-format.util.ts',
        'libs/bitrix/src/domain/crm/utils/crm-ref-format.util.ts'],
    ['src/shared/tasks/task-crm-binding.util.ts',
        'libs/bitrix/src/domain/tasks/task/lib/task-crm-binding.util.ts'],
    // раскол init по плану А2: обе половины сверяются с единым донором
    ['src/services/init/load-context.query.ts',
        'apps/event-sales/src/event-report/services/init/event-report-init.service.ts'],
    ['src/services/init/resolve-context.ts',
        'apps/event-sales/src/event-report/services/init/event-report-init.service.ts'],
    // исполнитель А2: имя отражает форму (функция executeEventReportFlow),
    // донор — бэковый класс-оркестратор
    ['src/use-cases/execute-event-report.use-case.ts',
        'apps/event-sales/src/event-report/use-cases/event-report.use-case.ts'],
]);

/** Файлы/каталоги, живущие ТОЛЬКО в пакете (швы и адаптация) — дрейфом не считаются. */
const PACKAGE_ONLY_PREFIXES = [
    'src/ports/',
    'src/adapters/',  // браузерные реализации портов (А2) — бэковых доноров нет

    'src/index.ts',
    'src/version.ts',
    'src/shared/lib/logger.ts',        // AppLogger — замена @nestjs Logger
    'src/shared/lib/date/index.ts',    // сборный index дата-библиотеки (шов А1a: +pbx-datetime)
    'src/shared/batch/batch-group-buffer.ts', // переработка cold-hook-буфера по плану А2: замыкания, чанки целых групп, result_error, гигиена cmdBatch
    'src/shared/batch/__tests__/batch-group-buffer.spec.ts', // спека переработанного буфера (пакетная, бэкового донора нет)
    // пакетные спеки состава команд адаптированных I/O-сервисов (А2) — доноров нет
    'src/services/init/__tests__/',
    'src/services/deal/__tests__/',
    'src/services/entity/__tests__/',
    // спека досылки исполнителя + dry-run-транспорт golden-сверки (А2) — доноров нет
    'src/use-cases/__tests__/',
    // локальные структурные копии типов back/libs/bitrix — поимённо:
    // prepare-batch-results.util рядом с ними ЗЕРКАЛИТ app-шаред бэка и
    // обязан оставаться под контролем дрейфа (catch-all каталога снят)
    'src/shared/bitrix/bitrix.interface.ts',
    'src/shared/bitrix/bx-lead.interface.ts',
    'src/shared/bitrix/checklist-item.interface.ts',
    'src/shared/bitrix/list-item.interface.ts',
    'src/types/bitrix-entities.type.ts', // реэкспорт shared/bitrix для зеркал services/*
    // шимы-обрезки бэковых index'ов либ (чистая часть, серверное отрезано)
    'src/shared/pbx-duplicate/index.ts',
    'src/shared/questionnaires/index.ts',
    'src/shared/pbx-presentation-smart/index.ts',
    'src/shared/pbx-zpr-smart/index.ts',
    'src/shared/smart-item-fields/',   // чистая голова service-файла + index (класс отрезан)
    'src/shared/const-smart-registry/', // шим ConstSmartKind (полный реестр тянет install-описатели)
];

/**
 * Санкционированные ЧАСТИЧНЫЕ/АДАПТИРОВАННЫЕ переносы: файл живёт зеркалом,
 * но серверные куски вырезаны до А2 либо (спеки А2) фейк битрикса построен
 * по форме порта FlowTransport / jest.Mock-типы переведены на vitest —
 * причина в значении, кейсы и ассерты остаются 1:1. Классифицируются
 * обычным порядком; попадают в свой раздел, только если действительно
 * отличаются, — запись, переставшая отличаться, помечается устаревшей.
 */
const PARTIAL_PORTS = new Map([
    ['src/__tests__/event-report-not-ca.spec.ts',
        'вырезан describe гарда assertEventFlowDtoValid (flow-guard — А2)'],
    ['src/__tests__/event-report-refine-type.spec.ts',
        'class-validator-кейсы DTO сведены к контракту кодов; кейс TaskFlowService — А2'],
    ['src/__tests__/event-report-request-event-types.spec.ts',
        'вырезаны class-validator-кейсы, кейсы TaskFlowService и таймлайн EntityHistoryService (А2)'],
    // --- раскол init по плану А2 (донор всех трёх — event-report-init.service) ---
    ['src/services/init/event-report-init.service.ts',
        'фасад раскола: остаётся класс с бэковой сигнатурой loadContext (постановка чтений → flush → resolveInitContext)'],
    ['src/services/init/load-context.query.ts',
        'I/O-половина раскола: queueInitReads/fetchOwnerDeal/queueActiveDealsLoad — строки loadContext до отправки батча, this.-вызовы стали функциями'],
    ['src/services/init/resolve-context.ts',
        'чистая половина раскола: приватные методы резолва стали функциями (+resolveInitContext — фазы 2–3 loadContext), тела построчно донорские'],
    ['src/__tests__/event-report-resolve-entity.spec.ts',
        'хелперы-касты приватных методов сведены к прямым вызовам функций resolve-context; кейсы и ассерты 1:1'],
    // --- спеки А2 на фейках порта (кейсы/ассерты 1:1 с бэком) ---
    ['src/__tests__/event-report-task-checklist.spec.ts',
        'фейк битрикса — порт FlowTransport: call.checklistItemGetList вместо checklistItem.getList'],
    ['src/__tests__/event-report-task-transfer.spec.ts',
        'фейк битрикса — порт FlowTransport: call.imNotifySystemAdd вместо imNotify.systemAdd'],
    ['src/__tests__/event-report-lead-request-sync.spec.ts',
        'фейк битрикса — порт FlowTransport: flush() вместо api.callBatchWithConcurrency(1)'],
    ['src/shared/kpi-list-flow/__tests__/kpi-list-flow-dedup.spec.ts',
        'фейк битрикса — порт FlowTransport: call.listItemGet вместо listItem.get'],
    ['src/shared/kpi-list-flow/services/kpi-list-flow.service.spec.ts',
        'jest.Mock-типы переведены на vitest Mock (сигнатуры-generics)'],
    ['src/__tests__/event-report-survey-payload.spec.ts',
        'jest→vitest: spy логгера записан в две строки (`vi` отдельной строкой — нормализация ловит только однострочное «vi.spyOn»); фейки, кейсы и ассерты 1:1'],
    // --- исполнитель А2 и его golden-стык ---
    ['src/use-cases/execute-event-report.use-case.ts',
        'порт use-case минус серверное: pbx.init/appSettings → порты и FlowSettings параметрами, postFlow.dispatch → сборка deferred[] (side-flow с addedTaskId), Redis/WS/socketId — долой; порядок оркестрации и комментарии бэка сохранены'],
    ['src/__tests__/event-report-use-case-batch-seam.spec.ts',
        'golden-порт стыка: use-case-функция + dry-run-транспорт порта FlowTransport (flush ≡ callBatchWithConcurrency(1)), «координатор» — deferred[]; jest.mock → vi.mock, init-сервис тоже замокан (в пакете создаётся внутри); кейсы и ассерты стыка 1:1'],
]);

const norm = p => p.split(sep).join('/');

function walk(dir) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (name.endsWith('.ts')) out.push(full);
    }
    return out;
}

const readNorm = file => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

/** Вырезает import-стейтменты (включая многострочные блоки `import {\n...\n} from '...'`). */
function stripImports(text) {
    const lines = text.split('\n');
    const out = [];
    let inImport = false;
    for (const raw of lines) {
        const t = raw.trim();
        if (!inImport && /^import\b/.test(t)) {
            const closed =
                /from\s+['"][^'"]+['"];?\s*$/.test(t) || /^import\s+['"][^'"]+['"];?\s*$/.test(t);
            if (!closed) inImport = true;
            continue;
        }
        if (inImport) {
            if (/from\s+['"][^'"]+['"];?\s*$/.test(t)) inImport = false;
            continue;
        }
        out.push(raw.replace(/\s+$/, ''));
    }
    return (
        out
            .join('\n')
            // санкционированная замена логгера: AppLogger пакета ≡ @nestjs Logger
            .replace(/\bnew AppLogger\(/g, 'new Logger(')
            // санкционированные порт-замены А2: плоский call-домен и flush()
            // порта FlowTransport ≡ доменные сервисы / батч-хвост бэкового
            // BitrixService (карта соответствий — шапка flow-transport.port.ts);
            // замены строго с бэковой стороны не встречаются — no-op на доноре
            .replace(/\bthis\.bitrix\.call\.dealGet\(/g, 'this.bitrix.deal.get(')
            .replace(/\bthis\.bitrix\.call\.dealGetList\(/g, 'this.bitrix.deal.getList(')
            .replace(/\bthis\.bitrix\.call\.checklistItemGetList\(/g, 'this.bitrix.checklistItem.getList(')
            .replace(/\bthis\.bitrix\.call\.imNotifySystemAdd\(/g, 'this.bitrix.imNotify.systemAdd(')
            .replace(/\bthis\.bitrix\.call\.listItemGet\(/g, 'this.bitrix.listItem.get(')
            .replace(/\bthis\.bitrix\.call\.leadGetFieldsList\(/g, 'this.bitrix.lead.getFieldsList(')
            .replace(/\bthis\.bitrix\.flush\(\)/g, 'this.bitrix.api.callBatchWithConcurrency(1)')
            // jest→vitest в спеках: vi.* ≡ jest.* (vitest-глобалы пакета)
            .replace(/\bvi\.fn\b/g, 'jest.fn')
            .replace(/\bvi\.spyOn\b/g, 'jest.spyOn')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    );
}

/** Пометка санкционированной адаптации: '// package-adapted: <причина>'. */
const ADAPTED_RE = /^\/\/ package-adapted: (.+)$/;

/** Причина из пометки package-adapted; null — файл не помечен. */
function adaptedReason(text) {
    for (const line of text.split('\n')) {
        const m = ADAPTED_RE.exec(line.trim());
        if (m) return m[1];
    }
    return null;
}

/** Срезает строки-пометки package-adapted (сама пометка — не контент зеркала). */
function stripAdaptedMarks(text) {
    return text
        .split('\n')
        .filter(line => !ADAPTED_RE.test(line.trim()))
        .join('\n');
}

/**
 * Проверка пометки package-adapted: непустые строки пакета (после среза
 * импортов, пометок и нормализации логгера) обязаны идти УПОРЯДОЧЕННЫМ
 * ПОДМНОЖЕСТВОМ строк донора. Любая строка, которой нет в доноре (или не в
 * том порядке), — дрейф: пометка не подтверждается, ложного «зелёного» нет.
 */
function isOrderedSubsetOfBack(pkgText, backText) {
    const lines = text =>
        stripImports(stripAdaptedMarks(text))
            .split('\n')
            .filter(line => line.trim() !== '');
    const pkg = lines(pkgText);
    const back = lines(backText);
    let j = 0;
    for (const line of pkg) {
        while (j < back.length && back[j] !== line) j++;
        if (j >= back.length) return false;
        j++;
    }
    return true;
}

/**
 * Срезает комментарии (//, /* *​/) со знанием строковых литералов ('' "" ``),
 * чтобы `https://…` внутри строки не принялся за line-comment.
 */
function stripComments(text) {
    let out = '';
    let state = 'code'; // code | line | block | sq | dq | tpl
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];
        if (state === 'code') {
            if (ch === '/' && next === '/') { state = 'line'; i++; continue; }
            if (ch === '/' && next === '*') { state = 'block'; i++; continue; }
            if (ch === "'") state = 'sq';
            else if (ch === '"') state = 'dq';
            else if (ch === '`') state = 'tpl';
            out += ch;
            continue;
        }
        if (state === 'line') { if (ch === '\n') { state = 'code'; out += ch; } continue; }
        if (state === 'block') { if (ch === '*' && next === '/') { state = 'code'; i++; } continue; }
        // строки: следим за экранированием и закрывающей кавычкой
        out += ch;
        if (ch === '\\') { out += next ?? ''; i++; continue; }
        if ((state === 'sq' && ch === "'") || (state === 'dq' && ch === '"') || (state === 'tpl' && ch === '`')) {
            state = 'code';
        }
    }
    return out;
}

/**
 * Срезает декораторы `@Name` / `@Name(…)` (аргументы — с балансом скобок и
 * знанием строк: `@Type(() => Number)`, многострочный `@ApiProperty({…})`).
 * Ошибка баланса деградирует в «не срезалось» → файл честно уйдёт в
 * «отличаются содержательно», ложной эквивалентности не бывает.
 */
function stripDecorators(text) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const prev = i > 0 ? text[i - 1] : '\n';
        if (ch === '@' && /[\s(,]/.test(prev) && /[A-Za-z_]/.test(text[i + 1] ?? '')) {
            let j = i + 1;
            while (j < text.length && /[A-Za-z0-9_.]/.test(text[j])) j++;
            // необязательные аргументы декоратора
            let k = j;
            while (k < text.length && /\s/.test(text[k])) k++;
            if (text[k] === '(') {
                let depth = 0;
                let str = null; // ' | " | `
                for (; k < text.length; k++) {
                    const c = text[k];
                    if (str) {
                        if (c === '\\') { k++; continue; }
                        if (c === str) str = null;
                        continue;
                    }
                    if (c === "'" || c === '"' || c === '`') { str = c; continue; }
                    if (c === '(') depth++;
                    else if (c === ')') { depth--; if (depth === 0) { k++; break; } }
                }
                j = k;
            }
            i = j - 1; // пропускаем весь декоратор
            continue;
        }
        out += ch;
    }
    return out;
}

/**
 * Нормализация санкционированного А0-перевода DTO: класс с декораторами →
 * интерфейс. Сравниваются «поле-в-поле» тела после среза import'ов,
 * декораторов и комментариев (описания @ApiProperty переехали в JSDoc —
 * текстом они не совпадают, поэтому комментарии режутся с обеих сторон).
 */
function dtoNormalize(text) {
    return stripImports(stripDecorators(stripComments(text)))
        .replace(/^(\s*)export class (\w+) implements (\w+) \{/gm, '$1export interface $2 extends $3 {')
        .replace(/^(\s*)export class (\w+)\b/gm, '$1export interface $2')
        .replace(/!:/g, ':')
        .split('\n')
        .map(line => line.replace(/\s+$/, ''))
        .filter(line => line !== '')
        .join('\n');
}

function classify(pkgFile, backFile, rel) {
    // пометка package-adapted — служебная строка пакета, не контент зеркала
    const a = stripAdaptedMarks(readNorm(pkgFile));
    const b = readNorm(backFile);
    if (a === b) return 'identical';
    if (stripImports(a) === stripImports(b)) return 'importsOnly';
    if (rel.startsWith('src/dto/') && dtoNormalize(a) === dtoNormalize(b)) {
        return 'dtoEquivalent';
    }
    return 'different';
}

function backPathFor(rel) {
    if (FILE_OVERRIDES.has(rel)) return FILE_OVERRIDES.get(rel);
    for (const [front, back] of MIRROR_DIRS) {
        if (rel.startsWith(front + '/')) return back + rel.slice(front.length);
    }
    return null;
}

const buckets = {
    identical: [], importsOnly: [], dtoEquivalent: [], partial: [], adapted: [],
    different: [], packageOnly: [], missingBack: [], notPorted: [],
};

const pkgFiles = walk(join(PKG_ROOT, 'src'))
    .map(f => norm(relative(PKG_ROOT, f)))
    .sort();

for (const rel of pkgFiles) {
    if (PACKAGE_ONLY_PREFIXES.some(p => rel === p || rel.startsWith(p))) {
        buckets.packageOnly.push(rel);
        continue;
    }
    const backRel = backPathFor(rel);
    const backFile = backRel ? join(BACK_ROOT, backRel) : null;
    if (!backFile || !existsSync(backFile)) {
        buckets.missingBack.push(`${rel}  (ожидался ${backRel ?? '<нет зеркала>'})`);
        continue;
    }
    const verdict = classify(join(PKG_ROOT, rel), backFile, rel);
    if (PARTIAL_PORTS.has(rel)) {
        if (verdict === 'different') {
            buckets.partial.push(`${rel}  ←  ${backRel}\n      причина: ${PARTIAL_PORTS.get(rel)}`);
        } else {
            buckets[verdict].push(`${rel}  ←  ${backRel}  (запись PARTIAL_PORTS устарела — удали её)`);
        }
        continue;
    }
    const reason = adaptedReason(readNorm(join(PKG_ROOT, rel)));
    if (reason !== null) {
        if (verdict !== 'different') {
            buckets[verdict].push(
                `${rel}  ←  ${backRel}  (пометка package-adapted лишняя — файл прошёл штатную проверку; удали её)`,
            );
        } else if (
            isOrderedSubsetOfBack(
                readNorm(join(PKG_ROOT, rel)),
                readNorm(backFile),
            )
        ) {
            buckets.adapted.push(
                `${rel}  ←  ${backRel}\n      причина: ${reason}`,
            );
        } else {
            buckets.different.push(
                `${rel}  ←  ${backRel}  (пометка package-adapted НЕ ПОДТВЕРДИЛАСЬ: строки пакета — не подмножество донора, это ДРЕЙФ)`,
            );
        }
        continue;
    }
    buckets[verdict].push(`${rel}  ←  ${backRel}`);
}

// Обратная сторона: файлы event-report, которых в пакете ещё нет.
const portedBackRels = new Set(
    pkgFiles.map(backPathFor).filter(Boolean),
);
const backFiles = walk(join(BACK_ROOT, EVENT_REPORT))
    .map(f => norm(relative(BACK_ROOT, f)))
    .filter(rel => !rel.includes('/__tests__/') && !rel.endsWith('.spec.ts'))
    .sort();
for (const rel of backFiles) {
    if (!portedBackRels.has(rel)) buckets.notPorted.push(rel);
}

const print = (title, list) => {
    console.log(`\n${title} (${list.length})`);
    for (const item of list) console.log(`  ${item}`);
};

console.log(`diff-back: ${norm(relative(BACK_ROOT, join(BACK_ROOT, EVENT_REPORT)))} + доноры libs/*  ⇄  packages/event-sales-flow/src`);
print('== идентичны ==', buckets.identical);
print('== отличаются только импортами/логгером ==', buckets.importsOnly);
print('== DTO эквивалентны по полям (класс→интерфейс, санкционировано А0) ==', buckets.dtoEquivalent);
print('== перенесены частично / адаптированы фейки (санкционировано, PARTIAL_PORTS) ==', buckets.partial);
print('== адаптированы (package-adapted: подмножество донора, проверено) ==', buckets.adapted);
print('== отличаются содержательно (проверь осознанность!) ==', buckets.different);
print('== только в пакете (швы/адаптация) ==', buckets.packageOnly);
print('== бэковый донор не найден (ДРЕЙФ!) ==', buckets.missingBack);
print('== на бэке, ещё не перенесены (план А1/А2) ==', buckets.notPorted);
console.log('\n(warning-режим: код выхода всегда 0)');
process.exit(0);
