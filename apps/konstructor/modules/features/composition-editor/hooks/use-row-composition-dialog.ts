'use client';

import { useState } from 'react';

/** Окно наполнения товара: открыто/закрыто — состояние карточки, не стора. */
export const useRowCompositionDialog = () => {
    const [open, setOpen] = useState(false);

    return { open, setOpen, openDialog: () => setOpen(true) };
};
