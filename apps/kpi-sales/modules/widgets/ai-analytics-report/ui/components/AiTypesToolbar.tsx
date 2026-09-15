'use client';

import { MicroSegmented } from '@workspace/april-ui';
import { useAiTypesDrawer } from '../../hooks/use-ai-types-drawer';

/** Панель drawer: подвкладки «Все» + типы + «Возражения» и раскладка wide | long. */
export const AiTypesToolbar = () => {
    const { options, selected, select, layout, layoutOptions, setLayout } =
        useAiTypesDrawer();
    const isObjections = selected === 'objections';

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <MicroSegmented
                ariaLabel="Тип звонка"
                size="xs"
                options={options}
                value={selected}
                onChange={select}
            />
            {!isObjections && (
                <MicroSegmented
                    ariaLabel="Раскладка"
                    size="xs"
                    options={layoutOptions}
                    value={layout}
                    onChange={setLayout}
                />
            )}
        </div>
    );
};
