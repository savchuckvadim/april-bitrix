import { ltPacketHint, type LtPacketView } from '@/modules/entities/composition';

export interface LtPacketLine {
    id: string;
    label: string;
    title: string;
    note: string;
    isWarning: boolean;
}

const noteOf = (packet: LtPacketView): string => {
    if (packet.kind === 'included' && packet.limit) return `${packet.weight} из ${packet.limit}`;
    if (packet.status === 'empty') return 'сервисы не выбраны';
    if (packet.status === 'incomplete' || packet.status === 'locked') return ltPacketHint(packet);
    return `вес ${packet.weight}`;
};

/** Полоса пакетов: что входит бесплатно, что платно и что поправить в несобранном. */
export const describeLtPacketLines = (packets: LtPacketView[]): LtPacketLine[] => {
    let extraNumber = 0;
    return packets.map(packet => {
        if (packet.kind === 'extra') extraNumber += 1;
        return {
            id: packet.id,
            label:
                packet.kind === 'included'
                    ? 'В комплекте'
                    : packet.kind === 'paid'
                      ? 'Платный'
                      : `Доп. пакет №${extraNumber}`,
            title: packet.title,
            note: noteOf(packet),
            isWarning: packet.status !== 'ok',
        };
    });
};
