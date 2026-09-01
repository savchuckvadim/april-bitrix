import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import { countHiddenChecklistQuestion } from '@/modules/shared/metrics/lib/business-metrics';

import type { ChecklistDef } from '../type/call-checklist.type';
import { collectHiddenChecklistQuestions } from '../lib/checklist-hidden';
import { selectChecklistRows } from '../lib/checklist-selectors';

/**
 * Отчёт о СПРЯТАННЫХ вопросах анкеты — самая ценная метрика захода.
 *
 * Резолв вопроса молча возвращает «не показывать», и владелец уже потерял на
 * этом час: включил вопрос на портале, вопрос не появился, причина известна
 * только коду. Теперь причина уезжает счётчиком с меткой, и «на портале X
 * вопросы прячутся из-за отсутствия поля в слепке» видно на графике, а не
 * в чужой консоли.
 *
 * ПОЧЕМУ ЗДЕСЬ, А НЕ В РЕЗОЛВЕ. Резолв — чистая функция и зовётся
 * селекторами по несколько раз на рендер; счётчик внутри неё дал бы поток
 * запросов с каждой перерисовки и сжёг бы буфер сборщика. Резолв поэтому
 * только НАЗЫВАЕТ причину (см. resolveChecklistFieldDetailed), а считает
 * этот thunk — в момент, когда анкета показана менеджеру.
 *
 * ДЕДУПЛИКАЦИЯ ЗА СЕССИЮ. Момент показа наступает не однажды: карточка
 * пересчитывает вопросы, когда догружаются строки сущностей (базовая сделка
 * во встройке-компании), а модалка открывается по разу на каждую отправку.
 * Считать каждое появление значило бы мерить активность менеджера, а не
 * поломку портала. Ключ дедупликации — «вопрос + причина»: сменившаяся
 * причина (строка приехала, а поля в слепке всё равно нет) это уже другой
 * диагноз, и он обязан быть виден.
 *
 * ПОЧЕМУ ДО ГОТОВНОСТИ ДАННЫХ МЫ МОЛЧИМ (M8 из разбора). Обе причины
 * «поля нет на портале» и «нет носителя» вычисляются по слепку портала и по
 * строкам сущностей — а и то, и другое приезжает АСИНХРОННО и позже
 * каталога анкет. Слепок стартует в appInit без await и доходит своим
 * листенером; строка базовой сделки во встройке-компании догружается лениво
 * (`ensureChecklistBaseDeal`). Отчитайся мы в этот момент — на ИСПРАВНОМ
 * портале каждая сессия слала бы пачку ложных диагнозов, неотличимых от
 * настоящей поломки, и дедупликация фиксировала бы ложь до конца сессии.
 * Поэтому отчёт откладывается до готовности данных (`isHiddenChecklistReportReady`),
 * а вызывающий эффект пересчитывается, когда готовность наступает.
 */

/** Что уже отчитано в этой сессии: `answerKey:reason`. */
const reportedKeys = new Set<string>();

/** Сброс дедупликации — только для тестов. */
export const resetHiddenChecklistReportForTests = (): void => {
    reportedKeys.clear();
};

/**
 * Данные, по которым решается «вопрос спрятан», приехали целиком — считать
 * можно, и диагноз будет настоящим.
 *
 * Два условия, и оба сняты с реальных ложных срабатываний:
 *
 * 1. СЛЕПОК ПОРТАЛА. При `portal === null` встроенный вопрос не находит поля
 *    ни у одной сущности и получает причину `field-not-in-portal` — то есть
 *    ровно тот диагноз, ради которого метрика заведена, только ложный.
 *
 * 2. ДОГРУЗКА БАЗОВОЙ СДЕЛКИ. Во встройке-компании сделки в сторе нет, её
 *    строку тянет `ensureChecklistBaseDeal` по `predict.baseDealId`. Пока
 *    строки нет, crm-вопросы сделки не имеют носителя → `no-carrier`, и это
 *    не поломка портала, а наша собственная ленивая загрузка. Ждём и
 *    предикта (он приносит `baseDealId`), и самой загрузки — до её ИСХОДА,
 *    успешного или нет: провал загрузки означает, что носителя действительно
 *    нет, и такой диагноз честный.
 *
 * Экспортируется, потому что тем же условием пользуется эффект показа
 * (`useChecklistBaselineCapture`): попав в его зависимости, оно заставляет
 * пересчитать отчёт РОВНО ТОГДА, когда данные доехали.
 */
export const isHiddenChecklistReportReady = (state: RootState): boolean => {
    if (!state.portal.portal) return false;
    if (state.app.bitrix.deal) return true;
    // Предикт ещё едет — `baseDealId` может появиться следующим действием.
    if (state.stagePredict.status === 'loading') return false;

    const baseDealId = state.stagePredict.result?.baseDealId;
    if (!baseDealId) return true; // догружать нечего

    const { id, status } = state.callChecklist.baseDeal;

    return id === baseDealId && (status === 'ready' || status === 'error');
};

export const reportHiddenChecklistQuestions =
    (defs: ChecklistDef[]) =>
    (_dispatch: AppDispatch, getState: AppGetState): void => {
        const state = getState();

        // Данные ещё едут — молчим совсем. Не «отчитаться с оговоркой»:
        // ложный диагноз в счётчике неотличим от настоящего, а молчание
        // ничего не теряет — эффект показа позовёт нас снова, когда данные
        // приедут (см. isHiddenChecklistReportReady).
        if (!isHiddenChecklistReportReady(state)) return;

        const portal = state.portal.portal;
        const rows = selectChecklistRows(state);
        const domain = state.app.domain;

        for (const def of defs) {
            for (const question of collectHiddenChecklistQuestions(
                def,
                portal,
                rows,
            )) {
                const key = `${question.answerKey}:${question.reason}`;
                if (reportedKeys.has(key)) continue;
                reportedKeys.add(key);
                countHiddenChecklistQuestion({
                    reason: question.reason,
                    channel: question.channel,
                    domain,
                });
            }
        }
    };
