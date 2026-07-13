import {
    getDocumentCounterAdmin,
    getDocumentCounterNumbers,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    DocumentNumber,
    Numerator,
    NumeratorCreate,
    NumeratorType,
} from '../../model';

/**
 * Внутренний конверт админских эндпоинтов document-counter. Контроллеры
 * оборачивают ответ в `{ success, data: { ... } }`, а глобальный
 * `ResponseInterceptor` — ещё раз в `{ resultCode, data }`. После распаковки
 * мутатором (`customAxios` возвращает внешний `data`) сюда приходит именно
 * внутренний конверт, поэтому достаём нужный ключ вручную.
 */
interface AdminEnvelope<T> {
    success?: boolean;
    data?: T;
}

/**
 * Единственное место с импортом сгенерированных `document-counter` клиентов.
 * Нумераторы привязаны к реквизитам (Rq) портала. Эндпоинты «numbers»
 * (`peek`/`current`) возвращают `{ number }` напрямую, а «admin» — двойной
 * конверт (см. {@link AdminEnvelope}).
 */
export class NumeratorHelper {
    private admin = getDocumentCounterAdmin();
    private numbers = getDocumentCounterNumbers();

    /** Нумераторы реквизита (Rq) с pivot-данными. */
    async listByRq(rqId: number): Promise<Numerator[]> {
        const res = (await this.admin.counterAdminFindAllByRq(
            rqId,
        )) as unknown as AdminEnvelope<{ counters?: Numerator[] }>;
        return res?.data?.counters ?? [];
    }

    /** Создать нумератор и привязать к Rq. */
    async create(dto: NumeratorCreate): Promise<void> {
        await this.admin.counterAdminCreate(dto);
    }

    /** Удалить нумератор (счётчик) и его связи. */
    async remove(counterId: number): Promise<void> {
        await this.admin.counterAdminRemove(counterId);
    }

    /** Текущее значение номера без инкремента. */
    peek(rqId: number, type: NumeratorType): Promise<DocumentNumber> {
        return this.numbers.counterNumberPeekCurrentNumber(rqId, type);
    }

    /** Задать текущее значение счётчика (от которого пойдёт отсчёт). */
    setCurrent(
        rqId: number,
        type: NumeratorType,
        value: number,
    ): Promise<DocumentNumber> {
        return this.numbers.counterNumberSetCurrentNumber(rqId, type, { value });
    }
}
