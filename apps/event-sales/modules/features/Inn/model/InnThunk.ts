import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { innValidationError, normalizeInn } from '../lib/inn-validate';
import { getCurrentInn, getInnTarget } from '../lib/inn-selectors';
import { setInnOnServer } from '../lib/api/inn-set-helper';
import { serverReasonText } from '@/modules/shared/lib/request-error';
import { entityIdOf } from '@/modules/shared/lib/entity-id';
import { innActions } from './InnSlice';

const SAVE_ERROR = 'Не удалось сохранить ИНН — попробуйте ещё раз.';

/**
 * Запись ИНН из шапки (26.10.2026 — через бэк).
 *
 * Раньше шапка писала поля прямо из браузера: компанию и сделку поверх, без
 * заявок, без записи в ленте и правами сотрудника — вторая, несогласованная
 * обработка ИНН. Теперь пишет бэк (`POST /api/inn/set`) по правилам
 * «Выбрать» во вкладке «ИНН»: открытая сделка — сделка, пул, компания,
 * пустые заявки и запись в ленте; без открытой сделки — компания или заявка.
 *
 * Паттерн пессимистичный: состояние — после ответа. Автопоиск дублей по
 * свежему ИНН — реакцией листенера на setSaved.
 */
export const saveInn =
    (raw: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const validationError = innValidationError(raw);
        if (validationError) {
            dispatch(innActions.setError({ message: validationError }));
            return false;
        }
        const digits = normalizeInn(raw)!;

        const state = getState();
        if (!getInnTarget(state)) {
            dispatch(
                innActions.setError({
                    message: 'Поле ИНН не настроено на портале.',
                }),
            );
            return false;
        }

        dispatch(innActions.setSaving({ status: true }));
        try {
            const { deal, company, lead, user } = state.app.bitrix;
            await setInnOnServer({
                domain: state.app.domain,
                inn: digits,
                dealId: entityIdOf(deal),
                companyId: entityIdOf(company),
                leadId: entityIdOf(lead),
                userId: entityIdOf(user),
            });
            dispatch(innActions.setSaved({ value: digits }));
            return true;
        } catch (error) {
            console.error('saveInn error', error);
            dispatch(
                innActions.setError({
                    message: serverReasonText(error, SAVE_ERROR),
                }),
            );
            return false;
        }
    };

/**
 * ИНН записали в обход этого блока (вкладка «ИНН» сделки, «Выбрать»): в
 * Битриксе значение уже новое, а шапка до перезагрузки показывала старое.
 * Перечитываем ОДНУ сущность — ту, чей ИНН показывает шапка (компания,
 * без неё сделка, лид), — и показываем ровно то, что увидели бы после
 * перезагрузки: ответ вкладки — снимок сделки, а шапка может показывать
 * компанию или лид.
 *
 * Полное обновление сущностей (setAppBitrixData) не годится: оно заново
 * собирает поля, контакты и связи клиента — лишние запросы ради одного ИНН.
 */
export const refreshInnFromBitrix =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const target = getInnTarget(getState());
        if (!target) return;
        try {
            const bitrix = Bitrix.getService();
            const row = (
                target.entity === 'company'
                    ? await bitrix.company.get(target.entityId)
                    : target.entity === 'deal'
                      ? await bitrix.deal.get(target.entityId)
                      : // У лида get отдаёт ответ целиком, запись — в result.
                        (await bitrix.lead.get(target.entityId))?.result
            ) as unknown as Record<string, unknown> | null;
            const raw = row?.[target.ufKey];
            const value = typeof raw === 'string' ? raw.trim() : '';
            if (value && value !== getCurrentInn(getState())) {
                dispatch(innActions.syncValue({ value }));
            }
        } catch (error) {
            console.error('refreshInnFromBitrix error', error);
        }
    };
