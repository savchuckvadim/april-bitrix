'use client';

import { AArrowDown, AArrowUp } from 'lucide-react';
import { UIScales } from '../provider/Theme';
import { useUIScale } from '../hook/useUIScale';

/** Пошаговое управление масштабом UI: A− / текущий пресет / A+. */
export const ScaleToggler = () => {
    const { scale, setScale } = useUIScale();
    const index = UIScales.indexOf(scale);

    const step = (delta: number) => {
        const next = UIScales[index + delta];
        if (next) setScale(next);
    };

    return (
        <div className="flex items-center gap-1 text-foreground">
            <button
                onClick={() => step(-1)}
                disabled={index <= 0}
                className="cursor-pointer p-1 rounded-md hover:bg-muted transition disabled:opacity-30 disabled:cursor-default"
                title="Мельче"
            >
                <AArrowDown size={20} />
            </button>
            <button
                onClick={() => step(1)}
                disabled={index >= UIScales.length - 1}
                className="cursor-pointer p-1 rounded-md hover:bg-muted transition disabled:opacity-30 disabled:cursor-default"
                title="Крупнее"
            >
                <AArrowUp size={20} />
            </button>
        </div>
    );
};
