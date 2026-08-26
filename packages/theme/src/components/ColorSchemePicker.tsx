'use client';

import { useState, useRef } from 'react';
import { useColorScheme } from '../hook/useColorScheme';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutsideClick } from '../hook/useOutsideClick';
import { ColorSchemes, COLOR_SCHEME_SWATCH } from '../model/color-schemes';
import { ColorScheme } from '../provider/Theme';

/** Схем 14 — ровно два ряда по 7: прямоугольник без хвоста. */
const GRID_COLUMNS = 7;

export interface ColorSchemePickerProps {
    /**
     * К какому краю кнопки прижат дропдаун: 'start' растёт вправо
     * (кнопка у левого края экрана), 'end' — влево (кнопка у правого).
     */
    align?: 'start' | 'end';
}

/**
 * Цветовая схема: точка текущего цвета, по клику — матрица всех схем.
 *
 * Два уровня намеренно: в свёрнутой панели настроек хватает одной точки —
 * «какой сейчас цвет», а вся палитра выезжает только когда её позвали.
 * Раскрытая сетка ОБЯЗАНА быть ровной матрицей: `w-max` не даёт трекам
 * схлопнуться (панель абсолютная, её контейнинг-блок шириной в кнопку — без
 * этого квадратики наезжали друг на друга), фиксированное число колонок
 * держит одинаковые ряды.
 */
export const ColorSchemePicker = ({
    align = 'start',
}: ColorSchemePickerProps) => {
    const { scheme, setScheme } = useColorScheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick(ref, () => setOpen(false));

    return (
        // flex items-center: кнопка-свотч без содержимого внутри — как
        // inline-элемент она садилась на базовую линию строки и висела ниже
        // соседней иконки темы.
        <div className="relative flex items-center" ref={ref}>
            {/* Триггер — сама точка текущего цвета: она и есть ответ на
                вопрос «какая схема сейчас», иконка палитры была лишним
                посредником. */}
            <button
                type="button"
                aria-label="Цветовая схема"
                aria-expanded={open}
                title="Цветовая схема"
                onClick={() => setOpen(!open)}
                className="block cursor-pointer rounded-md border border-border transition hover:scale-110"
                // Размер и цвет — инлайном: кнопка без иконки внутри, и
                // пропади утилита размера из сборки, свотч схлопнулся бы в
                // ноль (ровно так переключатель цвета и исчезал с экрана).
                style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    backgroundColor: COLOR_SCHEME_SWATCH[scheme],
                }}
            />

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-full z-50 mt-1 grid w-max gap-1.5 rounded-lg border border-border bg-popover p-2 shadow-lg ${
                            align === 'end' ? 'right-0' : 'left-0'
                        }`}
                        style={{
                            gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1.25rem)`,
                        }}
                    >
                        {ColorSchemes.map(value => (
                            <button
                                key={value}
                                type="button"
                                className={`cursor-pointer rounded-md border border-border transition hover:scale-110 ${
                                    scheme === value
                                        ? 'ring-2 ring-foreground ring-offset-1 ring-offset-popover'
                                        : ''
                                }`}
                                style={{
                                    width: '1.25rem',
                                    height: '1.25rem',
                                    backgroundColor: COLOR_SCHEME_SWATCH[value],
                                }}
                                title={value}
                                aria-label={`Цветовая схема ${value}`}
                                aria-pressed={scheme === value}
                                onClick={() => {
                                    setScheme(value as ColorScheme);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
