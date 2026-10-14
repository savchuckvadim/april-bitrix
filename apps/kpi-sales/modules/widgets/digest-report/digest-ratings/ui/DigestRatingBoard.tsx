'use client';

import { SectionCard } from '@workspace/april-ui';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import { useDigestRatings } from '../hooks/use-digest-ratings';
import { DigestCompareCard } from './DigestCompareCard';
import { DigestRatingList } from './DigestRatingList';

/** «Рейтинг дня»: top-N по ключевым метрикам, график победителей, сравнение. */
export const DigestRatingBoard = () => {
    const ratings = useDigestRatings();

    return (
        <div className="space-y-4">
            {ratings.comparison && <DigestCompareCard comparison={ratings.comparison} />}
            {ratings.hasRating && (
                <SectionCard
                    surface="glass"
                    title="Рейтинг дня"
                    description="Лучшие по ключевым показателям и средние: по выборке и по всем сотрудникам портала"
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {ratings.boards.map(board => (
                            <DigestRatingList key={board.def.code} board={board} />
                        ))}
                    </div>
                    <EntityRatingChart
                        title="Победители дня — сотрудники"
                        dataset={ratings.dataset}
                    />
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
                </SectionCard>
            )}
        </div>
    );
};
