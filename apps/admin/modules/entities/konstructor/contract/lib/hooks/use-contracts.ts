'use client';

import { useQuery } from '@tanstack/react-query';
import { ContractHelper } from '../api/contract-helper';
import type { Contract } from '../../model';
import { CONTRACTS_QUERY_KEY } from './contract-query-key';

const helper = new ContractHelper();

/** Весь глобальный справочник видов договоров. */
export const useContracts = () =>
    useQuery<Contract[], Error>({
        queryKey: CONTRACTS_QUERY_KEY,
        queryFn: () => helper.list(),
    });

/** Один вид договора по id. */
export const useContract = (id?: number) =>
    useQuery<Contract, Error>({
        queryKey: [...CONTRACTS_QUERY_KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });
