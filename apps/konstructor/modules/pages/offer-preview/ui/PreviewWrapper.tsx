import { Suspense } from 'react';
import OfferPreviewPage from './OfferPreviewPage';

export default function OfferPreviewPageWrapper() {
    return (
        <Suspense fallback={<div>Загрузка предпросмотра...</div>}>
            <OfferPreviewPage />
        </Suspense>
    );
}
