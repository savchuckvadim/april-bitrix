'use client';

import { useQuery } from '@tanstack/react-query';
import { ContractHelper } from '../api/contract-helper';
import type { Contract } from '../../model';

const helper = new ContractHelper();
const KEY = ['konstructor-contracts'] as const;

/** Весь глобальный справочник видов договоров. */
export const useContracts = () =>
    useQuery<Contract[], Error>({
        queryKey: KEY,
        queryFn: () => helper.list(),
    });

/** Один вид договора по id. */
export const useContract = (id?: number) =>
    useQuery<Contract, Error>({
        queryKey: [...KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });
