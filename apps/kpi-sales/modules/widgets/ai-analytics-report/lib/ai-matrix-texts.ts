import type { AiBucket } from '@/modules/entities/ai-analytics/model';
import type { AiCallSectionCode } from '@/modules/entities/ai-analytics/lib/ai-call-sections.data';
import { formatAiDay, type AiHint } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { formatAiFullDate } from '@/modules/entities/ai-analytics/lib/ai-period-label.util';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import { formatAiScore } from '@/modules/entities/ai-analytics/lib/ai-score.util';

/*
 * Тексты блоков «AI: типы звонков» и «AI: разделы оценки по типу»: легенда,
 * подсказки шапок, пустые состояния с причиной и действием, подписи
 * графиков и рейтингов. Правила владельца: по-русски, без кодов и формул,
 * у каждой подсказки есть «что сделать». Пороги объёма и длительности —
 * из ответов бэка (параметры), не вписаны числами.
 */

const EMPLOYEE_FORMS = ['сотрудник', 'сотрудника', 'сотрудников'] as const;
const CALL_FORMS = ['звонок', 'звонка', 'звонков'] as const;

/** «с 25.09 длиннее 300 сек» — хвост легенды; без дат и порога — пусто. */
const callsScopeTail = (
    comparableFrom: string | null,
    minDurationSec: number | null,
): string =>
    [
        comparableFrom ? `с ${formatAiDay(comparableFrom)}` : null,
        minDurationSec ? `длиннее ${minDurationSec} сек` : null,
    ]
        .filter(Boolean)
        .join(' ');

