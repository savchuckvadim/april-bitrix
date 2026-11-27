import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { bxrqActions, bxrqReducer, type BXRQState } from '../../model/BxRqSlice';
import {
    CONTRACT_RQ_GROUP,
    RQ_TYPE,
    type AddressRqItem,
    type BankRqItem,
    type RqItem,
    type RqRecord,
} from '../../model/types';

const field = (code: string, value: string): RqItem => ({
    type: 'string',
    name: code,
    value,
    code,
    isRequired: false,
    includes: [RQ_TYPE.ORGANIZATION, RQ_TYPE.FIZ],
    group: CONTRACT_RQ_GROUP.RQ,
    isActive: true,
    isDisable: false,
    order: 1,
});

const record = (bx_id: number, type: RQ_TYPE, inn: string): RqRecord => ({
    bx_id,
    preset_id: 2,
    type,
    fields: [field('inn', inn)],
    address: { items: [], current: null },
    bank: { items: [], current: { id: -1, fields: [field('bank_name', '')] }, fields: [] },
});

const ORG_A = record(77, RQ_TYPE.ORGANIZATION, '7707083893');
const ORG_B = record(78, RQ_TYPE.ORGANIZATION, '5001007329');
const FIZ_TEMPLATE = record(-1, RQ_TYPE.FIZ, '');

const loaded = (): BXRQState => {
    const initial = bxrqReducer(undefined, { type: 'init' });
    const orgTemplate = record(-1, RQ_TYPE.ORGANIZATION, '');
    return {
        ...initial,
        rqs: {
            [RQ_TYPE.ORGANIZATION]: { items: [ORG_A, ORG_B], default: orgTemplate },
            [RQ_TYPE.IP]: { items: [], default: { ...orgTemplate, type: RQ_TYPE.IP } },
            [RQ_TYPE.FIZ]: { items: [], default: FIZ_TEMPLATE },
            current: ORG_A,
        },
        current: { items: [ORG_A, ORG_B], item: ORG_A },
    };
};

/** Исходник компонента рядом с тестами: ../../ui/<имя>.tsx. */
const readUi = (name: string): string =>
    readFileSync(fileURLToPath(new URL(`../../ui/${name}.tsx`, import.meta.url)), 'utf8');

describe('окна правки реквизита не принадлежат вкладкам', () => {
    it('«Новый реквизит» при любой открытой вкладке даёт черновик основной информации в сторе', () => {
        // вкладка в сторе не хранится: черновик один, и окно для него рисует экран
        const state = bxrqReducer(loaded(), bxrqActions.startNewRecord({ clientType: RQ_TYPE.FIZ }));
        expect(state.creating.base?.bx_id).toBe(-1);
        expect(state.creating.base?.type).toBe(RQ_TYPE.FIZ);
    });

    it.each(['BxRqBaseEdit', 'BxRqAddressEdit', 'BxRqBankEdit'])(
        'карточка вкладки %s не рисует окно: Radix снимает неактивную вкладку вместе с окном',
        name => {
            expect(readUi(name)).not.toContain('BxRqEditModal');
        },
    );

    it('окна рисует BxRqDraftModals, и все три черновика обслуживает он', () => {
        const source = readUi('BxRqDraftModals');
        expect(source).toContain('modals.base');
        expect(source).toContain('modals.address');
        expect(source).toContain('modals.bank');
    });
});

describe('черновики не переживают смену текущего реквизита', () => {
    const withAddressDraft = (state: BXRQState): BXRQState => ({
        ...state,
        creating: {
            ...state.creating,
            address: { anchor_id: 1, type_id: 6, name_type: 'Юр', fields: [] } as AddressRqItem,
            bank: { id: 5, fields: [] } as BankRqItem,
        },
    });

    it('выбран другой реквизит: адрес и банк прежнего не уйдут в новый', () => {
        const state = bxrqReducer(
            withAddressDraft(loaded()),
            bxrqActions.setCurrentItem({ item: ORG_B }),
        );
        expect(state.current.item?.bx_id).toBe(78);
        expect(state.creating.address).toBeNull();
        expect(state.creating.bank).toBeNull();
    });

    it('выбран тот же реквизит: черновик адреса остаётся', () => {
        const state = bxrqReducer(
            withAddressDraft(loaded()),
            bxrqActions.setCurrentItem({ item: ORG_A }),
        );
        expect(state.creating.address).not.toBeNull();
    });

    it('сменили тип клиента: черновик нового реквизита прежнего типа сбрасывается', () => {
        const draft = bxrqReducer(
            loaded(),
            bxrqActions.startNewRecord({ clientType: RQ_TYPE.ORGANIZATION }),
        );
        const state = bxrqReducer(
            draft,
            bxrqActions.setCurrentRqItems({ clientType: RQ_TYPE.FIZ }),
        );
        expect(state.current.item?.type).toBe(RQ_TYPE.FIZ);
        expect(state.creating.base).toBeNull();
    });

    it('пересчёт реквизитов того же типа: черновик нового реквизита остаётся', () => {
        const draft = bxrqReducer(
            loaded(),
            bxrqActions.startNewRecord({ clientType: RQ_TYPE.ORGANIZATION }),
        );
        const state = bxrqReducer(
            draft,
            bxrqActions.setCurrentRqItems({ clientType: RQ_TYPE.BUDGET, currentRqId: 77 }),
        );
        expect(state.creating.base?.bx_id).toBe(-1);
    });

    it('черновик правки другого реквизита сбрасывается при смене текущего', () => {
        const editing = bxrqReducer(
            loaded(),
            bxrqActions.initBaseCreating({ currentClientType: RQ_TYPE.ORGANIZATION }),
        );
        expect(editing.creating.base?.bx_id).toBe(77);
        const state = bxrqReducer(editing, bxrqActions.setCurrentItem({ item: ORG_B }));
        expect(state.creating.base).toBeNull();
    });
});
