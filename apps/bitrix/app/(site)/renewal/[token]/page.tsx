import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RenewalPrintStyles } from '../components/RenewalPrintStyles';
import { RenewalDownloadButton } from '../components/RenewalDownloadButton';
import { RenewalOfferView } from '../components/RenewalOfferView';
import { RenewalLinkGone } from '../components/RenewalLinkGone';
import { fetchRenewalOffer } from '../model/renewal-offer.api';
import {
    RENEWAL_FALLBACK_PATH,
    shouldRedirectHome,
} from '../model/renewal-offer.failure';

export const metadata: Metadata = {
    title: 'Коммерческое предложение на следующий год — April CRM',
    description:
        'Состав услуг и стоимость обслуживания на следующий год: приложения по продажам, AI-сервис, персональный менеджер.',
    // Персональные ссылки не должны попадать в поиск.
    robots: { index: false, follow: false },
};

/**
 * Предложение действующему клиенту по персональной ссылке:
 * `/renewal/<token>`.
 *
 * Цены приходят с бэкенда по токену, а не из адреса, поэтому клиент не
 * может их подменить. Ссылку выдают и отзывают в админке.
 *
 * Новым клиентам адресована отдельная страница /offer — там разовое
 * внедрение и другая подача.
 */
export default async function RenewalTokenPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const result = await fetchRenewalOffer(token);

    if (!result.ok) {
        // Недействующая ссылка (отозвана, истекла, не существует) — на главную:
        // клиент попадает на сайт, а не в тупик, и перебором токенов ничего
        // не выяснить, все три случая ведут в одно место.
        if (shouldRedirectHome(result.reason)) {
            redirect(RENEWAL_FALLBACK_PATH);
        }
        // А вот сбой бэкенда на главную не уводим: ссылка, скорее всего,
        // живая, и клиент должен понять, что надо зайти позже, а не решить,
        // что предложение отменили.
        return (
            <div className="pt-24">
                <RenewalLinkGone />
            </div>
        );
    }

    return (
        <>
            <RenewalPrintStyles />
            <div className="pt-24">
                <RenewalDownloadButton token={token} />
                <RenewalOfferView offer={result.offer} />
            </div>
        </>
    );
}
