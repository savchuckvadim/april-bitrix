import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { buildPortalFieldPayload } from '../lib/check-presentation.persist';

/**
 * Ответы опросника — в поля Битрикса.
 *
 * До этого опросник был декоративным: ответы жили в сторе и не уезжали НИКУДА
 * — ни в flow-payload, ни в портал. Менеджер заполнял «Хвост» и «Пять К», а
 * назавтра их было негде прочитать.
 *
 * Пишем во все сущности контекста сразу — компанию, сделку и лид. Отчитываются
 * по одной из них, но читают потом из любой: руководитель смотрит компанию,
 * следующий менеджер открывает сделку, а по холодному звонку с заявкой живой
 * остаётся только лид. Поля одноимённые (реестр PBX_SALES_EVENT_FIELDS), так
 * что «последняя проведённая презентация» лежит везде одинаковая.
 *
 * Пишем ТОЛЬКО то, под что на портале есть поле: ключи резолвятся из слепка,
 * никаких `UF_CRM_<КОД>` наугад.
 */
export const persistCheckPresentation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const portal = state.portal.portal;
        const answers = state.afterPresentation.checkPresentation.committed;

        if (!portal || !Object.keys(answers).length) return;

        const { company, deal, lead } = state.app.bitrix;
        const bitrix = Bitrix.getService();

        const targets = [
            {
                id: company?.ID,
                fields: portal.company?.bitrixfields,
                update: (id: number, payload: Record<string, string>) =>
                    bitrix.company.update(id, payload as never),
            },
            {
                id: deal?.ID,
                // Поля сделки в слепке лежат под bitrixDeal — историческое имя.
                fields: portal.bitrixDeal?.bitrixfields,
                update: (id: number, payload: Record<string, string>) =>
                    bitrix.deal.update(id, payload as never),
            },
            {
                id: lead?.ID,
                fields: portal.lead?.bitrixfields,
                update: (id: number, payload: Record<string, string>) =>
                    bitrix.lead.update(id, payload as never),
            },
        ];

        for (const target of targets) {
            const entityId = Number(target.id ?? 0);
            if (!entityId) continue;

            const payload = buildPortalFieldPayload({
                answers,
                resolveKey: code => findUfKey(target.fields, code),
            });
            if (!Object.keys(payload).length) continue;

            try {
                await target.update(entityId, payload);
            } catch (error) {
                // Опросник уже подтверждён — падать отчётом из-за одной
                // сущности нельзя, но и молчать про потерю данных тоже.
                console.error(
                    'persistCheckPresentation error',
                    entityId,
                    error,
                );
            }
        }
    };
