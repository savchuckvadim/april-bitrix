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
    // { id: 0, label: 'Geist Sans', value: 'Geist, sans-serif' }, //
    { id: 1, label: 'Geist Mono', value: 'GeistMono, monospace' },
    { id: 2, label: 'Inter', value: '"Inter", sans-serif' },
    { id: 3, label: 'Roboto', value: '"Roboto", sans-serif' },
    { id: 4, label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { id: 5, label: 'Lato', value: '"Lato", sans-serif' },

    { id: 6, label: 'Oswald', value: '"Oswald", sans-serif' },
    { id: 7, label: 'Zalando Sans SemiExpanded', value: '"Zalando Sans SemiExpanded", sans-serif' },
    { id: 8, label: 'Barlow', value: '"Barlow", sans-serif' },
    { id: 9, label: 'Outfit', value: '"Outfit", sans-serif' },
    { id: 10, label: 'Libre Baskerville', value: '"Libre Baskerville", sans-serif' }, //
    { id: 11, label: 'Archivo Black', value: '"Archivo Black", serif' }, //
    { id: 12, label: 'Dancing Script', value: '"Dancing Script", serif' }, //
    { id: 13, label: 'EB Garamond', value: '"EB Garamond", serif' },

    { id: 14, label: 'Share Tech', value: '"Share Tech", cursive' }, //
    { id: 15, label: 'Bungee', value: '"Bungee", sans-serif' }, //

    { id: 16, label: 'Ubuntu', value: '"Ubuntu", sans-serif' },
    { id: 17, label: 'Lora', value: '"Lora", serif' },
    { id: 18, label: 'Merriweather', value: '"Merriweather", serif' },
    { id: 19, label: 'Montserrat', value: '"Montserrat", sans-serif' },
    { id: 20, label: 'Pacifico', value: '"Pacifico", cursive' },
    { id: 21, label: 'Noto Sans Marchen', value: '"Noto Sans Marchen", sans-serif' }, //
    { id: 22, label: 'Tirra', value: '"Tirra", sans-serif' },
    { id: 23, label: 'Story Script', value: '"Story Script", sans-serif' },
    { id: 24, label: 'DM Serif Display', value: '"DM Serif Display", serif' },
    //
    //
    //Bitcount Grid Double Ink
    { id: 25, label: 'Bitcount Grid Double Ink', value: '"Bitcount Grid Double Ink", sans-serif' },
    { id: 26, label: 'TASA Explorer', value: '"TASA Explorer", sans-serif' },
    { id: 27, label: 'Caveat', value: '"Caveat", cursive' },
    { id: 28, label: 'Michroma', value: '"Michroma", sans-serif' },
    { id: 29, label: 'Changa One', value: '"Changa One", cursive' },
    { id: 30, label: 'Bungee Spice', value: '"Bungee Spice", cursive' },
    { id: 31, label: 'Permanent Marker', value: '"Permanent Marker", cursive' },
    { id: 32, label: 'Be Vietnam Pro', value: '"Be Vietnam Pro", sans-serif' },
    { id: 33, label: 'Indie Flower', value: '"Indie Flower", cursive' },
    { id: 34, label: 'Orbitron', value: '"Orbitron", sans-serif' },
    { id: 35, label: 'Rowdies', value: '"Rowdies", sans-serif' },
    { id: 36, label: 'Signika Negative', value: '"Signika Negative", sans-serif' },
    { id: 37, label: 'Righteous', value: '"Righteous", sans-serif' },
    { id: 38, label: 'Sanchez', value: '"Sanchez", sans-serif' },


    //Noto Emoji
    { id: 39, label: 'Noto Emoji', value: '"Noto Emoji"' },

    { id: 40, label: 'Noto Color Emoji', value: '"Noto Color Emoji", sans-serif' },
    { id: 41, label: 'Noto Sans Ogham', value: '"Noto Sans Ogham", sans-serif' },
    { id: 42, label: 'Noto Sans Nüshu', value: '"Noto Sans Nüshu", sans-serif' },
    { id: 43, label: 'Noto Sans Phoenician', value: '"Noto Sans Phoenician", sans-serif' },
    { id: 44, label: 'Noto Sans Tirhuta', value: '"Noto Sans Tirhuta", sans-serif' },
    { id: 45, label: 'Noto Sans Ugaritic', value: '"Noto Sans Ugaritic", sans-serif' },
    { id: 46, label: 'Noto Sans Mahajani', value: '"Noto Sans Mahajani", sans-serif' },
    { id: 47, label: 'Noto Sans Lydian', value: '"Noto Sans Lydian", sans-serif' },

] as IOfferTemplateFont[];

export function FontSelector({ }: {}) {
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
                value={current?.font.id}
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
