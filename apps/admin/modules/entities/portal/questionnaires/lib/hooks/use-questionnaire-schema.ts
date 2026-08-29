'use client';

import { useQuery } from '@tanstack/react-query';
import { QuestionnairesHelper } from '../api/questionnaires-helper';

const helper = new QuestionnairesHelper();

/**
 * Ключ БЕЗ `portalId` намеренно: реестр одинаков для всех порталов (бэк
 * `portalId` из пути не использует), поэтому второй портал в той же сессии
 * берёт готовый ответ из кэша.
 */
export const QUESTIONNAIRE_SCHEMA_KEY = [
    'portal-questionnaire-schema',
] as const;

/**
 * Реестр допустимых значений: назначения, способы показа, типы отображения,
 * каналы, виды условий со справочниками и матрица «тип поля → контролы».
 * Из него рисуется весь редактор — админка не хардкодит ни одного кода.
 *
 * Кэш держим бессрочно: реестр меняется релизом бэка, дёргать его на каждый
 * экран незачем. Свежий реестр приезжает с перезагрузкой страницы.
 */
export const useQuestionnaireSchema = (portalId?: number) =>
    useQuery({
        queryKey: QUESTIONNAIRE_SCHEMA_KEY,
        queryFn: () => helper.getSchema(portalId as number),
        enabled: !!portalId,
        staleTime: Infinity,
        gcTime: Infinity,
    });
