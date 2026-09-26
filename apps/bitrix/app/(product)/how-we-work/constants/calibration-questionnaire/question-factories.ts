import {
    HowQuestionnaireOption,
    HowQuestionnaireQuestion,
} from '../types';

type QuestionExtras = Pick<
    HowQuestionnaireQuestion,
    | 'hint'
    | 'placeholder'
    | 'commentPlaceholder'
    | 'allowCustom'
    | 'required'
    | 'maxLength'
>;

/** Дополнения свободных вопросов: у них нет вариантов и комментария. */
type FreeQuestionExtras = Pick<
    QuestionExtras,
    'hint' | 'placeholder' | 'required' | 'maxLength'
>;

/** Дополнения группы чекбоксов: ни «своего варианта», ни комментария. */
type MultiQuestionExtras = Pick<QuestionExtras, 'hint' | 'required'>;

/** Фабрики вопросов брифа: раздел подставляется один раз на группу. */
export const questionFactories = (group: string) => ({
    text: (
        id: string,
        title: string,
        extras: FreeQuestionExtras = {},
    ): HowQuestionnaireQuestion => ({
        id,
        title,
        group,
        kind: 'text',
        options: [],
        ...extras,
    }),
    link: (
        id: string,
        title: string,
        extras: FreeQuestionExtras = {},
    ): HowQuestionnaireQuestion => ({
        id,
        title,
        group,
        kind: 'link',
        options: [],
        ...extras,
    }),
    choice: (
        id: string,
        title: string,
        options: readonly string[],
        extras: QuestionExtras = {},
    ): HowQuestionnaireQuestion => ({
        id,
        title,
        group,
        options: options.map(
            (value): HowQuestionnaireOption => ({ value }),
        ),
        ...extras,
    }),
    multi: (
        id: string,
        title: string,
        options: readonly string[],
        extras: MultiQuestionExtras = {},
    ): HowQuestionnaireQuestion => ({
        id,
        title,
        group,
        kind: 'multi',
        options: options.map(
            (value): HowQuestionnaireOption => ({ value }),
        ),
        ...extras,
    }),
});
