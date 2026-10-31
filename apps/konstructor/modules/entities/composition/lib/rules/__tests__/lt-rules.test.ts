import { describe, expect, it } from 'vitest';
import liveInit from '../../../../catalog/lib/__fixtures__/init-v2.live.json';
import { catalogFromInitV2, type InitV2Data } from '../../../../catalog';
import { defaultComposition, type Composition, type CompositionCtx } from '../../../model/types';
import { applyAction } from '../../apply';
import { describeLtPackets, ltFreeLimit, ltPacketHint } from '../lt';

/**
 * Legal Tech на срезе настоящего init: на фикстуре oldinit сервисы и веса были,
 * поэтому тесты не видели, что на живых данных LT не работает. Сценарии — ветки
 * легаси fillingLt плюс решения владельца (лимит из админки, вес 4 только сервису).
 */
const catalog = catalogFromInitV2(liveInit as unknown as InitV2Data);

const ctx = (code: string, extra: Partial<CompositionCtx> = {}): CompositionCtx => ({
    complect: catalog.complects.byCode[code]!,
    catalog,
    ...extra,
});
const start = (code: string, patch: Partial<Composition> = {}): Composition => ({
    ...defaultComposition(catalog.complects.byCode[code]!),
    ...patch,
});
const toggle = (composition: Composition, code: string, checked: boolean, context: CompositionCtx) =>
    applyAction(composition, { kind: 'toggleLt', code, checked }, context);
const codes = (violations: Array<{ code: string }>) => violations.map(item => item.code);

