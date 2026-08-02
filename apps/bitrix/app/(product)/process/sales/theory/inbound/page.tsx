import React from 'react';
import { TheoryPageView } from '../../../_core/components/theory/TheoryPageView';
import { THEORY_INBOUND } from '../constants/inbound';

export const metadata = {
    title: `Процесс продажи — ${THEORY_INBOUND.title}`,
    description: THEORY_INBOUND.description,
};

export default function TheoryInboundPage() {
    return <TheoryPageView page={THEORY_INBOUND} />;
}
