/**
 * Сырой контракт `GET /api/questionnaires`.
 *
 * Формы берутся из сгенерированного пакета (`questionnaireCatalog*`) — руками
 * они больше не описываются: имена бэка (`portal-questionnaires.dto.ts`) и
 * orval'а совпадают дословно, поэтому файл схлопнулся в реэкспорт. Это
 * единственное место слайса, где такой реэкспорт делается; наружу слайс
 * отдаёт их через `model/index.ts` вместе с доменными типами.
 */

import type {
    QuestionnaireCatalogDto,
    QuestionnaireCatalogEntryDto,
    QuestionnaireCatalogItemDto,
    QuestionnaireCatalogOptionDto,
} from '@workspace/nest-event-sales-api';

export type {
    QuestionnaireCatalogConditionDto,
    QuestionnaireCatalogDto,
    QuestionnaireCatalogEntryDto,
    QuestionnaireCatalogFieldDto,
    QuestionnaireCatalogItemDto,
    QuestionnaireCatalogOptionDto,
    QuestionnaireCatalogTargetDto,
    QuestionnaireCatalogVersionDto,
} from '@workspace/nest-event-sales-api';

/**
 * Значение, ПРИЕХАВШЕЕ ПО СЕТИ: объявленные спекой перечисления распускаются
 * обратно в `string`, остальное (числа, `null`, вложенные объекты, массивы)
 * остаётся как в контракте.
 *
 * Форма выводится из сгенерированного типа, а не пишется рядом: состав полей
 * остаётся один и правится только генерацией.
 */
type Wire<T> = T extends readonly (infer Item)[]
    ? Wire<Item>[]
    : T extends object
      ? { [Key in keyof T]: Wire<T[Key]> }
      : T extends string
        ? string
        : T;

/**
 * Каталог в том виде, в каком его РАЗБИРАЕТ нормализатор.
 *
 * Зачем расширять то, что спека уже сузила: состав анкет собирается из строк
 * БД портала, а не из кода фрейма, и приезжает от ЧУЖОЙ версии сервиса —
 * реестр бэка расширяется раньше движка (правило «сначала фронт научился»).
 * Union на границе сети — это обещание, а не проверка: отсев неисполнимого
 * делает нормализатор, и его ветки обязаны оставаться живыми, а не
 * «недостижимыми по типу». Ответ сгенерированного клиента сюда присваивается
 * без приведения — сужение всегда уже расширения.
 */
export type QuestionnaireCatalogWire = Wire<QuestionnaireCatalogDto>;

/** Анкета каталога, как она приехала по сети. */
export type QuestionnaireCatalogEntryWire = Wire<QuestionnaireCatalogEntryDto>;

/** Вопрос анкеты, как он приехал по сети. */
export type QuestionnaireCatalogItemWire = Wire<QuestionnaireCatalogItemDto>;

/** Вариант справочника, как он приехал по сети. */
export type QuestionnaireCatalogOptionWire =
    Wire<QuestionnaireCatalogOptionDto>;
