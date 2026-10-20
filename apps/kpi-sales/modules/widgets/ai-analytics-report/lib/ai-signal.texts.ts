import type { AiHint } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { formatAiFullDate } from '@/modules/entities/ai-analytics/lib/ai-period-label.util';
import { AI_NOT_ANALYZED_REASON, type AiNotAnalyzedReason } from './ai-not-analyzed.util';

/*
 * Тексты строки таблицы сигналов: «разобрано N из M» с подсказкой,
 * «AI-разборов нет» с причиной, подсказки кнопок «Стиль», «Досье»,
 * «Не согласен». Даты и пороги — из ответов бэка, не литералы.
 */

export const AI_ANALYZED_TEXT = {
    label: (analyzed: number, total: number) => `разобрано ${analyzed} из ${total}`,
    hint: (comparableFrom: string | null): AiHint => ({
        title: 'Разобрано',
        lines: [
            comparableFrom
                ? `Первое число — звонки, которые AI разобрал и которые можно сравнивать между собой: с ${formatAiFullDate(comparableFrom)}, после смены правил разбора, и только у сотрудников из пилота.`
                : 'Первое число — звонки, которые AI разобрал и которые можно сравнивать между собой: только у сотрудников из пилота и не короче порога длительности.',
            'Второе — все звонки сотрудника за период, которые дошли до AI, включая короткие и те, где разбор не удался. Большая разница — это нормально, пока пилот идёт не на всех.',
        ],
    }),
    none: 'AI-разборов нет',
    noneWithCrm: (crmCalls: number) => `AI-разборов нет · в CRM ${crmCalls} звонков`,
    reason: {
        [AI_NOT_ANALYZED_REASON.BEFORE_PIPELINE]: (analysisSince: string): AiHint => ({
            title: 'Разбор ещё не шёл',
            lines: [
                `В этом периоде AI-разбор звонков на портале ещё не шёл: он идёт с ${formatAiFullDate(analysisSince)}.`,
                'Выберите период позже.',
            ],
        }),
        [AI_NOT_ANALYZED_REASON.OUT_OF_PILOT]: {
            title: 'Сотрудник не в пилоте',
            lines: [
                'Сотрудник не в пилоте AI-разбора, его звонки не разбираются.',
                'Расширить пилот — попросите разработчика.',
            ],
        },
        [AI_NOT_ANALYZED_REASON.OUT_OF_SALES]: {
            title: 'Не в отделе продаж',
            lines: [
                'Разбираются только звонки сотрудников отдела продаж, а этого сотрудника в отделе продаж по структуре нет.',
                'Проверьте, что сотрудник состоит в отделе продаж в структуре Bitrix24.',
            ],
        },
        [AI_NOT_ANALYZED_REASON.SHORT]: (minDurationSec: number): AiHint => ({
            title: 'Звонки короче порога',
            lines: [
                `Все звонки короче ${minDurationSec} сек, такие AI не разбирает.`,
                'Порог длительности меняет разработчик — попросите его.',
            ],
        }),
        [AI_NOT_ANALYZED_REASON.OTHER]: {
            title: 'Звонки не дошли до разбора',
            lines: [
                'Звонки есть в CRM, но до разбора не дошли.',
                'Смотрите пункт «звонки вне разбора» в блоке «Готовность витрины».',
            ],
        },
    },
} as const;

/** Подсказка причины «AI-разборов нет» по коду; числа — из настроек. */
export const aiNotAnalyzedHint = (
    reason: AiNotAnalyzedReason,
    details: { analysisSince: string | null; minDurationSec: number | null },
): AiHint => {
    switch (reason) {
        case AI_NOT_ANALYZED_REASON.BEFORE_PIPELINE:
            return AI_ANALYZED_TEXT.reason[reason](details.analysisSince ?? '');
        case AI_NOT_ANALYZED_REASON.SHORT:
            return AI_ANALYZED_TEXT.reason[reason](details.minDurationSec ?? 0);
        default:
            return AI_ANALYZED_TEXT.reason[reason];
    }
};

/** Подсказки кнопок строки. */
export const AI_SIGNAL_ROW_BUTTON = {
    style: {
        label: 'Стиль',
        hint: {
            title: 'Стиль менеджера',
            lines: [
                'Как менеджер ведёт разговор по сравнению с коллегами: больше говорит или слушает, быстро ли переходит к цене. Это не оценка — хорошо бывает и так, и так.',
                'Нужно не меньше 40 разобранных звонков. Открывает страницу сотрудника на подвкладке «Стиль».',
            ],
        },
    },
    dossier: {
        label: 'Досье',
        hint: {
            title: 'Страница сотрудника',
            lines: [
                'Всё о менеджере за последние месяцы на одной странице: стаж и уровень, оценки по месяцам и неделям, план и факт, возражения клиентов, отметки руководителя.',
                'Открывает страницу сотрудника с разделом «AI-аналитика».',
            ],
        },
    },
    disagree: {
        title: 'Не согласен с разбором',
        lines: [
            'Если оценки или сигнал в этой строке не совпадают с тем, что вы слышите в звонках, напишите почему.',
            'Несогласие появится в «Повестке планёрки», и мы проверим разбор.',
        ],
    },
} as const;
