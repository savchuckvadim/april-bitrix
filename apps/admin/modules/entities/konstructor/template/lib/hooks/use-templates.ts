'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TemplateHelper } from '../api/template-helper';
import type {
    Template,
    TemplateCounterUpsert,
    TemplateCreate,
    TemplateUpdate,
} from '../../model';

const helper = new TemplateHelper();
const KEY = ['konstructor-templates'] as const;

/** Шаблоны портала со связями (по `portalId`). */
export const useTemplatesByPortal = (portalId?: number) =>
    useQuery<Template[], Error>({
        queryKey: [...KEY, 'portal', portalId],
        queryFn: () => helper.listByPortal(portalId as number),
        enabled: !!portalId,
    });

/** Один шаблон по id со связями. */
export const useTemplate = (id?: number) =>
    useQuery<Template, Error>({
        queryKey: [...KEY, id],
        queryFn: () => helper.getById(id as number),
        enabled: !!id,
    });

/** Создать шаблон. */
export const useCreateTemplate = () => {
    const qc = useQueryClient();
    return useMutation<Template, Error, TemplateCreate>({
        mutationFn: (dto) => helper.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Частично обновить шаблон по id. */
export const useUpdateTemplate = () => {
    const qc = useQueryClient();
    return useMutation<Template, Error, { id: number; dto: TemplateUpdate }>({
        mutationFn: (vars) => helper.update(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить шаблон по id. */
export const useDeleteTemplate = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Привязать поле к шаблону. */
export const useAttachTemplateField = () => {
    const qc = useQueryClient();
    return useMutation<Template, Error, { id: number; fieldId: number }>({
        mutationFn: (vars) => helper.attachField(vars.id, vars.fieldId),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Отвязать поле от шаблона. */
export const useDetachTemplateField = () => {
    const qc = useQueryClient();
    return useMutation<Template, Error, { id: number; fieldId: number }>({
        mutationFn: (vars) => helper.detachField(vars.id, vars.fieldId),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Привязать счётчик к шаблону (с pivot). */
export const useAttachTemplateCounter = () => {
    const qc = useQueryClient();
    return useMutation<
        Template,
        Error,
        { id: number; counterId: number; dto: TemplateCounterUpsert }
    >({
        mutationFn: (vars) =>
            helper.attachCounter(vars.id, vars.counterId, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Обновить pivot связи шаблон↔счётчик. */
export const useUpdateTemplateCounter = () => {
    const qc = useQueryClient();
    return useMutation<
        Template,
        Error,
        { id: number; counterId: number; dto: TemplateCounterUpsert }
    >({
        mutationFn: (vars) =>
            helper.updateCounter(vars.id, vars.counterId, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Отвязать счётчик от шаблона. */
export const useDetachTemplateCounter = () => {
    const qc = useQueryClient();
    return useMutation<Template, Error, { id: number; counterId: number }>({
        mutationFn: (vars) => helper.detachCounter(vars.id, vars.counterId),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
