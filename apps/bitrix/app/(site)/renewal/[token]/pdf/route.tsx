/**
 * PDF предложения по персональной ссылке: /renewal/<token>/pdf.
 *
 * Состав и цены берём с бэкенда по тому же токену, что и страница, —
 * один источник на оба формата, поэтому PDF и экран разойтись не могут.
 * Цен в адресе нет: подменить их клиент не может.
 *
 * Рендер на сервере (@react-pdf/renderer), а не печатью в браузере: у
 * клиента получается один и тот же файл в любом браузере, без полей и
 * колонтитулов, которые подставляет диалог печати.
 */
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { fetchRenewalOffer } from '../../model/renewal-offer.api';
import {
    RENEWAL_FALLBACK_PATH,
    shouldRedirectHome,
} from '../../model/renewal-offer.failure';
import { RenewalPdfDocument } from './RenewalPdfDocument';
import { registerRenewalPdfFonts } from './renewal-pdf.fonts';
import { buildRenewalPdfDisposition } from './renewal-pdf.name';

/** react-pdf работает только в Node: Edge-рантайм не умеет шрифты с диска. */
export const runtime = 'nodejs';

export async function GET(
    _request: Request,
    context: { params: Promise<{ token: string }> },
): Promise<Response> {
    const { token } = await context.params;
    const result = await fetchRenewalOffer(token);

    if (!result.ok) {
        // Недействующая ссылка — на главную, как и страница предложения.
        // Отозванная, истёкшая и неизвестная ведут в одно место, поэтому
        // перебором токенов ничего не выяснить.
        if (shouldRedirectHome(result.reason)) {
            return new Response(null, {
                status: 303,
                headers: {
                    Location: RENEWAL_FALLBACK_PATH,
                    'Cache-Control': 'no-store',
                },
            });
        }
        // Сбой бэкенда на главную не уводим: ссылка, скорее всего, живая.
        // Текстом, а не редиректом — иначе вместо файла скачалась бы
        // html-страница сайта, и клиент не понял бы, что случилось.
        return new Response(
            'Не удалось собрать файл. Попробуйте через несколько минут.',
            {
                status: 502,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-store',
                },
            },
        );
    }

    // Сборка файла может упасть на стороне сервера (например, не нашлись
    // шрифты). Без перехвата клиент получил бы пустой 500 без объяснения,
    // а причина осталась бы только в трейсе Next.
    let buffer: Buffer;
    try {
        registerRenewalPdfFonts();
        buffer = await renderToBuffer(
            <RenewalPdfDocument offer={result.offer} />,
        );
    } catch (error) {
        const reason = error instanceof Error ? error.message : 'неизвестно';
        console.error(`[renewal-pdf] не удалось собрать PDF: ${reason}`);
        return new Response(
            'Не удалось собрать файл. Попробуйте через несколько минут.',
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-store',
                },
            },
        );
    }

    return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': String(buffer.length),
            'Content-Disposition': buildRenewalPdfDisposition(
                result.offer.clientName,
            ),
            // Цены персональные: кэшировать ответ нельзя, иначе чужой PDF.
            'Cache-Control': 'no-store',
            'X-Robots-Tag': 'noindex, nofollow',
        },
    });
}
