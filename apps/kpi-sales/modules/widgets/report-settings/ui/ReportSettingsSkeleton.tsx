import { MicroSkeleton } from '@workspace/april-ui/feedback';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

const SECTION_ROWS = [4, 1, 5] as const;

/** Скелет страницы, пока настройки портала грузятся: три секции с рядами переключателей. */
export const ReportSettingsSkeleton = () => (
    <div aria-busy aria-label={REPORT_SETTINGS_TEXT.loading} className="space-y-4">
        {SECTION_ROWS.map((rows, section) => (
            <div key={section} className="space-y-3 rounded-xl border p-4">
                <MicroSkeleton className="h-4 w-40" />
                {Array.from({ length: rows }, (_, row) => (
                    <MicroSkeleton key={row} className="h-5 w-64 max-w-full" />
                ))}
            </div>
        ))}
    </div>
);
