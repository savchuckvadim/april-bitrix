'use client';

import { motion } from 'framer-motion';
import { getAppUrl } from '@/modules/app/lib/utills/url';

/**
 * Экран загрузки приложения.
 *
 * Логотип — обычный `<img>` по той же причине, что и заставки очереди:
 * под basePath `/sales` во фрейме портала оптимизатор `next/image`
 * не доезжает, и картинка просто не появляется. Путь собирает `getAppUrl`.
 */
export function PageLoader({ visible }: { visible: boolean }) {
    if (!visible) return null;

    return (
        <motion.div
            className="loading-screen bg-primary"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="center-spinner color-primary flex flex-col items-center justify-center">
                <div className="rounded-xl bg-white p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element -- см. коммент выше */}
                    <img
                        src={getAppUrl('/logo.svg')}
                        alt="April"
                        width={120}
                        height={85}
                    />
                </div>
            </div>

            {/* Шторки разъезжаются вверх и вниз, открывая приложение. */}
            <motion.div
                className="reveal-top bg-white"
                initial={{ y: 0 }}
                animate={{ y: '-100%' }}
                exit={{ y: '-100%' }}
                transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
            />
            <motion.div
                className="reveal-bottom bg-white"
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.8, delay: 1, ease: 'easeInOut' }}
            />
        </motion.div>
    );
}
