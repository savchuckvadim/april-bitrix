import { beforeEach, describe, expect, it, vi } from 'vitest';

const dealUpdate = vi.fn().mockResolvedValue(true);
const companyUpdate = vi.fn().mockResolvedValue(true);
const leadUpdate = vi.fn().mockResolvedValue(true);

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({
            deal: { update: dealUpdate },
            company: { update: companyUpdate },
            lead: { update: leadUpdate },
        }),
    },
}));

vi.mock('@/modules/shared/front-error', () => ({
    reportFrontError: vi.fn(),
}));

/**
 * Отправка события после опросника: подменяем плоским экшеном — мини-стор
 * положит его в actions, и по нему видно, продолжилась ли отправка.
 */
vi.mock('@/modules/processes/event/model/SendThunk', () => ({
    send: () => ({ type: 'event/send' }),
}));

import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { checkPresentationData } from '../data/check-presentation';
import type { CheckPresentationValue } from '../type/check-presentation-type';
import { persistCheckPresentation } from './CheckPresentationPersistThunk';
import { submitCheckPresentation } from './AfterPresentationThunk';

/** Поля слепка: код реестра → суффикс bitrixId (префикс добавит findUfKey). */
const fields = (...codes: string[]) =>
    codes.map(code => ({ code, bitrixId: code.toUpperCase(), items: [] }));

const ANSWERS: Record<string, CheckPresentationValue> = {
    xo_impression: 'слушали',
    op_5k_client_what: 'нормативка',
    op_presentation_xvost: 'дожать цену',
};

const makeState = (over?: {
    committed?: Record<string, CheckPresentationValue>;
    leadFields?: ReturnType<typeof fields>;
    dealFields?: ReturnType<typeof fields>;
    companyFields?: ReturnType<typeof fields>;
    pendingSend?: boolean;
    /** Встройка без привязки к CRM: писать физически некому. */
    noEntities?: boolean;
}): RootState =>
    ({
        app: {
            bitrix: over?.noEntities
                ? { user: { ID: '7' } }
                : {
                      company: { ID: '5' },
                      deal: { ID: '10' },
                      lead: { ID: '1' },
                      user: { ID: '7' },
                  },
        },
        portal: {
            portal: {
                company: {
                    bitrixfields:
                        over?.companyFields ?? fields('op_presentation_5k'),
                },
                bitrixDeal: {
                    bitrixfields:
                        over?.dealFields ??
                        fields('op_presentation_xvost', 'op_presentation_5k'),
                },
                lead: {
                    bitrixfields:
                        over?.leadFields ??
                        fields(
                            'op_talk_impression',
                            'op_5k_client_what',
                            'op_presentation_xvost',
                            'op_presentation_5k',
                        ),
                },
            },
        },
        afterPresentation: {
            initialized: true,
            pendingSend: over?.pendingSend ?? false,
            checkPresentation: {
                items: checkPresentationData,
                committed: over?.committed ?? ANSWERS,
            },
        },
        relatedCrm: { details: null },
    }) as unknown as RootState;

/** Мини-стор: thunk'и исполняются, простые экшены копятся. */
const makeStore = (state: RootState) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const dispatch = ((action: unknown) =>
        typeof action === 'function'
            ? (action as (d: unknown, g: () => RootState) => unknown)(
                  dispatch,
                  () => state,
              )
            : actions.push(
                  action as { type: string; payload?: unknown },
              )) as unknown as AppDispatch;
    return { dispatch, actions };
};

const types = (actions: Array<{ type: string }>) => actions.map(a => a.type);

beforeEach(() => {
    dealUpdate.mockClear().mockResolvedValue(true);
    companyUpdate.mockClear().mockResolvedValue(true);
    leadUpdate.mockClear().mockResolvedValue(true);
});

describe('фрейм-запись ответов опросника', () => {
    it('пишет в компанию, сделку и лид — кодами реестра и со сводкой', async () => {
        const { dispatch } = makeStore(makeState());

        const result = await dispatch(persistCheckPresentation());

        expect(leadUpdate).toHaveBeenCalledWith(1, {
            // xo_impression опросника переведён в поле реестра.
            UF_CRM_OP_TALK_IMPRESSION: 'слушали',
            UF_CRM_OP_5K_CLIENT_WHAT: 'нормативка',
            UF_CRM_OP_PRESENTATION_XVOST: 'дожать цену',
            UF_CRM_OP_PRESENTATION_5K: 'КЛИЕНТ: Что хочет?: нормативка',
        });
        expect(dealUpdate).toHaveBeenCalledWith(10, {
            UF_CRM_OP_PRESENTATION_XVOST: 'дожать цену',
            UF_CRM_OP_PRESENTATION_5K: 'КЛИЕНТ: Что хочет?: нормативка',
        });
        expect(companyUpdate).toHaveBeenCalledWith(5, {
            UF_CRM_OP_PRESENTATION_5K: 'КЛИЕНТ: Что хочет?: нормативка',
        });
        expect(result).toEqual({
            attempted: 3,
            failed: [],
            isTotalFailure: false,
            nothingWritten: false,
            noTargets: false,
        });
    });

    it('часть целей отказала — не провал, работа продолжается', async () => {
        leadUpdate.mockRejectedValueOnce(new Error('нет лида'));
        const { dispatch } = makeStore(makeState());

        const result = await dispatch(persistCheckPresentation());

        expect(result.failed).toEqual(['lead:1']);
        expect(result.isTotalFailure).toBe(false);
    });
});

