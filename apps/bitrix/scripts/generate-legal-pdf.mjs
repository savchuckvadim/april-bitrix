/**
 * Генерация PDF-версий юридических документов «Менеджер Гарант».
 *
 * ЗАЧЕМ: раньше кнопка «Скачать PDF» вызывала window.print() — пользователь
 * получал печать через системный диалог. Маркету и контрагентам нужен
 * предсказуемый файл с постоянным именем и адресом, поэтому PDF делаем
 * ЗАРАНЕЕ и кладём в public/ (прецедент в проекте — public/offer/offer.pdf).
 *
 * ⚠️ ПОСЛЕ ЛЮБОЙ ПРАВКИ ТЕКСТОВ документов (app/legal/**\/constants/*.ts)
 *    надо перегенерировать PDF, иначе снимок разойдётся со страницей.
 *
 * КАК ЗАПУСКАТЬ:
 *   1) поднять приложение:   pnpm build && pnpm start      (порт 3000)
 *   2) в другом терминале:   pnpm gen:legal-pdf
 *
 *   Порт другой (напр. `pnpm dev` слушает 3003) или прод:
 *      LEGAL_PDF_BASE_URL=http://localhost:3003    pnpm gen:legal-pdf
 *      LEGAL_PDF_BASE_URL=https://bitrix.april-app.ru pnpm gen:legal-pdf
 *
 * Печать идёт через puppeteer (headless Chromium). Пакет уже используется в
 * соседних приложениях workspace, поэтому переиспользуется из pnpm-store.
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const BASE_URL = (
    process.env.LEGAL_PDF_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(scriptDir, '..', 'public', 'legal');

/** Документы: страница → файл (пути должны совпадать с constants/vendor.ts) */
const DOCUMENTS = [
    { route: '/legal/license', fileName: 'license.pdf' },
    { route: '/legal/privacy', fileName: 'privacy.pdf' },
];

async function main() {
    await mkdir(OUTPUT_DIR, { recursive: true });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        for (const { route, fileName } of DOCUMENTS) {
            const url = `${BASE_URL}${route}`;
            const outputPath = path.join(OUTPUT_DIR, fileName);
            const page = await browser.newPage();

            try {
                const response = await page.goto(url, {
                    waitUntil: 'networkidle0',
                    timeout: 60_000,
                });
                if (!response || !response.ok()) {
                    throw new Error(
                        `страница недоступна (HTTP ${response?.status() ?? '—'})`,
                    );
                }

                // print-стили страницы (LegalPrintStyles) прячут кнопки и
                // навигацию, печатают чёрным по белому
                await page.emulateMediaType('print');
                await page.pdf({
                    path: outputPath,
                    format: 'A4',
                    printBackground: false,
                    margin: {
                        top: '15mm',
                        bottom: '15mm',
                        left: '15mm',
                        right: '15mm',
                    },
                });

                console.log(`✅ ${route} → public/legal/${fileName}`);
            } finally {
                await page.close();
            }
        }
    } finally {
        await browser.close();
    }
}

main().catch(error => {
    console.error(
        `❌ Генерация PDF не удалась: ${error instanceof Error ? error.message : String(error)}\n` +
            `   Проверьте, что приложение запущено на ${BASE_URL} ` +
            `(pnpm build && pnpm start) или задайте LEGAL_PDF_BASE_URL.`,
    );
    process.exit(1);
});
