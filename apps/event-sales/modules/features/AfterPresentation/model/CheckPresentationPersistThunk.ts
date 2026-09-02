import { Bitrix } from '@workspace/bitrix';
import { findPortalField, findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import { isBaseSalesDeal } from '@/modules/entities/RelatedCrm/lib/deal-category';
import { isOwnDeal } from '@/modules/entities/RelatedCrm/lib/deal-ownership';
import {
    buildPortalFieldPayload,
    hasWritablePortalAnswers,
    translateSurveyCodes,
} from '../lib/check-presentation.persist';
import { selectFiveKSummary } from '../lib/check-presentation.survey';

/** Чем закончилась запись ответов: по каждой цели — приняла или нет. */
export interface CheckPresentationPersistResult {
    /** Целей, которым реально было что записать. */
    attempted: number;
    /** Не принявшие ответы цели («deal:123») — для сообщения и разбора. */
    failed: string[];
    /**
     * Пробовали писать — и ни одна цель не приняла. Портал ОТКАЗАЛ: сеть,
     * права, удалённая сущность. Повтор имеет смысл, поэтому это блокер
     * (см. submitCheckPresentation).
     */
    isTotalFailure: boolean;
    /**
     * Цели ЕСТЬ, писать было что — а НЕКУДА: слепок портала в браузере не
     * знает ни одного поля опросника (протух или полей не ставили —
     * инцидент todo3108 №1). Повтор из окна не поможет НИКОГДА: слепок за
     * время нажатия «Сохранить» не обновится. Не блокер — предупреждение:
     * ответы уедут в payload отчёта, и поток запишет их по СВОЕМУ слепку.
     */
    nothingWritten: boolean;
    /**
     * Целей нет ВООБЩЕ: ни компании, ни сделки, ни лида в контексте
     * (встройка без привязки к CRM). Это ДРУГАЯ беда, чем `nothingWritten`,
     * и путать их нельзя: там поля не нашлись в живой карточке — здесь
     * карточки нет вовсе, и «полей опросника нет в карточке клиента»
     * отправило бы менеджера искать несуществующую проблему в настройках.
     */
    noTargets: boolean;
}

const EMPTY_RESULT: CheckPresentationPersistResult = {
    attempted: 0,
    failed: [],
    isTotalFailure: false,
    nothingWritten: false,
    noTargets: false,
};

/**
 * Ответы опросника — в поля Битрикса ПРЯМО ИЗ ФРЕЙМА.
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
 *
 * ЗАЧЕМ ОНА НУЖНА, если ответы теперь уезжают и в payload отчёта
 * (`selectCheckPresentationSurvey`). Две причины, обе про здесь и сейчас:
 * ответы видно в карточке клиента СРАЗУ, не дожидаясь исполнения потока; и
 * «заполнил опросник, а отчёт не отправил» — обычный день менеджера, поток
 * в этом случае не запускается вовсе. Серверного дубля (ручка
 * `/presentation-survey`) больше нет: серверный контур — сам поток отчёта.
 *
 * ОСТАТОЧНЫЙ РИСК. Слепок портала в браузере может протухнуть (поля
 * установили после того, как слепок лёг в кэш) — тогда фрейм-записи некуда
 * писать. Если при этом отчёт так и не отправят, ответы не попадут на
 * портал вовсе. Раньше этот край закрывала серверная ручка; закрывать его
 * отдельным контуром снова — держать трёх писателей одного значения, ровно
 * ту болезнь, от которой ушли. Провал записи виден менеджеру честно (см.
 * итог ниже и submitCheckPresentation), а отправленный отчёт довозит
 * ответы своим путём — поэтому «некуда писать» отправку НЕ запирает:
 * запереть её значило бы отнять единственный оставшийся путь ответов.
 *
 * Возвращает итог по каждой цели: раньше ошибка записи уходила в
 * `console.error`, отправка шла дальше, и менеджер был уверен, что ответы
 * сохранены. Теперь решение принимает вызывающий (см. submitCheckPresentation).
 */
export const persistCheckPresentation =
    () =>
    async (
        dispatch: AppDispatch,
        getState: AppGetState,
    ): Promise<CheckPresentationPersistResult> => {
        const state = getState();
        const portal = state.portal.portal;
        const answers = state.afterPresentation.checkPresentation.committed;

        if (!portal || !Object.keys(answers).length) return EMPTY_RESULT;

        // Сводное «Пять К» собирается из ответов поверх уже записанных на
        // лид: отдельные op_5k_* живут только на лиде, а сводка доезжает и
        // до сделки. Та же сводка уходит в payload отчёта — писатель у неё
        // общий, чтобы значения не разъезжались.
        const items = state.afterPresentation.checkPresentation.items;
        const summary = selectFiveKSummary(state);
        const fullAnswers = summary
            ? { ...answers, op_presentation_5k: summary }
            : answers;
        // Дальше живут только коды ПОЛЕЙ: xo_* опросника → op_talk_* реестра
        // (иначе «Разговор» не резолвится фрейм-записью).
        const portalAnswers = translateSurveyCodes(fullAnswers);

        const { company, deal, lead } = state.app.bitrix;
        const bitrix = Bitrix.getService();

        /*
         * Сделка-цель: сделка контекста, а из встройки-компании (в сторе
         * сделки нет) — открытая ОСНОВНАЯ сделка из связей клиента. Без
         * фолбэка deal-only поля хвоста (op_xvost_*) из опросника терялись
         * бы целиком: на компании и лиде их нет по реестру.
         *
         * Только СВОЯ (правило владения 2508): чужая открытая «текущей» не
         * становится, и данные форм под неё не подставляются.
         */
        const currentUserId = Number(state.app.bitrix.user?.ID) || null;
        const fallbackBaseDealId = state.relatedCrm.details?.deals?.find(
            related =>
                !related.closed &&
                isBaseSalesDeal(related) &&
                isOwnDeal(related, currentUserId),
        )?.id;
        const dealTargetId = deal?.ID ?? fallbackBaseDealId;

        const targets = [
            {
                kind: 'company',
                id: company?.ID,
                fields: portal.company?.bitrixfields,
                update: (id: number, payload: Record<string, string | string[]>) =>
                    bitrix.company.update(id, payload as never),
            },
            {
                kind: 'deal',
                id: dealTargetId,
                // Поля сделки в слепке лежат под bitrixDeal — историческое имя.
                fields: portal.bitrixDeal?.bitrixfields,
                update: (id: number, payload: Record<string, string | string[]>) =>
                    bitrix.deal.update(id, payload as never),
            },
            {
                kind: 'lead',
                id: lead?.ID,
                fields: portal.lead?.bitrixfields,
                update: (id: number, payload: Record<string, string | string[]>) =>
                    bitrix.lead.update(id, payload as never),
            },
        ];

        const typeByCode = translateSurveyCodes(
            Object.fromEntries(items.map(item => [item.code, item.type])),
        );

        let attempted = 0;
        /** Живых сущностей в контексте — отдельно от «нашлись ли поля». */
        let liveTargets = 0;
        const failed: string[] = [];

        for (const target of targets) {
            const entityId = Number(target.id ?? 0);
            if (!entityId) continue;
            liveTargets += 1;

            const payload = buildPortalFieldPayload({
                answers: portalAnswers,
                resolveKey: code => findUfKey(target.fields, code),
                typeByCode,
                // Справочник носителя: коды вариантов общие, id — свои.
                resolveOptions: code =>
                    findPortalField(target.fields, code)?.items ?? null,
            });
            if (!Object.keys(payload).length) continue;

            attempted += 1;
            try {
                await target.update(entityId, payload);
            } catch (error) {
                failed.push(`${target.kind}:${entityId}`);
                reportFrontError({
                    place: 'check-presentation.persist',
                    message:
                        error instanceof Error ? error.message : String(error),
                    context: { entity: target.kind, entityId },
                });
            }
        }

        /*
         * Итог честный по факту записи — и РАЗНЫЙ у трёх непохожих бед.
         *
         * 1. Все цели отказали (`isTotalFailure`) — портал сказал «нет»:
         *    сеть, права, удалённая сущность. Повтор осмыслен, окно держим.
         * 2. Цели есть, поля не нашлись (`nothingWritten`) — слепок портала
         *    в браузере не знает ни одного ключа опросника. Повтор
         *    бессмыслен: слепок за секунду не поменяется. Мягкая деградация
         *    по слепку (правило репо) — предупредить и пропустить.
         * 3. Целей нет вовсе (`noTargets`) — в контексте ни компании, ни
         *    сделки, ни лида. Раньше это поднимало флаг №2, и менеджер
         *    видел «Полей опросника нет в карточке клиента» при живом
         *    слепке — сообщение звало проверять настройки полей там, где
         *    проверять нечего.
         *
         * Раньше (до появления этих флагов) `attempted === 0` вообще ничего
         * не значило: результат отличался от успеха только по `failed`, и
         * все три беды выглядели как «сохранено».
         *
         * Писать было нечего (пустой опросник) — не беда вовсе.
         */
        const hasValuesToWrite = hasWritablePortalAnswers(
            portalAnswers,
            typeByCode,
        );

        return {
            attempted,
            failed,
            isTotalFailure: attempted > 0 && failed.length === attempted,
            nothingWritten:
                liveTargets > 0 && attempted === 0 && hasValuesToWrite,
            noTargets: liveTargets === 0 && hasValuesToWrite,
        };
    };
