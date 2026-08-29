import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
    QuestionnaireCodeOption,
    QuestionnaireControl,
} from '../model';
import {
    QUESTIONNAIRE_CODE,
    QUESTIONNAIRE_FIELD_BOUND_CHANNELS,
    questionnaireCodeOptions,
} from '../model';
import { getFieldControls } from './build-item-from-field';
import { optionName } from './questionnaire-list-view';
import type { QuestionnaireDraftIssue } from './validate-questionnaire-draft';

/**
 * Что редактор разрешает делать с одним вопросом.
 *
 * Правила здесь ровно те же, что проверяет бэк на сохранении, но повёрнуты
 * в другую сторону: бэк отвечает «так нельзя» постфактум, а редактор не
 * даёт собрать такой вопрос вообще. Ни один код не зашит — списки и матрица
 * приходят из `GET /schema`.
 */

/**
 * Типы отображения, которыми ЭТОТ вопрос заполнить можно.
 *
 * Матрица «тип поля → контролы» живёт на бэке: поле-дата принимает только
 * «Дату», список — только «Список», а поле-адрес не принимает ничего.
 * Отфильтрованный селект физически не даёт выбрать неисполнимый контрол —
 * иначе ответ менеджера не записался бы, и узнал бы об этом владелец из
 * ошибки сохранения.
 *
 * Полный список остаётся там, где матрица неприменима: поле ещё не
 * выбрано, ответ уходит в комментарий события или это штатное поле (типа
 * пользовательского поля у него нет).
 */
export const getItemControlOptions = (
    item: PortalQuestionnaireItemSave,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireCodeOption<QuestionnaireControl>[] => {
    const all = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.control,
        schema?.controls,
    );
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;

    // Поле отчёта заполняется ровно одним типом — он записан в реестре.
    if (channel === QUESTIONNAIRE_CODE.channel.dto) {
        const descriptor = schema?.dtoPaths.find(
            path => path.path === (item.dtoPath ?? ''),
        );
        if (!descriptor) return all;
        return all.filter(control => control.code === descriptor.control);
    }

    // Комментарий события ответ никуда не пишет — годится любой тип.
    if (!QUESTIONNAIRE_FIELD_BOUND_CHANNELS.includes(channel)) return all;
    if (item.isNative === true) return all;

    const fieldType = (item.fieldType ?? '').trim();
    if (!fieldType) return all;

    const allowed = getFieldControls(schema, fieldType);
    return all.filter(control => allowed.includes(control.code));
};

/**
 * Почему «требовать новое значение» недоступно; `null` — доступно.
 *
 * Флаг заставляет менеджера ввести значение, ОТЛИЧНОЕ от того, что уже
 * лежит в карточке. Сравнивать есть с чем только у ответа, который пишется
 * в поле CRM: у ответа в элемент смарта прежнего значения нет вовсе —
 * элемент рождается вместе с отчётом, — а ответ в отчёт и в комментарий
 * события не имеет его по той же причине. Бэк такой вопрос отклоняет,
 * поэтому чекбокс заперт с объяснением, а не молча отправляет владельца в
 * ошибку.
 */
export const getRequireChangeLock = (
    item: PortalQuestionnaireItemSave,
): string | null => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    if (channel === QUESTIONNAIRE_CODE.channel.crm) return null;

    return (
        'Требовать новое значение можно только у ответа, который пишется в ' +
        'поле CRM: у ответа в элемент смарта, в отчёт и в комментарий ' +
        'события прежнего значения нет — сравнивать не с чем.'
    );
};

/** Почему «срок годности» недоступен; `null` — доступен. */
export const getStaleAfterDaysLock = (
    item: PortalQuestionnaireItemSave,
): string | null => {
    const control = item.control;
    const isDate =
        control === QUESTIONNAIRE_CODE.control.date ||
        control === QUESTIONNAIRE_CODE.control.datetime;

    if (isDate) return null;

    return (
        'Срок годности считает, не устарел ли ответ, по самой дате — он ' +
        'доступен типам «Дата» и «Дата и время».'
    );
};

