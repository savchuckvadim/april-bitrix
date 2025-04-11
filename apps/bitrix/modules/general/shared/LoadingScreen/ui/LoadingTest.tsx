'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingTest() {
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        const onLoad = () => setIsDone(true);

        if (document.readyState === 'complete') {
            setIsDone(true);
        } else {
            window.addEventListener('load', onLoad);
        }

        return () => window.removeEventListener('load', onLoad);
    }, []);


    return (
        <AnimatePresence>
            {!isDone && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
                >
                    <div className="text-xl font-bold">Загрузка…</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
