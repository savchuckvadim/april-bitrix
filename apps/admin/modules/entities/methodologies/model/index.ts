import type {
    CatalogCheckpointDto,
    CatalogEntryDto,
    MethodologyAssistResultDto,
    MethodologyCapDto,
    MethodologyCatalogDto,
    MethodologyCheckpointDto,
    MethodologyConditionDto,
    MethodologyConfigDto,
    MethodologyDetailDto,
    MethodologyListItemDto,
    MethodologySaveDto,
    MethodologySpiralsDto,
    MethodologyValidationDto,
    MethodologyValidationSummaryDto,
} from '@workspace/nest-admin-api';

/**
 * Раздел «Методики»: типы — сгенерированные DTO бэка admin
 * (`admin/methodologies`, call-lib methodology). Форма правит конфиг
 * `MethodologyConfigDto` целиком; проверку делает бэк.
 */
export type MethodologyItem = MethodologyListItemDto;
export type MethodologyDetail = MethodologyDetailDto;
export type MethodologyConfig = MethodologyConfigDto;
export type MethodologyCheckpoint = MethodologyCheckpointDto;
export type MethodologyCap = MethodologyCapDto;
export type MethodologyCondition = MethodologyConditionDto;
export type MethodologySpirals = MethodologySpiralsDto;
export type MethodologyCatalog = MethodologyCatalogDto;
export type CatalogEntry = CatalogEntryDto;
export type CatalogCheckpoint = CatalogCheckpointDto;
export type MethodologyValidation = MethodologyValidationDto;
export type MethodologyValidationSummary = MethodologyValidationSummaryDto;
export type MethodologySave = MethodologySaveDto;
export type MethodologyAssistResult = MethodologyAssistResultDto;

export type MethodologyScope = MethodologyListItemDto['scope'];
export type MethodologySource = MethodologyListItemDto['source'];
export type MethodologyConditionOp = MethodologyConditionDto['op'];
export type MethodologyCapTarget = MethodologyCapDto['target'];
export type CheckpointEvidence = MethodologyCheckpointDto['evidence'];

export const METHODOLOGIES_PATH = '/ai-analytics/methodologies';
/** Значение комбобокса «без портала». */
export const METHODOLOGIES_NO_PORTAL = '__common__';

/** Шаблон кода методики и пункта — зеркало валидатора бэка. */
export const METHODOLOGY_CODE_PATTERN = /^[a-z][a-z0-9-]{1,63}$/;
export const CHECKPOINT_CODE_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export const SCOPE_LABELS: Readonly<Record<MethodologyScope, string>> = {
    common: 'Общая методика April',
    portal: 'Своя методика портала',
};

