import type { KService } from '../../catalog';
import type { Composition } from '../model/types';

/**
 * Сколько раз LT-сервис входит в сборку: один раз в наполнении (бесплатно
 * или в пакете) плюс по разу за каждый пакет LT-other, где он отмечен
 * (легаси computeIscraCounts). Нужно Искре: каждое вхождение — 20 запросов
 * в день, и документ пишет это подписью к сервису.
 */

export const LT_ISKRA_CODES: readonly string[] = ['iscra', 'iscra_special'];
export const ISKRA_REQUESTS_PER_UNIT = 20;

export const isIskraService = (code: string): boolean => LT_ISKRA_CODES.includes(code);

export const ltServiceCount = (composition: Composition, code: string): number => {
    const inComposition =
        composition.lt.includes(code) || composition.ltInPacket.includes(code) ? 1 : 0;
    const inPackets = composition.ltOther.filter(packet =>
        packet.services.includes(code),
    ).length;
    return inComposition + inPackets;
};

/**
 * Подпись сервиса в документе: Искра с несколькими вхождениями —
 * «Искра (40 запросов в день)»; у прочих сервисов подписи нет.
 */
export const ltServiceSubtitle = (
    service: Pick<KService, 'code' | 'name'>,
    count: number,
): string | null =>
    isIskraService(service.code) && count > 1
        ? `${service.name} (${count * ISKRA_REQUESTS_PER_UNIT} запросов в день)`
        : null;

/** Все LT-сервисы сборки без повторов: наполнение + пакеты LT-other */
export const allLtServiceCodes = (composition: Composition): string[] => [
    ...new Set([
        ...composition.lt,
        ...composition.ltInPacket,
        ...composition.ltOther.flatMap(packet => packet.services),
    ]),
];
