import React from 'react';
import { HowContentPage } from '../components/HowContentPage';
import { INBOUND_PAGE } from '../constants/pages/inbound';

export const metadata = {
    title: 'Входящий поток — заявки, звонки и импорты без дублей',
    description: INBOUND_PAGE.description,
};

export default function InboundPage() {
    return <HowContentPage page={INBOUND_PAGE} />;
}
