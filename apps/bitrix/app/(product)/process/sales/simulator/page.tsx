import React from 'react';
import { SimulatorView } from './components/SimulatorView';
import { SIMULATOR_META } from './constants/copy';

export const metadata = {
    title: 'Процесс продажи — симулятор рабочего места',
    description: SIMULATOR_META.description,
};

export default function SalesSimulatorPage() {
    return <SimulatorView />;
}
