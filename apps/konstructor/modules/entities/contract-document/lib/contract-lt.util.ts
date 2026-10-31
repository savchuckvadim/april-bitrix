import type { Catalog } from '../../catalog';
import { describeLtPackets, ltPackageName, type Composition, type LtPacketView } from '../../composition';
import type { ContractLt } from '../model/dto';

const namesOf = (packet: LtPacketView): string[] => packet.services.map(service => service.name);

const titleOf = (packet: LtPacketView): string => (packet.package ? ltPackageName(packet.package) : packet.title);

/**
 * Legal Tech договора и отчёта о поставке (легаси getPaymentPacketsString):
 * бесплатная часть комплекта и все собранные платные пакеты. Названия пакетов
 * каталожные: своё имя менеджера — для строк цен, в договор идёт имя товара.
 * Один платный пакет — состав списком сервисов; несколько — по строке на пакет,
 * иначе не видно, какой сервис куда входит.
 */
export const buildContractLt = (
    catalog: Catalog,
    composition: Composition,
    serviceDepartment = false,
): ContractLt => {
    const packets = describeLtPackets(composition, {
        catalog,
        complect: catalog.complects.byCode[composition.complectCode] ?? null,
        serviceDepartment,
    });
    const included = packets.find(packet => packet.kind === 'included' && packet.services.length);
    const paid = packets.filter(packet => packet.isProduct);

    return {
        freePacket: included?.package ? ltPackageName(included.package) : '',
        freeServices: included ? namesOf(included) : [],
        paidPacket: paid.map(titleOf).join(', '),
        paidServices:
            paid.length > 1
                ? paid.map(packet => `${titleOf(packet)}: ${namesOf(packet).join(', ')}`)
                : paid.flatMap(namesOf),
    };
};