describe('итог записи честен без серверного контура', () => {
    it('все цели отказали — провал', async () => {
        dealUpdate.mockRejectedValue(new Error('403'));
        companyUpdate.mockRejectedValue(new Error('403'));
        leadUpdate.mockRejectedValue(new Error('403'));
        const { dispatch } = makeStore(makeState());

        const result = await dispatch(persistCheckPresentation());

        expect(result.isTotalFailure).toBe(true);
    });

    it('писать оказалось некуда, а ответы есть — свой флаг, НЕ провал', async () => {
        // Протухший слепок браузера (инцидент todo3108 №1): поля на портале
        // установлены, findUfKey их не знает. Повторять нечего — слепок за
        // время нажатия «Сохранить» не обновится, поэтому это не отказ
        // портала, а мягкая деградация: ответы уедут в payload отчёта.
        const { dispatch } = makeStore(
            makeState({
                leadFields: [],
                dealFields: [],
                companyFields: [],
            }),
        );

        const result = await dispatch(persistCheckPresentation());

        expect(dealUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
            attempted: 0,
            failed: [],
            isTotalFailure: false,
            nothingWritten: true,
            noTargets: false,
        });
    });

    /*
     * ДРУГАЯ БЕДА, ЧЕМ «НЕТ ПОЛЕЙ». Встройка без привязки к CRM: ни
     * компании, ни сделки, ни лида в контексте. Слепок при этом жив и поля
     * знает — и сообщение «Полей опросника нет в карточке клиента» звало бы
     * менеджера проверять настройки там, где проверять нечего.
     */
    it('целей нет вовсе — свой флаг, а не «полей нет»', async () => {
        const { dispatch } = makeStore(makeState({ noEntities: true }));

        const result = await dispatch(persistCheckPresentation());

        expect(result).toEqual({
            attempted: 0,
            failed: [],
            isTotalFailure: false,
            nothingWritten: false,
            noTargets: true,
        });
    });

    it('писать было нечего — ни провала, ни «некуда»', async () => {
        const { dispatch } = makeStore(
            makeState({
                committed: { xo_impression: '  ', op_5k_client_what: '' },
                leadFields: [],
                dealFields: [],
                companyFields: [],
            }),
        );

        const result = await dispatch(persistCheckPresentation());

        expect(result.isTotalFailure).toBe(false);
        expect(result.nothingWritten).toBe(false);
        expect(result.noTargets).toBe(false);
    });
});

describe('submitCheckPresentation', () => {
    it('записалось — подтверждаем и закрываем окно', async () => {
        const { dispatch, actions } = makeStore(makeState());

        await dispatch(submitCheckPresentation());

        expect(types(actions)).toEqual([
            'afterPresentation/commitAnswers',
            'afterPresentation/setPersistError',
            'afterPresentation/setConfirmed',
            'afterPresentation/setActiveStatus',
        ]);
    });

    it('портал отказал всем целям — подтверждения нет, окно остаётся открытым', async () => {
        dealUpdate.mockRejectedValue(new Error('403'));
        companyUpdate.mockRejectedValue(new Error('403'));
        leadUpdate.mockRejectedValue(new Error('403'));
        const { dispatch, actions } = makeStore(makeState());

        await dispatch(submitCheckPresentation());

        expect(types(actions)).toEqual([
            'afterPresentation/commitAnswers',
            'afterPresentation/setPersistError',
        ]);
        expect(actions[1]?.payload).toEqual({
            message:
                'Ответы не сохранились — попробуйте ещё раз. ' +
                'Отчёт не отправлен.',
        });
    });

    /*
     * «Писать некуда» обязано ПРОПУСКАТЬ отправку. Запри мы окно (как при
     * отказе портала) — подтверждения нет, selectNeedAfterPresentation
     * снова открывает то же окно, «Сохранить» снова упирается в тот же
     * слепок. Отчёт не ушёл бы никогда — а вместе с ним не ушёл бы и
     * payload `presentation.survey`, которым поток записал бы ответы своим
     * слепком: единственный оставшийся путь ответов был бы перекрыт ровно в
     * том сценарии, ради которого payload и делали.
     */
    it('писать некуда — предупреждаем, но подтверждаем и продолжаем отправку', async () => {
        const { dispatch, actions } = makeStore(
            makeState({
                leadFields: [],
                dealFields: [],
                companyFields: [],
                pendingSend: true,
            }),
        );

        await dispatch(submitCheckPresentation());

        expect(types(actions)).toEqual([
            'afterPresentation/commitAnswers',
            'afterPresentation/setPersistError',
            'afterPresentation/setConfirmed',
            'afterPresentation/setActiveStatus',
            'afterPresentation/setPendingSend',
            'event/send',
        ]);
        expect(actions[1]?.payload).toEqual({
            message:
                'Полей опросника нет в карточке клиента — ответы уедут ' +
                'вместе с отчётом.',
        });
        expect(actions[2]?.payload).toEqual({ status: true });
        expect(actions[3]?.payload).toEqual({ status: false });
    });

    /*
     * Тот же исход работы (продолжаем), но ДРУГОЙ текст: при живом слепке и
     * отсутствии сущностей звать менеджера проверять поля бессмысленно.
     */
    it('целей нет — своё сообщение, а не «полей опросника нет»', async () => {
        const { dispatch, actions } = makeStore(
            makeState({ noEntities: true, pendingSend: true }),
        );

        await dispatch(submitCheckPresentation());

        expect(actions[1]?.payload).toEqual({
            message:
                'Карточка клиента не открыта — ответы уедут вместе с отчётом.',
        });
        expect(types(actions)).toContain('event/send');
    });
});
