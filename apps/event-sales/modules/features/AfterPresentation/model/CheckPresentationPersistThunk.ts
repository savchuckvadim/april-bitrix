import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    buildFiveKSummary,
    buildPortalFieldPayload,
} from '../lib/check-presentation.persist';

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

        // Сводное «Пять К» собирается из ответов: отдельные op_5k_* живут
        // только на лиде, а сводка доезжает и до сделки.
        //
        // База — то, что УЖЕ лежит на лиде: при частичном повторном
        // заполнении (ответили на два вопроса из девяти) сводка иначе
        // теряла бы прошлые семь ответов и расходилась с op_5k_* полями.
        const items = state.afterPresentation.checkPresentation.items;
        const titleByCode = Object.fromEntries(
            items.map(item => [item.code, `${item.title}:`]),
        );
        const leadRow = state.app.bitrix.lead as unknown as Record<
            string,
            unknown
        > | null;
        const baseAnswers: Record<string, string> = {};
        if (leadRow) {
            for (const item of items) {
                const key = findUfKey(portal.lead?.bitrixfields, item.code);
                const raw = key ? leadRow[key] : null;
                if (typeof raw === 'string' && raw.trim()) {
                    baseAnswers[item.code] = raw;
                }
            }
        }
        // Пустые ответы в мерж не идут: стёртое поле опросника НЕ пишется
        // на портал (payload пустоту пропускает), значит и сводка обязана
        // сохранить прошлую строку — иначе op_presentation_5k расходился бы
        // с op_5k_* полями. Семантика «стереть нельзя, только перезаписать».
        const filledAnswers = Object.fromEntries(
            Object.entries(answers).filter(([, value]) =>
                typeof value === 'string' ? value.trim() : value != null,
            ),
        );
        const summary = buildFiveKSummary(
            { ...baseAnswers, ...filledAnswers },
            titleByCode,
        );
        const fullAnswers = summary
            ? { ...answers, op_presentation_5k: summary }
            : answers;

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
                answers: fullAnswers,
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
