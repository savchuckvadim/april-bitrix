import type { UnknownAction } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import type { ComplectVariantItem } from '@/modules/entities/complect-variant/lib/api/complect-variant-helper';
import {
    complectVariantActions,
    complectVariantReducer,
    type ComplectVariantState,
} from '@/modules/entities/complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant/model/dto';
import { recordOf } from '@/modules/entities/offer-document/lib/__fixtures__/variant-records';
import {
    COMPLECT_MODE_FIELD_TITLE,
    MIN_VARIANTS_FOR_MODE_CHOICE,
    SINGLE_CONTRACT_DIVERGED_TEXT,
    SINGLE_CONTRACT_UNAVAILABLE_TEXT,
    buildComplectModeOptions,
    parseComplectMode,
    selectComplectModeView,
} from './complect-mode-view';

type State = { complectVariant: ComplectVariantState };

/** Слепок варианта с заданным типом договора (по умолчанию в фикстуре «abonYear»). */
const recordWithContract = (id: number, variantSmartId: number, contractCode: string): ComplectVariantRecordDto => {
    const base = recordOf(id, variantSmartId, 'buh');
    const snapshot: Record<string, unknown> = JSON.parse(base.rows ?? '{}');
    return { ...base, rows: JSON.stringify({ ...snapshot, contractCode }) };
};

const items: ComplectVariantItem[] = [
    { id: 101, title: 'Первый', stageId: 'DT1:NEW' },
    { id: 102, title: 'Второй', stageId: 'DT1:CURRENT' },
    { id: 103, title: 'Третий', stageId: 'DT1:REJECTED' },
    { id: 104, title: 'Четвёртый', stageId: 'DT1:SUCCESS' },
];