/** Почему «сущность-носитель» недоступна; `null` — доступна. */
export const getTargetEntityLock = (
    item: PortalQuestionnaireItemSave,
): string | null => {
    const targetMode = item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto;
    if (targetMode === QUESTIONNAIRE_CODE.targetMode.entity) return null;

    return (
        'Носитель выбирается автоматически: фрейм идёт цепочкой компания → ' +
        'сделка → лид. Жёсткую сущность задают, когда поле лежит вне этой ' +
        'цепочки.'
    );
};

/** Почему вопрос не уедет во фрейм. */
export interface QuestionnaireFieldProblem {
    /** Название состояния привязки из реестра. */
    label: string;
    /** Что это значит для менеджера и что с этим делать. */
    reason: string;
}

/**
 * Сломанная привязка вопроса; `null` — поле на месте.
 *
 * Состояние ставит сверка с живым Битриксом, и владелец обязан видеть его
 * в карточке самого вопроса, а не только в общем итоге: из каталога фрейма
 * такой вопрос выпадает целиком, и по одному списку в шапке понять, какой
 * именно вопрос перестал работать, невозможно.
 *
 * Код здесь ровно один — `ok`. Что именно случилось (поля нет, сменился
 * тип), говорит название статуса из реестра: новый статус бэка появится в
 * карточке сам.
 */
export const getFieldStatusProblem = (
    item: PortalQuestionnaireItemSave,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireFieldProblem | null => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    // Состояние привязки есть у ответа В ПОЛЕ — CRM и элемента смарта:
    // сверка ходит за полями обоих. Ответу в отчёт и в комментарий события
    // ломаться нечему.
    if (!QUESTIONNAIRE_FIELD_BOUND_CHANNELS.includes(channel)) return null;

    const status = item.fieldStatus ?? QUESTIONNAIRE_CODE.fieldStatus.ok;
    if (status === QUESTIONNAIRE_CODE.fieldStatus.ok) return null;

    return {
        label: optionName(schema?.fieldStatuses, status),
        reason:
            'Ответ на этот вопрос записывать некуда, поэтому в каталог ' +
            'фрейма он не попадёт и менеджер его не увидит. Выберите поле ' +
            'заново — состояние обновит следующая сверка.',
    };
};

/** Нарушения правил, относящиеся к одному вопросу. */
export const issuesForItem = (
    issues: QuestionnaireDraftIssue[],
    code: string,
): QuestionnaireDraftIssue[] =>
    issues.filter(issue => issue.scope === 'item' && issue.itemCode === code);

/** Вопрос вместе с его местом в списке и признаком начала группы. */
export interface QuestionnaireItemRow {
    item: PortalQuestionnaireItemSave;
    index: number;
    /** Заголовок секции; пусто — вопрос вне групп. */
    groupTitle: string | null;
    /** С этого вопроса начинается новая группа — рисуем разделитель. */
    isGroupStart: boolean;
}

/**
 * Разметка списка вопросов по группам.
 *
 * Группа — это `groupTitle` подряд идущих вопросов: разделитель ставится
 * там, где заголовок сменился. Отдельной сущности «группа» на бэке нет,
 * поэтому перетаскивание вопроса между группами меняет ровно его
 * `groupTitle`, а не структуру анкеты.
 */
export const withGroupDividers = (
    items: PortalQuestionnaireItemSave[],
): QuestionnaireItemRow[] =>
    items.map((item, index) => {
        const groupTitle = (item.groupTitle ?? '').trim() || null;
        const previous = index > 0 ? items[index - 1] : undefined;
        const previousTitle = previous
            ? (previous.groupTitle ?? '').trim() || null
            : null;

        return {
            item,
            index,
            groupTitle,
            // Первый вопрос открывает группу, только если она названа:
            // безымянная «группа» — это просто начало списка.
            isGroupStart:
                groupTitle !== previousTitle &&
                (groupTitle !== null || index > 0),
        };
    });
