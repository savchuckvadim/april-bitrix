'use client';

import { useMutation } from '@tanstack/react-query';
import type { OfferLettersImportRequest } from '../../model';
import { OfferLetterHelper } from '../api/offer-letter.helper';

const helper = new OfferLetterHelper();

/** Перенос писем: результат показывается по ответу ручки, не по клику */
export const useOfferLettersImport = () =>
    useMutation({
        mutationFn: (dto: OfferLettersImportRequest) => helper.importLegacy(dto),
    });
