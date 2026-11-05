'use client';

import { AButton } from '@workspace/april-ui';

interface AiPagerProps {
    page: number;
    pageSize: number;
    total: number;
    /** Идёт загрузка страницы — кнопки ждут. */
    loading: boolean;
    onChange: (page: number) => void;
}

/** Переключатель страниц списка AI-записей: назад, вперёд и «страница N из M». */
export function AiPager({ page, pageSize, total, loading, onChange }: AiPagerProps) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return (
        <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="w-28">
                <AButton
                    title="← Назад"
                    size="small"
                    isActive={!loading && page > 1}
                    clickHendler={() => onChange(page - 1)}
                />
            </div>
            <span className="text-muted-foreground">
                Страница {page} из {pages} · всего {total.toLocaleString('ru-RU')}
                {loading ? ' · загружаем…' : ''}
            </span>
            <div className="w-28">
                <AButton
                    title="Вперёд →"
                    size="small"
                    isActive={!loading && page < pages}
                    clickHendler={() => onChange(page + 1)}
                />
            </div>
        </div>
    );
}
