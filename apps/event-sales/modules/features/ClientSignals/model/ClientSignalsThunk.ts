import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    appendMultifield,
    signalValidationError,
    type SignalKind,
} from '../lib/signal-validate';
import { getSignalsTarget } from '../lib/signal-selectors';
import { clientSignalsActions } from './ClientSignalsSlice';

/**
 * Добавить телефон/email лиду-носителю. Паттерн тот же, что у ИНН:
 * валидация → пессимистичная запись (мультифилд дополняется, существующие
 * строки сохраняются) → setSaved; автопоиск дублей по новому значению —
 * реакцией листенера на setSaved.
 */
export const saveSignal =
    (kind: SignalKind, raw: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const validationError = signalValidationError(kind, raw);
        if (validationError) {
            dispatch(clientSignalsActions.setError({ message: validationError }));
            return false;
        }

        const target = getSignalsTarget(getState());
        if (!target) {
            dispatch(
                clientSignalsActions.setError({
                    message: 'Лид-носитель не найден.',
                }),
            );
            return false;
        }

        const value = raw.trim();
        const rows = appendMultifield(
            kind === 'phone' ? target.rawPhones : target.rawEmails,
            kind,
            value,
        );
        if (!rows) {
            dispatch(
                clientSignalsActions.setError({
                    message:
                        kind === 'phone'
                            ? 'Такой номер у лида уже есть.'
                            : 'Такой email у лида уже есть.',
                }),
            );
            return false;
        }

        dispatch(clientSignalsActions.setSaving({ status: true }));
        try {
            await Bitrix.getService().lead.update(target.leadId, {
                [kind === 'phone' ? 'PHONE' : 'EMAIL']: rows,
            } as never);
            dispatch(clientSignalsActions.setSaved({ kind, value }));
            return true;
        } catch (error) {
            console.error('saveSignal error', error);
            dispatch(
                clientSignalsActions.setError({
                    message: 'Не удалось сохранить — попробуйте ещё раз.',
                }),
            );
            return false;
        }
    };