describe('LT: данные init', () => {
    it('сервисы приходят с весом: пакет складывается из них', () => {
        const weights = Object.fromEntries(catalog.services.lt.map(item => [item.code, item.weight]));
        expect(catalog.services.lt.length).toBeGreaterThanOrEqual(18);
        expect(catalog.services.lt.every(item => item.weight > 0)).toBe(true);
        expect(weights).toMatchObject({
            ltsemi: 1,
            ltcheckdocprem: 2,
            iscra: 2,
            iscra_special: 2,
            ex_signature: 1,
            ltdigitjobsec: 1,
        });
    });

    it.each([
        ['buh', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['buhgos', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['ur', ['ltconstructor', 'ltsut'], 2, 'ltpackSmall'],
        ['expert', ['ltconstructor', 'ltdisk'], 2, 'ltpackSmall'],
        ['office', ['ltsemi', 'ltconstructor', 'ltsut', 'ltexcontragent', 'ltcheckdoc'], 5, 'ltpackMedium'],
        ['exzak', ['ltsemi', 'ltconstructor', 'ltexcontragent', 'lttender', 'ltcheckdoc'], 5, 'ltpackMedium'],
        ['glavbuh', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['glavbuhgos', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['company', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['companyPro', ['ltsemi', 'ltconstructor'], 2, 'ltpackSmall'],
        ['exbuild', ['ltcheckdocprem'], 2, 'ltpackSmall'],
    ])('%s: бесплатный LT по умолчанию и пакет по весу', (code, lt, limit, packageCode) => {
        const composition = start(code);
        expect(composition.lt).toEqual(lt);
        expect(composition.ltInPacket).toEqual([]);
        expect(ltFreeLimit(catalog.complects.byCode[code]!, catalog)).toBe(limit);

        const [included, ...rest] = describeLtPackets(composition, ctx(code));
        expect(included).toMatchObject({ kind: 'included', status: 'ok', isProduct: false });
        expect(included!.package?.code).toBe(packageCode);
        expect(rest).toEqual([]);
    });

    it('Охрана труда: оба сервиса платно, малый пакет сразу товаром', () => {
        const composition = start('exjobsec');
        expect(composition.lt).toEqual([]);
        expect(composition.ltInPacket).toEqual(['ltsemi', 'ltdigitjobsec']);
        const packets = describeLtPackets(composition, ctx('exjobsec'));
        expect(packets).toHaveLength(1);
        expect(packets[0]).toMatchObject({ kind: 'paid', status: 'ok', isProduct: true });
        expect(packets[0]!.package?.code).toBe('ltpackSmall');
    });

    it('универсальные: LT по умолчанию нет, лимит 0', () => {
        const composition = start('maximum');
        expect(composition.lt).toEqual([]);
        expect(composition.ltInPacket).toEqual([]);
        expect(describeLtPackets(composition, ctx('maximum'))).toEqual([]);
    });
});

describe('LT: раскладка галочек', () => {
    it('сверх лимита — в платный, товара нет, пока вес не собран', () => {
        const third = toggle(start('buh'), 'ltdisk', true, ctx('buh'));
        expect(third.composition.ltInPacket).toEqual(['ltdisk']);
        expect(third.autoFixes).toHaveLength(1);
        expect(codes(third.violations)).toContain('lt/invalid-packet-weight');
        expect(describeLtPackets(third.composition, ctx('buh'))[1]).toMatchObject({
            status: 'incomplete',
            isProduct: false,
        });

        const fourth = toggle(third.composition, 'lttender', true, ctx('buh'));
        const paid = describeLtPackets(fourth.composition, ctx('buh'))[1]!;
        expect(paid).toMatchObject({ status: 'ok', isProduct: true });
        expect(paid.package?.code).toBe('ltpackSmall');
    });

    it('снять бесплатный можно: место свободно, новый сервис занимает его (замена)', () => {
        const removed = toggle(start('buh'), 'ltsemi', false, ctx('buh'));
        expect(removed.composition.lt).toEqual(['ltconstructor']);
        expect(codes(removed.violations)).toContain('lt/free-under-limit');
        expect(removed.violations.every(item => item.level === 'warning')).toBe(true);

        const replaced = toggle(removed.composition, 'ltdisk', true, ctx('buh'));
        expect(replaced.composition.lt).toEqual(['ltconstructor', 'ltdisk']);
        expect(replaced.composition.ltInPacket).toEqual([]);
        expect(codes(replaced.violations)).not.toContain('lt/free-under-limit');
    });

    it('снятый бесплатный заменяется ПОСЛЕДНИМ платным (легаси)', () => {
        const composition = start('office', { ltInPacket: ['ltdisk', 'lttender', 'ltbusiness'] });
        const result = toggle(composition, 'ltsut', false, ctx('office'));
        expect(result.composition.lt).toContain('ltbusiness');
        expect(result.composition.ltInPacket).toEqual(['ltdisk', 'lttender']);
        expect(result.autoFixes).toHaveLength(1);
    });

    it('снятие платного бесплатные не трогает', () => {
        const composition = start('buh', { ltInPacket: ['ltdisk', 'lttender'] });
        const result = toggle(composition, 'ltdisk', false, ctx('buh'));
        expect(result.composition.lt).toEqual(composition.lt);
        expect(result.composition.ltInPacket).toEqual(['lttender']);
    });

    it('тяжёлый сервис занимает места по весу: Искра и ЧекДок Премиум', () => {
        const oneFree = start('buh', { lt: ['ltsemi'] });
        expect(toggle(oneFree, 'iscra', true, ctx('buh')).composition.ltInPacket).toEqual(['iscra']);
        expect(toggle(start('buh', { lt: [] }), 'iscra', true, ctx('buh')).composition.lt).toEqual(['iscra']);
        expect(toggle(start('exbuild'), 'ltdisk', true, ctx('exbuild')).composition.ltInPacket).toEqual(['ltdisk']);
    });

    it('снятие тяжёлого поднимает столько платных, сколько влезло', () => {
        const composition = start('exbuild', { ltInPacket: ['ltdisk', 'lttender', 'ltbusiness'] });
        const result = toggle(composition, 'ltcheckdocprem', false, ctx('exbuild'));
        expect(result.composition.lt).toEqual(['ltbusiness', 'lttender']);
        expect(result.composition.ltInPacket).toEqual(['ltdisk']);
    });

    it('Эксперт PRO: Гарант Диск снять нельзя, без правил можно', () => {
        const blocked = toggle(start('expert'), 'ltdisk', false, ctx('expert'));
        expect(codes(blocked.violations)).toContain('lt/pinned');
        expect(blocked.composition.lt).toContain('ltdisk');

        const free = toggle(start('expert', { mode: 'free' }), 'ltdisk', false, ctx('expert'));
        expect(free.composition.lt).not.toContain('ltdisk');
    });

    it('Эксперт PRO: второй сервис снимается и заменяется', () => {
        const removed = toggle(start('expert'), 'ltconstructor', false, ctx('expert'));
        expect(removed.composition.lt).toEqual(['ltdisk']);
        expect(toggle(removed.composition, 'ltsut', true, ctx('expert')).composition.lt).toEqual(['ltdisk', 'ltsut']);
    });

    it('универсал: всё платно; 2, 5, 10 — пакеты, 3 — подсказка', () => {
        const withServices = (list: string[]) =>
            describeLtPackets(start('maximum', { ltInPacket: list }), ctx('maximum'))[0]!;
        const three = ['ltsemi', 'ltconstructor', 'ltsut'];
        const five = [...three, 'ltdisk', 'ltconnect'];
        const ten = [...five, 'ltdocmail', 'ltexcontragent', 'lttender', 'ltexsog', 'ltbusiness'];

        expect(toggle(start('maximum'), 'ltsemi', true, ctx('maximum')).composition.ltInPacket).toEqual(['ltsemi']);
        expect(withServices(three.slice(0, 2)).package?.code).toBe('ltpackSmall');
        expect(withServices(five).package?.code).toBe('ltpackMedium');
        expect(withServices(ten).package?.code).toBe('ltpackBig');
        expect(withServices(three).isProduct).toBe(false);
    });

    it('без правил: раскладка та же, сервис можно перенести; с правилами перенос запрещён', () => {
        const free = start('buh', { mode: 'free' });
        const third = toggle(free, 'ltdisk', true, ctx('buh'));
        expect(third.composition.ltInPacket).toEqual(['ltdisk']);

        const moved = applyAction(third.composition, { kind: 'moveLt', code: 'ltdisk', to: 'included' }, ctx('buh'));
        expect(moved.composition.lt).toContain('ltdisk');
        expect(moved.composition.ltInPacket).toEqual([]);

        const rules = applyAction(start('buh'), { kind: 'moveLt', code: 'ltsemi', to: 'paid' }, ctx('buh'));
        expect(codes(rules.violations)).toContain('lt/move-needs-free');
        expect(rules.composition.ltInPacket).toEqual([]);
    });

    it('подпись Искры: своя задаётся и снимается', () => {
        const named = applyAction(start('buh'), { kind: 'setLtSubtitle', code: 'iscra', subtitle: ' Искра ПРО ' }, ctx('buh'));
        expect(named.composition.ltSubtitles).toEqual({ iscra: 'Искра ПРО' });
        const cleared = applyAction(named.composition, { kind: 'setLtSubtitle', code: 'iscra', subtitle: null }, ctx('buh'));
        expect(cleared.composition.ltSubtitles).toEqual({});
    });
});

describe('LT: пакет веса 4 и подсказки', () => {
    const four = ['ltsemi', 'ltconstructor', 'ltsut', 'ltdisk'];

    it('основной платный пакет веса 4: продажам — предупреждение, сервису — пакет', () => {
        const composition = start('maximum', { ltInPacket: four });
        const sales = describeLtPackets(composition, ctx('maximum'))[0]!;
        expect(sales).toMatchObject({ status: 'locked', isProduct: false });
        expect(codes(toggle(composition, 'ltdisk', true, ctx('maximum')).violations)).toContain('lt/locked-packet');

        const service = describeLtPackets(composition, ctx('maximum', { serviceDepartment: true }))[0]!;
        expect(service.package?.code).toBe('ltpackMediumOld');
        expect(service.isProduct).toBe(true);
    });

    it('без правил вес 4 доступен всем', () => {
        const composition = start('maximum', { mode: 'free', ltInPacket: four });
        expect(describeLtPackets(composition, ctx('maximum'))[0]!.isProduct).toBe(true);
    });

    it('подсказка называет ближайшие пакеты; вес 4 продажам не предлагается', () => {
        const hint = (list: string[]) =>
            ltPacketHint(describeLtPackets(start('maximum', { ltInPacket: list }), ctx('maximum'))[0]!);
        expect(hint(four.slice(0, 3))).toBe(
            'Вес 3: добавьте ещё 2 до «Гарант-LegalTech. Средний пакет» или уберите 1 до «Гарант-LegalTech. Малый пакет»',
        );
        expect(hint(four.slice(0, 1))).toBe('Вес 1: добавьте ещё 1 до «Гарант-LegalTech. Малый пакет»');
    });

    it('сверх большого пакета — предлагает вынести в доп. пакет', () => {
        const eleven = catalog.services.lt.filter(item => item.weight === 1).slice(0, 11).map(item => item.code);
        const packet = describeLtPackets(start('maximum', { ltInPacket: eleven }), ctx('maximum'))[0]!;
        expect(ltPacketHint(packet)).toContain('вынесите часть в доп. пакет');
    });
});
