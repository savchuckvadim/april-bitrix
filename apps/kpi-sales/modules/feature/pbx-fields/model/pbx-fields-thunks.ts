import type { AppThunk } from '@/modules/app/model/store';
import { PbxFieldsHelper } from '../lib/api/pbx-fields-helper';
import { pbxEditKey } from '../lib/edit-key.util';
import {
    PBX_ERROR_REVERT_MS,
    PBX_SAVED_BADGE_MS,
} from '../lib/pbx-fields.data';
import { pbxFieldsActions } from './pbx-fields-slice';
import type { PbxFieldUpdatePayload } from './index';

const helper = new PbxFieldsHelper();

const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Ленивая загрузка метаданных редактируемых полей (idle-guard: сколько бы
 * компонент ни монтировалось — один запрос). На публичной /share domain
 * пуст — мета не грузится, редактирование и так выключено гейтом isPublic.
 */
export const loadPbxFieldsMeta = (): AppThunk => async (dispatch, getState) => {
    const { app, pbxFields } = getState();
    if (pbxFields.meta.status !== 'idle') return;
    if (!app.domain || app.isPublic) return;

    dispatch(pbxFieldsActions.metaLoading());
    try {
        const fields = await helper.getMeta(app.domain);
        dispatch(pbxFieldsActions.metaReady(fields));
    } catch {
        dispatch(pbxFieldsActions.metaError());
    }
};

export interface UpdatePbxFieldArgs extends PbxFieldUpdatePayload {
    /** Прежнее значение — для отката при ошибке записи. */
    prevValue: string | null;
}

/**
 * Optimistic-запись значения поля:
 * значение видно сразу → сейв в Bitrix → зелёная галочка (гаснет сама);
 * ошибка → красный микро-бейдж с текстом, затем автоматический откат к
 * прежнему значению (UI возвращается к правде Bitrix).
 */
export const updatePbxFieldValue =
    (args: UpdatePbxFieldArgs): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const { app, pbxFields } = getState();
        const meta = pbxFields.meta.byCode[args.fieldCode];
        if (!app.domain || app.isPublic || !meta) return false;

        const key = pbxEditKey(meta.entity, args.entityId, args.fieldCode);

        // Optimistic: значение и «сохраняем…» сразу.
        dispatch(pbxFieldsActions.setOverride({ key, value: args.value }));
        dispatch(
            pbxFieldsActions.setEdit({ key, edit: { status: 'saving' } }),
        );

        try {
            const saved = await helper.update(app.domain, {
                fieldCode: args.fieldCode,
                entityId: args.entityId,
                value: args.value,
            });
            dispatch(pbxFieldsActions.setOverride({ key, value: saved }));
            dispatch(
                pbxFieldsActions.setEdit({ key, edit: { status: 'saved' } }),
            );
            await sleep(PBX_SAVED_BADGE_MS);
            // Галочку гасим, только если её не сменил новый сейв.
            if (getState().pbxFields.edits[key]?.status === 'saved') {
                dispatch(pbxFieldsActions.clearEdit({ key }));
            }
            return true;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось сохранить значение';
            dispatch(
                pbxFieldsActions.setEdit({
                    key,
                    edit: { status: 'error', message },
                }),
            );
            await sleep(PBX_ERROR_REVERT_MS);
            // Откатываем, только если за это время не начался новый сейв.
            if (getState().pbxFields.edits[key]?.status === 'error') {
                dispatch(
                    pbxFieldsActions.setOverride({
                        key,
                        value: args.prevValue,
                    }),
                );
                dispatch(pbxFieldsActions.clearEdit({ key }));
            }
            return false;
        }
    };
