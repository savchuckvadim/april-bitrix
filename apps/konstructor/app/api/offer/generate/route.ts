import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';
import { IOffer } from '@/modules/entities/offer/type/offer.type';
import { redis } from '@/app/lib/redis/redis';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const offer: IOffer = await request.json();
    const offerId = uuidv4();
    await redis.set(offerId, JSON.stringify(offer));

    console.log('offerId', offerId);

    const browser = await puppeteer.launch({
        // headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',

            //Docker
            // '--disable-dev-shm-usage',
            // '--disable-accelerated-2d-canvas',
            // '--no-first-run',
            // '--no-zygote',
            // '--single-process',
            // '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    //LOCAL
    const previewUrl = `http://localhost:5000/offer/pdf/${offerId}`;
    //Docker
    // const previewUrl = `http://localhost:3000/offer/pdf/${offerId}`;
    await page.goto(previewUrl, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
        waitForFonts: true,

    });

    await browser.close();

    return new Response(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=offer.pdf', // or "attachment" for download
        },
    });
}
