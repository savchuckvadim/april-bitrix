'use client'
import { usePdfTemplateSettings } from '@/modules/feature/offer-pdf-settings/hook/usePdfTemplateSettings';
import { OfferPdfPage } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@workspace/ui/lib/utils';

const DroppablePage = ({ page, overId, children }: {
  page: OfferPdfPage,
  overId: string | null,
  children: React.ReactNode
}) => {
  const { setNodeRef,  } = useDroppable({
    id: `page-${page.id}`, // 👈 даём уникальный ID странице
    data: {
      pageId: page.id,
    }
  });
  const { getPageBlockById } = usePdfTemplateSettings();
  const isOverBlockInThisPage = getPageBlockById(page.id, overId ?? '') ? true : false;

  const isOverPage = overId === `page-${page.id}`;
  const isOver = isOverPage || isOverBlockInThisPage;


  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border border-gray-300 rounded h-[297mm] relative my-3',
        isOver && 'ring-2 ring-blue-500'
      )}
    >
      {children}
      {/* Placeholder для вставки в конец страницы */}
      <div
        className={`insert-placeholder mt-2 ${isOverPage ? 'border-2 border-dashed border-blue-500 bg-blue-100' : ''
          }`}
        style={{ height: 200, transition: 'background-color 0.3s' }}
      >
        {/* Пустое пространство для дропа в конец страницы */}
      </div>
    </div>
  );
};

export default DroppablePage;
