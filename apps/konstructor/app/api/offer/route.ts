import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // важно для Vercel/Render
  });

  const page = await browser.newPage();
  const previewUrl = process.env.PDF_PREVIEW_URL || "http://localhost:5003/offer/preview?readonly=true";
  await page.goto(previewUrl, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
  });

  await browser.close();

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=offer.pdf", // or "attachment" for download
    },
  });
}
