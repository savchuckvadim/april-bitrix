import { OfferPdfPage } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@workspace/ui/lib/utils';

const DroppablePage = ({ page, overId, children }: {
  page: OfferPdfPage,
  overId: string | null,
  children: React.ReactNode
}) => {
  const { setNodeRef } = useDroppable({
    id: `page-${page.id}`, // 👈 даём уникальный ID странице
  });

  const isOver = overId === `page-${page.id}`;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border border-gray-300 rounded h-[297mm] relative my-3',
        isOver && 'ring-2 ring-blue-500'
      )}
    >
      {children}
    </div>
  );
};

export default DroppablePage;
