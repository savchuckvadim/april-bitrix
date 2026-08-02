'use client';

import { useCallback, useMemo, useState } from 'react';
import { downloadText } from '../lib/download-text.util';
import { buildRegulation } from '../copy/build-regulation';
import type {
    ProcessConfig,
    ProcessDefinition,
    ProcessModel,
    ProcessPreset,
} from '../types';

const FILE_NAME = 'reglament-otdela-prodazh.txt';
const FLASH_MS = 4000;

interface UseRegulationInput {
    definition: ProcessDefinition;
    model: ProcessModel;
    config: ProcessConfig;
    preset: ProcessPreset | null;
}

/**
 * Готовый текст регламента и действия над ним.
 *
 * Дату берём в момент нажатия, а не при рендере: иначе серверная и клиентская
 * разметка разъедутся на гидратации.
 */
export const useRegulation = ({
    definition,
    model,
    config,
    preset,
}: UseRegulationInput) => {
    const [company, setCompany] = useState('');
    const [status, setStatus] = useState('');

    const build = useCallback(
        (date: string) =>
            buildRegulation({
                definition,
                model,
                config,
                preset,
                date,
                company,
            }),
        [definition, model, config, preset, company],
    );

    /** Превью показываем без даты — она подставится при выгрузке. */
    const preview = useMemo(() => build('—'), [build]);

    const flash = useCallback((message: string) => {
        setStatus(message);
        setTimeout(() => setStatus(''), FLASH_MS);
    }, []);

    const today = () => new Date().toLocaleDateString('ru-RU');

    const download = useCallback(() => {
        downloadText(FILE_NAME, build(today()));
        flash('Файл сохранён — пришлите его нам.');
    }, [build, flash]);

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(build(today()));
            flash('Регламент скопирован.');
        } catch {
            flash('Буфер обмена недоступен — используйте скачивание.');
        }
    }, [build, flash]);

    const print = useCallback(() => window.print(), []);

    return { company, setCompany, preview, status, download, copy, print };
};
