import type { OfferPdfPaletteInfo, OfferPdfTemplateInfo } from '../model/types';

/** Гаммы стиля; у стиля без гамм и до выкладки бэка 16.11 — пусто */
export const templatePalettes = (template: OfferPdfTemplateInfo | null | undefined): OfferPdfPaletteInfo[] =>
    template?.palettes ?? [];

/**
 * Гамма, которую можно отправить для стиля: выбранная, если она у стиля
 * есть, иначе первая; у стиля без гамм — null.
 */
export const resolvePalette = (
    template: OfferPdfTemplateInfo | null | undefined,
    palette: string | null,
): string | null => {
    const palettes = templatePalettes(template);
    if (!palettes.length) return null;
    return palettes.some(item => item.code === palette) ? palette : (palettes[0]?.code ?? null);
};

/** «Искра · Оранжевая» — выбранный стиль одной строкой (в свёрнутой карточке) */
export const offerPdfStyleSummary = (
    template: OfferPdfTemplateInfo | null | undefined,
    palette: string | null,
): string | null => {
    if (!template) return null;
    const paletteName = templatePalettes(template).find(item => item.code === palette)?.name;
    return paletteName ? `${template.name} · ${paletteName}` : template.name;
};