const stateOf = (records: ComplectVariantRecordDto[], mode: ComplectMode = COMPLECT_MODE.compare): State => {
    let complectVariant = complectVariantReducer(
        undefined,
        complectVariantActions.loaded({ records, composition: { ...DEFAULT_COMPLECT_COMPOSITION, mode } }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.itemsLoaded(items));
    return { complectVariant };
};

const apply = (state: State, action: UnknownAction): State => ({
    complectVariant: complectVariantReducer(state.complectVariant, action),
});

const sameType = () => [recordWithContract(1, 101, 'abonYear'), recordWithContract(2, 102, 'abonYear')];
const differentTypes = () => [recordWithContract(1, 101, 'abonYear'), recordWithContract(2, 102, 'abonMonth')];

describe('видимость выбора режима', () => {
    it('вариантов нет — выбирать нечего', () => {
        expect(selectComplectModeView(stateOf([])).isVisible).toBe(false);
    });

    it('один незакрытый вариант — выбор не показывается', () => {
        expect(selectComplectModeView(stateOf([recordWithContract(1, 101, 'abonYear')])).isVisible).toBe(false);
    });

    it('два варианта, один закрыт (Отклонён или Успех) — незакрытый один, выбор не показывается', () => {
        const rejected = [recordWithContract(1, 101, 'abonYear'), recordWithContract(3, 103, 'abonYear')];
        const success = [recordWithContract(1, 101, 'abonYear'), recordWithContract(4, 104, 'abonYear')];
        expect(selectComplectModeView(stateOf(rejected)).isVisible).toBe(false);
        expect(selectComplectModeView(stateOf(success)).isVisible).toBe(false);
    });

    it(`от ${MIN_VARIANTS_FOR_MODE_CHOICE} незакрытых вариантов выбор показывается`, () => {
        expect(selectComplectModeView(stateOf(sameType())).isVisible).toBe(true);
    });

    it('закрытый вариант в счёт не идёт: два незакрытых и один закрытый — показывается', () => {
        const records = [...sameType(), recordWithContract(3, 103, 'abonYear')];
        expect(selectComplectModeView(stateOf(records)).isVisible).toBe(true);
    });

    it('вариант закрыли, остался один незакрытый — выбор пропадает', () => {
        const state = stateOf(sameType());
        const closed = apply(
            state,
            complectVariantActions.itemsLoaded([
                { id: 101, title: 'Первый', stageId: 'DT1:NEW' },
                { id: 102, title: 'Второй', stageId: 'DT1:SUCCESS' },
            ]),
        );
        expect(selectComplectModeView(state).isVisible).toBe(true);
        expect(selectComplectModeView(closed).isVisible).toBe(false);
    });

    it('пока стадии грузятся, число незакрытых неизвестно — выбор скрыт', () => {
        const loading = apply(stateOf(sameType()), complectVariantActions.loading());
        expect(selectComplectModeView(loading).isVisible).toBe(false);
    });

    it('сбой загрузки вариантов — выбор скрыт', () => {
        const failed = apply(stateOf(sameType()), complectVariantActions.failed('сеть'));
        expect(selectComplectModeView(failed).isVisible).toBe(false);
    });
});

describe('пункты выбора режима', () => {
    it('три пункта в порядке экрана с заданными подписями', () => {
        const { options } = selectComplectModeView(stateOf(sameType()));
        expect(options.map(option => [option.mode, option.title])).toEqual([
            [COMPLECT_MODE.compare, 'Только открытый вариант'],
            [COMPLECT_MODE.single_contract, 'Все варианты одним договором'],
            [COMPLECT_MODE.multi_contract, 'Все варианты, каждому свой договор'],
        ]);
    });

    it('заголовок поля', () => {
        expect(COMPLECT_MODE_FIELD_TITLE).toBe('Варианты в договоре и отчёте');
    });

    it('тип договора у вариантов совпадает — все пункты доступны, причины нет', () => {
        const view = selectComplectModeView(stateOf(sameType()));
        expect(view.options.every(option => !option.disabled)).toBe(true);
        expect(view.singleContractUnavailable).toBeNull();
        expect(view.singleContractDiverged).toBeNull();
    });

    it('типы договора разные — «Все варианты одним договором» отключён, причина показана', () => {
        const view = selectComplectModeView(stateOf(differentTypes()));
        expect(view.options.filter(option => option.disabled).map(option => option.mode)).toEqual([
            COMPLECT_MODE.single_contract,
        ]);
        expect(view.singleContractUnavailable).toBe(SINGLE_CONTRACT_UNAVAILABLE_TEXT);
        expect(view.singleContractDiverged).toBeNull();
    });

    it('тип договора не читается у одного из вариантов — «Все варианты одним договором» тоже отключён', () => {
        const records = [recordWithContract(1, 101, 'abonYear'), recordOf(2, 102, 'buh', '{broken')];
        expect(selectComplectModeView(stateOf(records)).singleContractUnavailable).toBe(SINGLE_CONTRACT_UNAVAILABLE_TEXT);
    });

    it('закрытый вариант с другим типом договора оценку не меняет', () => {
        const records = [...sameType(), recordWithContract(3, 103, 'abonMonth')];
        expect(selectComplectModeView(stateOf(records)).singleContractUnavailable).toBeNull();
    });

    it('сохранён «Все варианты одним договором», а типы разошлись — предупреждение о повторном выборе', () => {
        const view = selectComplectModeView(stateOf(differentTypes(), COMPLECT_MODE.single_contract));
        expect(view.singleContractDiverged).toBe(SINGLE_CONTRACT_DIVERGED_TEXT);
    });

    it('сохранён «Все варианты одним договором», типы совпадают — предупреждения нет', () => {
        expect(selectComplectModeView(stateOf(sameType(), COMPLECT_MODE.single_contract)).singleContractDiverged).toBeNull();
    });

    it('buildComplectModeOptions отключает только «Все варианты одним договором»', () => {
        expect(buildComplectModeOptions(true).some(option => option.disabled)).toBe(false);
        expect(buildComplectModeOptions(false).filter(option => option.disabled).map(option => option.mode)).toEqual([
            COMPLECT_MODE.single_contract,
        ]);
    });
});

describe('режим и состояние выбора', () => {
    it.each([COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract])(
        'режим %s: выбранное значение и строка о том, что идёт в договор и отчёт',
        mode => {
            const view = selectComplectModeView(stateOf(sameType(), mode));
            expect(view.mode).toBe(mode);
            expect(view.note).toContain('В договор, отчёт о поставке и товары сделки');
        },
    );

    it('идёт запись вариантов — выбор заблокирован', () => {
        const state = stateOf(sameType());
        expect(selectComplectModeView(state).isBusy).toBe(false);
        expect(selectComplectModeView(apply(state, complectVariantActions.busy(true))).isBusy).toBe(true);
    });

    it('кэшируется: чужое изменение слайса отдаёт тот же объект', () => {
        const state = stateOf(sameType());
        const error = apply(state, complectVariantActions.clearError());
        expect(selectComplectModeView(error)).toBe(selectComplectModeView(state));
    });
});

describe('разбор значения селекта', () => {
    it('три режима узнаются', () => {
        expect(parseComplectMode('compare')).toBe(COMPLECT_MODE.compare);
        expect(parseComplectMode('single_contract')).toBe(COMPLECT_MODE.single_contract);
        expect(parseComplectMode('multi_contract')).toBe(COMPLECT_MODE.multi_contract);
    });

    it('чужое значение режимом не считается', () => {
        expect(parseComplectMode('together')).toBeNull();
        expect(parseComplectMode('')).toBeNull();
    });
});
