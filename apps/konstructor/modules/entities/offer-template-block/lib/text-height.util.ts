const stripTags = (text: string) =>
  text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\\n/g, "\n");

export const estimateHeightMm = (text: string): number => {
  const plainText = stripTags(text);
  const avgCharsPerLine = 90; // эмпирически из Tailwind-шрифта, ширины блока и т.д.
  const lineHeightMm = 5; // средняя высота строки в мм
  const lines = plainText
    .split("\n")
    .map((line) => Math.ceil(line.length / avgCharsPerLine));
  const totalLines = lines.reduce((a, b) => a + b, 0);
  return Math.ceil((totalLines * lineHeightMm + 6) * 100) / 100; // +6 мм на паддинг и заголовки
};
