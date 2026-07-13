// Доменные алиасы нумераторов документов (`counters` + `rq_counter`) портала.
// Нумераторы привязаны к реквизитам (Rq) портала; UI и хуки импортируют только отсюда.
import type {
    CounterByRqItemDto,
    CreateDocumentCounterDto,
    DocumentNumberResponseDto,
} from '@workspace/nest-pbx-install-api';
import { CreateDocumentCounterDtoType } from '@workspace/nest-pbx-install-api';

/** Нумератор реквизита (счётчик + pivot `rq_counter`). */
export type Numerator = CounterByRqItemDto;
/** Тело создания нумератора (привязка счётчика к Rq). */
export type NumeratorCreate = CreateDocumentCounterDto;
/** Сгенерированный/текущий номер документа. */
export type DocumentNumber = DocumentNumberResponseDto;

/** Тип нумератора (счёт/КП/договор). */
export type NumeratorType = CreateDocumentCounterDtoType;
/** Значения типа нумератора (рантайм-константа). */
export const NUMERATOR_TYPE = CreateDocumentCounterDtoType;

/** Подписи типов нумераторов. */
export const NUMERATOR_TYPE_LABELS: Record<NumeratorType, string> = {
    invoice: 'Счёт',
    offer: 'КП',
    contract: 'Договор',
};

/** Опция выбора реквизита (Rq) портала. */
export interface RqOption {
    id: number;
    name: string;
}
