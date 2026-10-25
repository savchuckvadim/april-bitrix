import type {
    ProviderWithRqResponseDto,
    RqEntity,
} from '@workspace/nest-konstructor-api';

/**
 * Поставщик портала (таблица `agents` + реквизиты `rqs`) — алиасы
 * generated-DTO `GET /api/provider/domain/:domain`. `withTax` — цены строк
 * умножаются на 1.05 (кроме лицензионных договоров).
 */
export type Provider = ProviderWithRqResponseDto;
export type ProviderRq = RqEntity;
