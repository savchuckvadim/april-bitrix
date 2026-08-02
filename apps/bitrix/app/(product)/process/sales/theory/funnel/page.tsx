import React from 'react';
import { TheoryPageView } from '../../../_core/components/theory/TheoryPageView';
import { THEORY_FUNNEL } from '../constants/funnel';

export default function TheoryFunnelPage() {
    return <TheoryPageView page={THEORY_FUNNEL} />;
}

export const metadata = {
    title: 'Процесс продажи — основная воронка',
    description:
        'Почему воронка — лестница, откуда берётся KPI и зачем менеджеру одна форма вместо десяти полей.',
};
