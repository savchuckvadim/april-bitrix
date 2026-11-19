'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { OFFER_LETTER_PAGE_TEXT as TEXT } from '../../consts/offer-letter.consts';
import { OfferLettersImport } from '../offer-letters-import/OfferLettersImport';
import { OfferLettersPanel } from '../offer-letters-panel/OfferLettersPanel';

const TAB_LETTERS = 'letters';
const TAB_IMPORT = 'import';

/**
 * Письма КП: управление письмами портала и менеджеров и временный перенос
 * писем из старых шаблонов (письма на проде пока не перенесены).
 */
export function OfferLettersPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{TEXT.title}</h1>

            <Tabs defaultValue={TAB_LETTERS}>
                <TabsList>
                    <TabsTrigger value={TAB_LETTERS}>{TEXT.tabLetters}</TabsTrigger>
                    <TabsTrigger value={TAB_IMPORT}>{TEXT.tabImport}</TabsTrigger>
                </TabsList>
                <TabsContent value={TAB_LETTERS}>
                    <OfferLettersPanel />
                </TabsContent>
                <TabsContent value={TAB_IMPORT}>
                    <OfferLettersImport />
                </TabsContent>
            </Tabs>
        </div>
    );
}
