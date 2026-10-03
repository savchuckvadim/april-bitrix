import { describe, expect, it } from 'vitest';
// Относительный путь: exports пакета темы наружу отдают только index, а
// index тянет панели переключателей с анимациями — тесту они не нужны.
import { ThemeInitScript } from '../../../packages/theme/src/components/ThemeInitScript';

type ScriptProps = { dangerouslySetInnerHTML: { __html: string } };

/**
 * Прогоняет инлайн-скрипт темы на подставных document/localStorage/window
 * и возвращает data-атрибуты, которые он поставил на <html>.
 */
const runInitScript = (
    element: ReturnType<typeof ThemeInitScript>,
    stored: Record<string, string>,
): Record<string, string> => {
    const dataset: Record<string, string> = {};
    const root = { dataset, classList: { add: () => undefined }, style: {} };
    const storage = { getItem: (key: string) => stored[key] ?? null };
    const win = { matchMedia: () => ({ matches: false }) };
    const code = (element.props as ScriptProps).dangerouslySetInnerHTML.__html;

    new Function('document', 'localStorage', 'window', code)(
        { documentElement: root },
        storage,
        win,
    );
    return dataset;
};

/**
 * «Звонки» живут без стекла: размытие фона на офисных ПК без видеоускорения
 * считает процессор и тормозит весь Битрикс. Сохранённый где-то «on»
 * (localStorage общий у приложений одного домена) не должен его вернуть.
 */
describe('скрипт темы: стекло выключено жёстко', () => {
    it('glass="off" — стекла нет, даже если сохранено «включено»', () => {
        const dataset = runInitScript(
            ThemeInitScript({ defaultTheme: 'light', glass: 'off' }),
            { 'ui-glass': 'on' },
        );

        expect(dataset.glass).toBe('off');
    });

    it('без параметра — по-прежнему решает сохранённый выбор', () => {
        const dataset = runInitScript(
            ThemeInitScript({ defaultTheme: 'light' }),
            { 'ui-glass': 'on' },
        );

        expect(dataset.glass).toBe('on');
    });
});
