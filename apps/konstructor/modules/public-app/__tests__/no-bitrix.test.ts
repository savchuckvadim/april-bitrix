import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Страж обещания «публичная версия ничего не знает о Битриксе»: обходит граф
 * рантайм-импортов от её входов. Импорт типов не считается, он стирается при
 * сборке. Заодно ищет чтение срезов, которых нет в публичном сторе: такой код
 * компилируется, потому что хуки типизированы полным RootState, и падает только
 * у человека с открытой ссылкой.
 */
const ROOT = path.resolve(__dirname, '../../..');

const ENTRIES = ['modules/public-app', 'app/p', 'app/api/public'];

const FORBIDDEN_PACKAGE =
    /^(@workspace\/(bitrix|bx|pbx|pbx-data|nest-api)|@bitrix)(\/|$)/;

const MISSING_SLICE =
    /(?:\bstate|getState\(\))\.(app|portal|deal|bxrq|snapshot|complectVariant|library|dealSend|offerDocument|contractDocument|supplyReport|appSettings|zakupki|serviceOffer|documentProvider|offer|offerTemplate\w*|wordTemplatePdfPreview)\b/;

const IMPORT =
    /(import|export)\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const stripComments = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const isTypeOnlyClause = (clause: string): boolean => {
    const named = clause.match(/^\{([\s\S]*)\}$/)?.[1];
    if (named === undefined) return false;
    const names = named
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);
    return names.length > 0 && names.every(name => name.startsWith('type '));
};

const runtimeImports = (source: string): string[] => {
    const found: string[] = [];
    for (const match of source.matchAll(IMPORT)) {
        const [, , typeKeyword, clause, fromSpec, bareSpec, dynamicSpec] = match;
        if (typeKeyword || isTypeOnlyClause(clause ?? '')) continue;
        const spec = fromSpec ?? bareSpec ?? dynamicSpec;
        if (spec) found.push(spec);
    }
    return found;
};

const resolveFile = (base: string): string | null => {
    for (const candidate of [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        path.join(base, 'index.ts'),
        path.join(base, 'index.tsx'),
    ]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
        }
    }
    return null;
};

const resolveImport = (from: string, spec: string): string | null => {
    if (spec.startsWith('@/')) return resolveFile(path.join(ROOT, spec.slice(2)));
    if (spec.startsWith('.')) return resolveFile(path.resolve(path.dirname(from), spec));
    return null;
};

const sourceFilesIn = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return entry.name === '__tests__' ? [] : sourceFilesIn(full);
        }
        return /\.tsx?$/.test(entry.name) ? [full] : [];
    });

const relative = (file: string): string =>
    path.relative(ROOT, file).split(path.sep).join('/');

interface Zone {
    files: Set<string>;
    forbidden: string[];
    missingSlices: string[];
}

const walkZone = (): Zone => {
    const cameFrom = new Map<string, string | null>();
    const queue = ENTRIES.flatMap(entry => sourceFilesIn(path.join(ROOT, entry)));
    for (const file of queue) cameFrom.set(file, null);

    const chainTo = (file: string): string => {
        const chain: string[] = [];
        for (let at: string | null | undefined = file; at; at = cameFrom.get(at)) {
            chain.unshift(relative(at));
        }
        return chain.join(' -> ');
    };

    const forbidden: string[] = [];
    const missingSlices: string[] = [];
    for (let index = 0; index < queue.length; index += 1) {
        const file = queue[index] as string;
        const source = stripComments(fs.readFileSync(file, 'utf8'));
        const slice = source.match(MISSING_SLICE)?.[0];
        if (slice) missingSlices.push(`${slice} <- ${chainTo(file)}`);
        for (const spec of runtimeImports(source)) {
            if (FORBIDDEN_PACKAGE.test(spec)) {
                forbidden.push(`${spec} <- ${chainTo(file)}`);
                continue;
            }
            const resolved = resolveImport(file, spec);
            if (resolved && !cameFrom.has(resolved)) {
                cameFrom.set(resolved, file);
                queue.push(resolved);
            }
        }
    }
    return { files: new Set(cameFrom.keys()), forbidden, missingSlices };
};

describe('публичная версия не знает о Битриксе', () => {
    const zone = walkZone();

    it('обход дошёл до экранов сборки: иначе проверять нечего', () => {
        const reached = [...zone.files].map(relative);
        expect(reached).toContain('modules/widgets/build-params/ui/BuildParamsScreen.tsx');
        expect(reached).toContain('modules/widgets/complect-builder/ui/ComplectBuilderScreen.tsx');
        expect(reached).toContain('modules/widgets/price-table/ui/PriceTableWidget.tsx');
        expect(reached).toContain('modules/entities/composition/index.ts');
    });

    it('ни один импорт не дотягивается до Битрикса и пакетов портала', () => {
        expect(zone.forbidden).toEqual([]);
    });

    it('никто не читает срезы, которых нет в публичном сторе', () => {
        expect(zone.missingSlices).toEqual([]);
    });
});
