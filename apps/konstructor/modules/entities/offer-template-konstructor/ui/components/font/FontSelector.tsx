'use client';
import { useOfferTemplateKonstructor } from '../../../hook/useOfferTemplateKonstructor';
import { IOfferTemplateFont } from '@/modules/entities/offer-template/type/offer-template.type';
import { Inter, Roboto, Open_Sans, Lato, Nunito } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-roboto',
});
const openSans = Open_Sans({
    subsets: ['latin'],
    variable: '--font-open-sans',
});
const lato = Lato({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-lato',
});
const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-nunito',
});

const FONT_OPTIONS = [
    { id: 20, label: 'Geist', value: 'Geist, serif' },
    { id: 0, label: 'Geist Sans', value: 'Geist, sans-serif' },
    { id: 1, label: 'Geist Mono', value: 'GeistMono, monospace' },
    { id: 2, label: 'Inter', value: '"Inter", sans-serif' },
    { id: 3, label: 'Roboto', value: '"Roboto", sans-serif' },
    { id: 4, label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { id: 5, label: 'Lato', value: '"Lato", sans-serif' },

    { id: 6, label: 'Arial', value: '"Arial", sans-serif' },
    { id: 7, label: 'Helvetica', value: '"Helvetica", sans-serif' },
    { id: 8, label: 'Verdana', value: '"Verdana", sans-serif' },
    { id: 9, label: 'Tahoma', value: '"Tahoma", sans-serif' },
    { id: 10, label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { id: 11, label: 'Times New Roman', value: '"Times New Roman", serif' },
    { id: 12, label: 'Georgia', value: '"Georgia", serif' },
    { id: 13, label: 'Garamond', value: '"Garamond", serif' },

    { id: 14, label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { id: 15, label: 'Impact', value: '"Impact", sans-serif' },

    { id: 16, label: 'Ubuntu', value: '"Ubuntu", sans-serif' },
    { id: 17, label: 'Lora', value: '"Lora", serif' },
    { id: 18, label: 'Merriweather', value: '"Merriweather", serif' },
    { id: 19, label: 'Montserrat', value: '"Montserrat", sans-serif' },
] as IOfferTemplateFont[];

export function FontSelector({}: {}) {
    const { setCurrentFont, current } = useOfferTemplateKonstructor();
    const onChange = (id: string) => {
        const numberId = Number(id);
        const font = FONT_OPTIONS.find(font => font.id === numberId);

        font && setCurrentFont(font);
    };
    return (
        <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">
                Шрифт документа
            </label>
            <select
                className="border p-2 rounded w-full  cursor-pointer"
                value={current.font.id}
                onChange={e => {
                    onChange(e.target.value);
                }}
            >
                {FONT_OPTIONS.map(font => (
                    <option key={font.value} value={font.id}>
                        {font.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
