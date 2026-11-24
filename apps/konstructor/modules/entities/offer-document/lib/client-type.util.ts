// файл констант, не баррель: баррель bx-rq тянет UI (а с ним react-pdf в тестах)
import { RQ_TYPE } from '../../bx-rq/model/types';
import type { OfferClientType } from '../../document-payload';

/** Тип клиента сделки (pbx `op_client_type` → RQ_TYPE) в значении payload документов. */
const CLIENT_TYPE_OF: Record<RQ_TYPE, OfferClientType> = {
    [RQ_TYPE.ORGANIZATION]: 'org',
    [RQ_TYPE.BUDGET]: 'org_state',
    [RQ_TYPE.IP]: 'ip',
    [RQ_TYPE.FIZ]: 'fiz',
};

/**
 * Тип клиента в значении payload. Не задан — организация: так печатаются
 * превью и документы, где тип не влияет на выбор шаблона. КП формируется
 * только с заданным типом (clientTypeBlocker), подстановка в уходящий
 * документ не попадает.
 */
export const toOfferClientType = (type: RQ_TYPE | null | undefined): OfferClientType =>
    CLIENT_TYPE_OF[type ?? RQ_TYPE.ORGANIZATION];

/** Подпись к заблокированной кнопке «Сформировать»: тип клиента обязателен. */
export const CLIENT_TYPE_REQUIRED_BLOCKER =
    'Укажите тип клиента в шапке: коммерческие, бюджетники, ИП, физ. лицо или адвокаты';

/**
 * Формирование КП без типа клиента не запускается: по нему бэк подбирает
 * шаблон счёта. Превью этим блокером не закрывается.
 */
export const clientTypeBlocker = (type: RQ_TYPE | null | undefined): string | null =>
    type ? null : CLIENT_TYPE_REQUIRED_BLOCKER;
