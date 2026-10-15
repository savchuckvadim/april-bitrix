'use client';

import { EntityRatingChart } from '@/modules/feature/report-rating';
import { DigestSection } from '../../digest-section';
import { useDigestRatings } from '../hooks/use-digest-ratings';
import { DigestCompareCard } from './DigestCompareCard';
import { DigestRatingList } from './DigestRatingList';

/** «Рейтинг дня»: сравнение сотрудника в фокусе, top-N по ключевым метрикам, победители. */
export const DigestRatingBoard = () => {
    const ratings = useDigestRatings();

    return (
        <DigestSection
            widget="rating"
            title="Рейтинг дня"
            description="Лучшие по ключевым показателям и средние: по выборке и по всем сотрудникам портала. Клик по сотруднику в таблице — сравнение его со средними отдела и всех."
        >
            {ratings.comparison && <DigestCompareCard comparison={ratings.comparison} />}
            {!ratings.hasRating ? (
                <p className="py-3 text-sm text-muted-foreground">
                    Для рейтинга нужно хотя бы два сотрудника в выборке
                </p>
            ) : (
                <>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {ratings.boards.map(board => (
                            <DigestRatingList key={board.def.code} board={board} />
                        ))}
                    </div>
                    <EntityRatingChart title="Победители дня — сотрудники" dataset={ratings.dataset} />
                    {ratings.departmentSections && (
                        <EntityRatingChart
                            title="Победители дня — отделы"
                            dataset={ratings.dataset}
                            sections={ratings.departmentSections}
                        />
                    )}
                    {ratings.groupSections && (
                        <EntityRatingChart
                            title="Победители дня — группы"
                            dataset={ratings.dataset}
                            sections={ratings.groupSections}
                        />
                    )}
                </>
            )}
        </DigestSection>
    );
};
