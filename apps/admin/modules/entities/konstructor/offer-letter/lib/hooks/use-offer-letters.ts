'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OFFER_LETTERS_CACHE_KEY } from '../../consts/offer-letter.consts';
import type { OfferLetterCreate, OfferLetterUpdate } from '../../model';
import { OfferLetterHelper } from '../api/offer-letter.helper';

const helper = new OfferLetterHelper();

/** Письма портала: письма самого портала и личные письма менеджеров */
export const useOfferLetters = (portalId?: number) =>
    useQuery({
        queryKey: [OFFER_LETTERS_CACHE_KEY, portalId],
        queryFn: () => helper.list(portalId as number),
        enabled: Boolean(portalId),
    });

/**
 * Любая запись меняет флаги «по умолчанию» у соседних писем: бэк сам
 * переназначает письмо по умолчанию, поэтому после записи список читается заново.
 */
const useInvalidateLetters = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: [OFFER_LETTERS_CACHE_KEY] });
};

export const useCreateOfferLetter = () => {
    const invalidate = useInvalidateLetters();
    return useMutation({
        mutationFn: (dto: OfferLetterCreate) => helper.create(dto),
        onSuccess: invalidate,
    });
};

export const useUpdateOfferLetter = () => {
    const invalidate = useInvalidateLetters();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: OfferLetterUpdate }) =>
            helper.update(id, dto),
        onSuccess: invalidate,
    });
};

export const useSetDefaultOfferLetter = () => {
    const invalidate = useInvalidateLetters();
    return useMutation({
        mutationFn: (id: string) => helper.setDefault(id),
        onSuccess: invalidate,
    });
};

export const useDeleteOfferLetter = () => {
    const invalidate = useInvalidateLetters();
    return useMutation({
        mutationFn: (id: string) => helper.remove(id),
        onSuccess: invalidate,
    });
};