export const AI_MATRIX_BLOCK_TEXT = {
    legend: {
        text: (comparableFrom: string | null, minDurationSec: number | null) => {
            const tail = callsScopeTail(comparableFrom, minDurationSec);
            return [
                'Крупно — средняя оценка AI из 10',
                'мелко — сколько звонков разобрано',
                'цвет — выше/ниже среднего по отделу',
                '«ещё N» — до оценки не хватает разборов',
                ...(tail ? [`считаются звонки ${tail}`] : []),
            ].join(' · ');
        },
        hint: (
            minN: number,
            okN: number,
            comparableFrom: string | null,
            minDurationSec: number | null,
        ): AiHint => ({
            title: 'Как читать таблицу',
            lines: [
                'Крупно — средняя оценка AI из 10 по разобранным звонкам сотрудника, мелко — по скольким звонкам она посчитана.',
                `Оценка появляется от ${minN} разборов, надёжна от ${okN}: до этого стоит пометка «предварительно». Цвет — выше или ниже среднего по отделу (строка «Итого по отделу»).`,
                comparableFrom
                    ? `Учитываются звонки сотрудников в разборе${minDurationSec ? ` длиннее ${minDurationSec} сек` : ''}, сделанные с ${formatAiFullDate(comparableFrom)}: более ранние разобраны старой версией и в оценку не входят.`
                    : `Учитываются звонки сотрудников в разборе${minDurationSec ? ` длиннее ${minDurationSec} сек` : ''}.`,
                'Что сделать: смотрите красные ячейки — это темы для разбора с сотрудником; клик по заголовку вида звонка открывает разбор по этому виду.',
            ],
        }),
    },
    types: {
        title: 'AI: типы звонков',
        loading: 'Считаем срез по типам…',
        mode: {
            label: 'Колонки',
            buckets: 'Корзины',
            types: 'По типам',
            hint: {
                title: 'Корзины или по типам',
                lines: [
                    'Корзины — три этапа разговора: «Контакт» (холодный, заявка с сайта, звонок), «Презентация», «Закрытие» (доработка, решение, оплата). Разборы видов складываются, поэтому оценка появляется у большинства.',
                    'По типам — каждый вид звонка своей колонкой: точнее, но разборов на ячейку меньше.',
                ],
            },
        },
        bucketHint: {
            contact:
                'Контакт: холодные звонки, заявки с сайта и обычные звонки — первый разговор с клиентом. Оценка — средняя по всем разборам этих видов, мелко — сколько их разобрано.',
            presentation:
                'Презентация: показ продукта под задачи клиента. Оценка — средняя по разобранным презентациям, мелко — сколько их разобрано.',
            closing:
                'Закрытие: доработка, решение и оплата — разговоры, которые ведут к сделке. Оценка — средняя по их разборам, мелко — сколько их разобрано.',
        } satisfies Record<AiBucket, string>,
        bucketAction: 'Переключите «По типам», чтобы увидеть каждый вид отдельно.',
        typeHint: (label: string) =>
            `${label}: средняя оценка AI из 10 по разобранным звонкам этого вида, мелко — сколько их разобрано. Нажмите на заголовок, чтобы открыть разбор по этому виду: сильные и слабые разделы и совет.`,
        salesHint:
            'Продажи сотрудника за период из раздела «Финансы». К виду звонка не относятся — стоят рядом, чтобы сопоставить качество разговоров и результат.',
    },
    sections: {
        title: 'AI: разделы оценки по типу',
        loading: 'Считаем срез по типам…',
        typeFilter: 'Тип звонка',
        allTypes: 'Все типы',
        allTypesHint:
            'Все типы — звонки этапов продаж вместе: разборы разделов складываются по видам. Приглашения на мероприятие и прочие звонки считаются отдельно — выберите их вид.',
        sectionDescription: {
            GREETING: 'как менеджер начинает разговор: представление, цель звонка, контакт с собеседником',
            NEEDS: 'насколько полно выяснены задачи и ситуация клиента',
            PRESENTATION: 'привязан ли показ продукта к задачам клиента',
            OBJECTIONS: 'как отработаны сомнения и возражения клиента',
            PRICE: 'насколько хорошо менеджер обосновывает цену',
            CLOSING: 'есть ли договорённость о следующем шаге с датой',
            REFUSAL: 'как менеджер ведёт себя при отказе: оставляет ли возможность вернуться',
        } satisfies Record<AiCallSectionCode, string>,
        sectionDescriptionFallback: 'средняя оценка AI из 10 по этому разделу',
        sectionHint: (title: string, description: string, relevance: number | null) =>
            [
                `${title}: ${description}.`,
                relevance === null
                    ? null
                    : `Для этого вида звонка раздел важен на ${relevance} %.`,
                'Оценивается только в звонках, где раздел был уместен. Слабый раздел — тема для разбора с сотрудником.',
            ]
                .filter(Boolean)
                .join(' '),
        totalHint: (allTypes: boolean) =>
            allTypes
                ? 'Общая оценка звонков этапов продаж и сколько их разобрано.'
                : 'Общая оценка звонков этого вида и сколько их разобрано.',
    },
    hidden: {
        label: (count: number) =>
            `Без разборов за период: ${count} ${pluralRu(count, EMPLOYEE_FORMS)}`,
        show: 'показать',
        hide: 'скрыть',
    },
    sectionEmpty: 'Нет данных за период',
    empty: {
        disabled:
            'Разбор звонков на портале не включён — оценок не будет. Что сделать: попросите разработчика включить разбор.',
        beforeAnalysis: (since: string) =>
            `В этом периоде разбор ещё не шёл: на портале он идёт с ${formatAiFullDate(since)}. Что сделать: выберите период позже.`,
        pilotOutside: (names: string) =>
            `Разбор звонков пока включён только для: ${names}. В фильтре отчёта этих сотрудников нет.`,
        pilotWiden:
            'Чтобы разбирать звонки всего отдела, попросите разработчика расширить пилот.',
        beforeComparable: (count: number, comparableFrom: string) =>
            `За период разобрано ${count} ${pluralRu(count, CALL_FORMS)}, но по прежней версии разбора — в оценки они не входят. Сравнимые разборы идут с ${formatAiFullDate(comparableFrom)}.`,
        beforeComparableFix: 'Что сделать: выберите период после этой даты.',
        short: (minDurationSec: number | null) =>
            `За период разобраны только звонки короче порога${minDurationSec ? ` (${minDurationSec} сек)` : ''} — в оценки они не входят. Что сделать: выберите период длиннее или попросите разработчика изменить порог.`,
        noType: (count: number) =>
            `За период разобрано ${count} ${pluralRu(count, CALL_FORMS)}, но AI не определил их вид — в оценки они не входят. Что сделать: выберите период длиннее.`,
        none: (minDurationSec: number | null) =>
            `За период звонков${minDurationSec ? ` длиннее ${minDurationSec} сек` : ''} у сотрудников в разборе не было. Что сделать: выберите другой период или проверьте, что сотрудники из разбора выбраны в фильтре.`,
        showFrom: (comparableFrom: string) =>
            `Показать с ${formatAiDay(comparableFrom)}`,
        addToFilter: 'Добавить в фильтр',
    },
    chart: {
        title: (name: string | null, columnsLabel: string) =>
            name
                ? `Оценки по ${columnsLabel}: ${name} и среднее по отделу`
                : `Оценки по ${columnsLabel}: среднее по отделу`,
        columns: {
            buckets: 'корзинам звонков',
            types: 'типам звонков',
            sections: 'разделам разговора',
        },
        entityLabel: 'Сотрудник',
        entityAll: 'Весь выбранный состав',
        departmentSeries: 'Среднее по отделу',
        tooltip: (
            label: string,
            score: number,
            n: number,
            preliminary: boolean,
        ) =>
            `${label}: ${formatAiScore(score)} из 10 по ${n} ${pluralRu(n, ['звонку', 'звонкам', 'звонкам'])}${preliminary ? ' · предварительно' : ''}`,
        empty: (minN: number) =>
            `Оценок пока нет — график появится, когда наберётся ${minN} разборов хотя бы по одной колонке.`,
    },
    rating: {
        mostReviews: (entityLabel: string) =>
            `Больше всего разборов — ${entityLabel}`,
        avgScore: (entityLabel: string) =>
            `Средняя оценка — ${entityLabel} (взвешено по числу звонков)`,
        chartTitle: (indicator: string) => `${indicator} — средняя оценка`,
        normSeries: 'Среднее по отделу',
        preliminary:
            'Порядок предварительный — мало разборов, чтобы сравнивать людей',
        employees: 'сотрудники',
    },
} as const;
