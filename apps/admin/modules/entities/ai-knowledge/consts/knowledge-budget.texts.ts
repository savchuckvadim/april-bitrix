/** Тексты блока «Сколько материалов попадает в разбор». */
export const KNOWLEDGE_BUDGET_TEXT = {
    title: 'Сколько материалов попадает в разбор',
    description:
        'У каждого вида материалов свой предел знаков в запросе к модели. ' +
        'Что не поместилось — модель не видит: обрезается конец текста.',
    loading: 'Считаем объём материалов…',
    error: 'Не удалось посчитать объём материалов. Обновите страницу.',
    kind: 'Вид материалов',
    volume: 'Объём',
    where: 'Где читается и сколько помещается',
    empty: 'нет материалов',
    statusEmpty: 'пусто',
    statusFits: 'помещается',
    statusUnread: 'никем не читается',
    statusCut: (chars: string) => `обрезается ${chars}`,
    documents: (count: number) => `документов: ${count}`,
    volumeLine: (chars: string, tokens: string) =>
        `${chars} зн. · ≈ ${tokens} токенов`,
    useFits: (budget: string) => `помещается целиком, предел ${budget}`,
    useCut: (fit: string, chars: string, cut: string) =>
        `помещается ${fit} из ${chars}, обрезано ${cut}`,
    useEmpty: (budget: string) => `предел ${budget}`,
    onlyTypes: (types: string) => `только: ${types}`,
    complianceOff: 'выключена на портале',
    methodologyOn: (title: string, version: string) =>
        `Методика «${title}» (${version}): её проход получает материалы, ` +
        'которые методика объявила своими.',
    methodologyPlain: (title: string, version: string) =>
        `Методика «${title}» (${version}) своих материалов не объявила: её ` +
        'проход читает только общий слой разбора.',
    methodologyOff:
        'Методика продаж на портале не выбрана: факты о продукте читает ' +
        'только проверка по регламенту.',
    complianceOffNote:
        'Проверка по регламенту на портале выключена — её строки показаны ' +
        'для справки.',
    complianceUnknown:
        'Не удалось прочитать, включена ли на портале проверка по регламенту.',
    howToRead:
        'Обрезается — сократите документы вида до предела или уберите ' +
        'повторы: в запрос идёт только начало. Токены — оценка, точное ' +
        'число зависит от модели.',
} as const;
