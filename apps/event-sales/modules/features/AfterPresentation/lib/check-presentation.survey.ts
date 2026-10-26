import { FIVE_K_TEMPLATES, XVOST_TEMPLATES } from '@workspace/event-sales-flow';

import { findUfKey } from '@workspace/pbx';
import type { RootState } from '@/modules/app/model/store';
// Форма блока — из сгенерированного DTO (ре-маппинг живёт в model потока).
import type { EvPresentationSurvey } from '@/modules/processes/event/model';
import type { CheckPresentationValue } from '../type/check-presentation-type';
import {
    buildFiveKSummary,
    buildXvostSummary,
    translateSurveyCodes,
} from './check-presentation.persist';
import { selectIsCheckPresentationApplicable } from './check-presentation.selectors';

/**
 * Ответы опросника «5К»/«Хвост» — В PAYLOAD ОТЧЁТА.
 *
 * Опросник — такой же ответ при отчёте, как портальная анкета канала `smart`:
 * он едет ВМЕСТЕ с отчётом, а раскладывает его по лиду, сделкам, компании и
 * смартам сам поток. Только поток знает, какие сущности он родил — включая
 * спонтанную сделку презентации, которой на момент ответа ещё не существует.
 *
 * Что это чинит. Отдельный серверный запрос ручки приходил своим порядком:
 * отправили опросник ПОСЛЕ отчёта — снимок для смарта читал пустоту, а
 * спонтанную сделку приходилось «женить» с ответами через rendezvous в
 * Redis. Ответ внутри payload делает и то и другое ненужным: он у потока в
 * руках с первой строчки, и фолбэк «читаем с лида» больше никому не нужен.
 *
 * Фрейм-запись (CheckPresentationPersistThunk) остаётся и работает
 * параллельно: она даёт мгновенную видимость в карточке клиента и
 * покрывает случай «заполнил опросник и не отправил отчёт».
 */

/**
 * Блок `presentation.survey` контракта отправки: формы и семантика — ровно
 * те же, что у `values` легаси-ручки `/presentation-survey` (один смысл —
 * один формат). Блок опционален целиком: не заполняли — его нет вовсе, и
 * поток работает как раньше.
 */
export type CheckPresentationSurvey = EvPresentationSurvey;

const FIVE_K_CODES = new Set(FIVE_K_TEMPLATES.map(t => t.code));
const XVOST_CODES = new Set(XVOST_TEMPLATES.map(t => t.code));

/**
 * Непустой текстовый ответ; всё прочее — не ответ.
 *
 * Пустое в payload не уезжает: бэк отличает «не прислали» от «прислали
 * пусто», и пустая строка стёрла бы поле, которое мог заполнить кто-то
 * другой — ровно то же правило, что у фрейм-записи (`toPortalValue`).
 * Блок с подвопросами уже собран в одну строку слайсом
 * (`composeSurveyBlockValue`) — здесь он неотличим от обычного текста.
 */
const asAnswerText = (
    value: CheckPresentationValue | undefined,
): string | null => {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text || null;
};

/** Ответы блока по префиксу кода реестра; пустых в блоке не бывает. */
const pickBlock = (
    answers: Record<string, CheckPresentationValue>,
    codes: ReadonlySet<string>,
): Record<string, string> => {
    const block: Record<string, string> = {};
    for (const [code, value] of Object.entries(answers)) {
        if (!codes.has(code)) continue;
        const text = asAnswerText(value);
        if (text) block[code] = text;
    }
    return block;
};

/**
 * Ответы опросника → блок `survey` payload'а. Чистая функция: на вход —
 * ответы КАК ИХ ХРАНИТ опросник (коды вопросов) и готовые сводки «Пять К»
 * и «Хвоста» (обе собираются из блоков, руками их не пишут).
 *
 * Коды переводятся здесь же (`xo_*` → `op_talk_*`): дальше этой границы
 * коды опросника не живут — ни фрейм-запись, ни бэк их не знают. Ключи вне
 * блоков контракта (даты подхода) в payload не едут: у ручки их тоже не
 * было, их пишет фрейм-запись.
 */
