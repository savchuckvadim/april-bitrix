import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Мобильное меню шапки: открыть, закрыть, само закрывается при переходе. */
export function useMobileMenu() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return {
        isOpen,
        toggle: () => setIsOpen(prev => !prev),
        close: () => setIsOpen(false),
    };
}