export const METHODOLOGIES_TEXT = {
    title: 'Методики продаж',
    intro:
        'Методика — набор проверяемых пунктов, правил и ограничителей оценки поверх общего разбора звонков. Общие методики видны всем порталам, своя методика портала — только ему; на портале методика включается бейджем в настройках AI.',
    portal: 'Портал',
    portalPlaceholder: 'Без портала — только общий слой',
    portalSearch: 'Поиск по домену',
    portalEmpty: 'Порталов не найдено',
    portalHint: 'Выберите портал, чтобы увидеть и завести его собственные методики.',
    allPortals: 'Без портала — только общий слой',
    newMethodology: 'Новая методика',
    loading: 'Загружаю методики…',
    loadError: 'Не удалось загрузить методики',
    catalogError: 'Не удалось загрузить каталог формы',
    detailError: 'Не удалось открыть методику',
    empty: 'Методик пока нет: встроенная появится в списке после выкладки.',
    columns: {
        title: 'Методика',
        scope: 'Слой',
        version: 'Версия',
        checkpoints: 'Пунктов',
        caps: 'Ограничителей',
        state: 'Состояние',
        updated: 'Изменена',
        actions: 'Действия',
    },
    builtin: 'встроенная',
    inactive: 'выключена',
    invalid: 'конфиг с ошибками',
    open: 'Открыть',
    copy: 'Копировать как свою',
    copySuffix: ' (копия)',
    editor: {
        titleNew: 'Новая методика',
        titleEdit: (title: string): string => `Методика «${title}»`,
        loading: 'Загружаю методику…',
        builtinNote:
            'Встроенная методика хранится в коде: правки сохраняются строкой общего слоя с тем же кодом и перекрывают встроенную.',
        storedErrors: 'Сохранённый конфиг не проходит проверку — исправьте и сохраните.',
        code: 'Код',
        codeHint: 'Латиница, цифры и дефис, 2–64 знака; идёт в метку версии разбора.',
        name: 'Название',
        version: 'Версия',
        versionHint: 'major.minor.patch; при правке пунктов поднимите версию — так видно смену шкалы.',
        scope: 'Слой',
        scopeHint:
            'Своя методика портала видна только ему; общая — всем порталам. Для своей нужен выбранный портал в списке.',
        noDomainForPortal: 'Для своей методики выберите портал над списком.',
        active: 'Включена',
        activeHint: 'Выключенная методика не предлагается порталам и не применяется.',
        types: 'Типы звонков методики',
        tabs: {
            checkpoints: 'Пункты',
            caps: 'Ограничители',
            rules: 'Правила и спирали',
            assistant: 'Помощник',
            json: 'JSON',
        },
        validate: 'Проверить',
        save: 'Сохранить',
        saving: 'Сохраняю…',
        validating: 'Проверяю…',
        valid: 'Конфиг в порядке',
        validSummary: (checkpoints: number, caps: number, types: number): string =>
            `Конфиг в порядке: пунктов ${checkpoints}, ограничителей ${caps}, типов звонков ${types}.`,
        saved: 'Методика сохранена',
        saveError: 'Не удалось сохранить методику',
        validateError: 'Проверка не удалась',
        errorsTitle: 'Ошибки конфига',
        bumpVersion: 'Поднять версию',
        cancel: 'Закрыть',
        dirty: 'Есть несохранённые правки',
    },
    checkpoints: {
        empty: 'Пунктов нет: добавьте свои или выберите из каталога.',
        add: 'Добавить пункт',
        fromCatalog: 'Из каталога',
        catalogTitle: 'Каталог пунктов',
        catalogHint:
            'Пункты встроенных методик. Пункты с пометкой «правило кода» считаются по фактам разбора автоматически.',
        byRule: 'правило кода',
        code: 'Код',
        title: 'Формулировка (как увидит менеджер)',
        types: 'Типы',
        evidence: 'Подтверждение',
        mandatory: 'Обязательный',
        hint: 'Подсказка модели',
        remove: 'Удалить',
        already: 'уже в методике',
        pick: 'Добавить выбранные',
        close: 'Закрыть',
    },
    caps: {
        empty: 'Ограничителей нет. Ограничители ядра действуют всегда и показаны ниже для справки.',
        add: 'Добавить ограничитель',
        code: 'Код',
        title: 'Формулировка («оценка ограничена: …»)',
        target: 'Что ограничить',
        max: 'Не выше',
        types: 'Типы (пусто — все типы методики)',
        when: 'Условия (все должны выполниться)',
        addCondition: 'Добавить условие',
        remove: 'Удалить',
        coreTitle: 'Ограничители ядра (для справки)',
        coreHint: 'Действуют на всех порталах независимо от методики; править их здесь нельзя.',
        op: 'Операция',
        field: 'Факт',
        value: 'Значение',
        checkpoint: 'Пункт',
        valueHint: 'true / false, число или текст',
    },
    rules: {
        principles: 'Правила методики',
        principlesHint: 'По одному правилу на строку: короткие формулировки для промпта разбора.',
        spirals: 'Спирали презентации',
        spiralsHint: 'Считать витки «потребность → свойство → связка → выгода → вопрос».',
        enabled: 'Считать спирали',
        minFull: 'Минимум полных витков',
        types: 'Типы звонков со спиралями',
    },
    assistant: {
        title: 'Помощник: разложить документ методики',
        intro:
            'Загрузите документ (docx, pdf, txt, md) или вставьте текст: модель предложит пункты, правила и ограничители по нашему каталогу. Черновик заменит содержимое формы, его нужно проверить и поправить руками.',
        text: 'Текст документа',
        textPlaceholder: 'Вставьте текст методики, если нет файла…',
        file: 'Файл документа',
        run: 'Собрать черновик',
        running: 'Модель раскладывает документ…',
        applyNote: 'Черновик применён к форме. Проверьте формулировки и сохраните.',
        failed: 'Черновик не собран',
        errors: 'Ошибки черновика',
        warnings: 'Предупреждения',
        noInput: 'Нужен файл или текст документа',
        answeredBy: (provider: string | null, model: string | null, chars: number): string =>
            `Ответил ${provider ?? 'шлюз'}${model ? `, модель ${model}` : ''}; текста ${chars.toLocaleString('ru-RU')} зн.`,
    },
    json: {
        hint: 'Полный конфиг. Правки применяются кнопкой; невалидный JSON не применяется.',
        apply: 'Применить JSON',
        applied: 'JSON применён к форме',
        invalid: 'JSON не разбирается',
    },
} as const;
