'use client';

import { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';

/**
 * «+ Пакет LT» с шага цен: у нового пакета сразу есть id, окно собирает его
 * в черновике (LtPacketAddDialog). В сборку пакет попадает только по
 * «Добавить пакет», поэтому убирать за собой при отмене нечего.
 */
export const useAddLtPacket = () => {
    const [packetId, setPacketId] = useState<string | null>(null);

    return {
        packetId,
        start: () => setPacketId(nanoid(8)),
        close: () => setPacketId(null),
    };
};