export const buildCheckPresentationSurvey = (
    answers: Record<string, CheckPresentationValue>,
    fiveKSummary: string | null,
    xvostSummary: string | null = null,
): CheckPresentationSurvey | undefined => {
    const portalAnswers = translateSurveyCodes(answers);

    const fiveK = pickBlock(portalAnswers, FIVE_K_CODES);
    const talk = pickBlock(portalAnswers, XVOST_CODES);
    const xvost = asAnswerText(xvostSummary ?? undefined);

    const survey: CheckPresentationSurvey = {
        ...(Object.keys(fiveK).length ? { fiveK } : {}),
        ...(Object.keys(talk).length ? { talk } : {}),
        ...(xvost ? { xvost } : {}),
        ...(fiveKSummary ? { fiveKSummary } : {}),
    };

    return Object.keys(survey).length ? survey : undefined;
};

/**
 * Ответы анкеты, которые УЖЕ лежат на сущности: база сводки. «Пять К» живут
 * на лиде, блоки «Хвоста» — на сделке.
 *
 * При частичном повторном заполнении (ответили на два вопроса из девяти)
 * сводка иначе теряла бы прошлые семь ответов и расходилась с полями.
 * Читаем по слепку портала — никаких `UF_CRM_<КОД>` наугад.
 */
const selectStoredAnswers = (
    state: RootState,
    entity: 'lead' | 'deal',
): Record<string, string> => {
    const row = (entity === 'lead'
        ? state.app.bitrix.lead
        : state.app.bitrix.deal) as unknown as Record<string, unknown> | null;
    if (!row) return {};

    const fields =
        entity === 'lead'
            ? state.portal.portal?.lead?.bitrixfields
            : state.portal.portal?.bitrixDeal?.bitrixfields;
    const stored: Record<string, string> = {};
    for (const item of state.afterPresentation.checkPresentation.items) {
        const key = findUfKey(fields, item.code);
        const raw = key ? row[key] : null;
        if (typeof raw === 'string' && raw.trim()) stored[item.code] = raw;
    }
    return stored;
};

/** Подтверждённые ответы поверх записанных и подписи блоков анкеты. */
const summaryInput = (
    state: RootState,
    entity: 'lead' | 'deal',
): {
    answers: Record<string, CheckPresentationValue>;
    titleByCode: Record<string, string>;
} => {
    const { items, committed } = state.afterPresentation.checkPresentation;
    const filled = Object.fromEntries(
        Object.entries(committed).filter(([, value]) =>
            typeof value === 'string' ? value.trim() : value != null,
        ),
    );
    return {
        answers: { ...selectStoredAnswers(state, entity), ...filled },
        titleByCode: Object.fromEntries(
            items.map(item => [item.code, `${item.title}:`]),
        ),
    };
};

/**
 * Сводка «Пять К» по подтверждённым ответам поверх уже записанных на лид.
 *
 * ОДНА на оба писателя: и фрейм-запись, и payload отчёта пишут её в
 * op_presentation_5k, и разъезжаться им нельзя — иначе то, что видит
 * менеджер сразу после опросника, отличалось бы от того, что положит поток.
 *
 * Пустые ответы в мерж не идут: стёртое поле опросника на портал НЕ
 * пишется, значит и сводка обязана сохранить прошлую строку. Семантика
 * «стереть нельзя, только перезаписать».
 */
export const selectFiveKSummary = (state: RootState): string | null => {
    const { answers, titleByCode } = summaryInput(state, 'lead');
    return buildFiveKSummary(answers, titleByCode);
};

/**
 * Сводный «Хвост» по подтверждённым блокам поверх уже записанных на сделку
 * — те же правила и тот же общий писатель, что у «Пять К».
 */
export const selectXvostSummary = (state: RootState): string | null => {
    const { answers, titleByCode } = summaryInput(state, 'deal');
    return buildXvostSummary(answers, titleByCode);
};

/**
 * Блок `survey` для payload отправки; опросник не заполняли — undefined.
 *
 * Гейт тот же, что у хвоста в комментарии
 * (`selectIsCheckPresentationApplicable`): опросник неприменим к этому
 * событию — ответы прошлой презентации не подмешиваются в чужой отчёт.
 * Уезжает ПОДТВЕРЖДЁННЫЙ снимок (committed), а не рабочая копия формы: в
 * поля клиента ушёл он же.
 */
export const selectCheckPresentationSurvey = (
    state: RootState,
): CheckPresentationSurvey | undefined => {
    if (!selectIsCheckPresentationApplicable(state)) return undefined;

    return buildCheckPresentationSurvey(
        state.afterPresentation.checkPresentation.committed,
        selectFiveKSummary(state),
        selectXvostSummary(state),
    );
};
