import { Button } from "@workspace/ui/components/button";
import { Edit, Trash2 } from "lucide-react";
import { BlockRenderer } from "./BlockRenderer";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";
import { usePdfTemplateSettings } from "@/modules/feature/offer-pdf-settings";
import { Block } from "@/app/lib/offer-style/types";
import { OfferPdfBlock } from "@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice";

const SortableBlock = ({
    block,
    index,
    isSelected,
    overId,
    isDragging,
    setEditeble,
    onDelete,
    // onEdit,
  
  
  }: {
    block: Block;
    index: number;
    isSelected: boolean;
    isDragging: boolean;
    overId: string | null,
    setEditeble: (block: OfferPdfBlock) => void;
    onDelete: (blockId: string) => void;
    // onEdit: (block: OfferPdfBlock) => void;
  }) => {
    const isOver = overId && overId === block.id;
    const { current } = usePdfTemplateSettings()
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: isDragging ? 'grabbing' : 'pointer',
      fontFamily: current.font.value
    };
  
    return (
      <div className='relative'>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            `bg-white  ${isSelected ? 'border-blue-500' : 'border-gray-200'}`,
            isDragging && 'opacity-70 transform scale-95 '
          )}
          onClick={() => setEditeble(block)}
          {...attributes}
          {...listeners}
        >
          {isOver && <div
            className={`block-item h-[200px] p-2 mb-2 
          border rounded cursor-pointer 
          opacity-50 border-blue-500 bg-blue-100`}
  
          // другие пропсы
          ></div>}
          <BlockRenderer block={block} />
  
        </div>
        <div className=" flex gap-2 mt-2 z-10 bottom-1 right-0">
          <Button size={'sm'} onClick={() => setEditeble(block)} className=" btn btn-xs bg-gray-100 "><Edit color='gray' /></Button>
          <Button size={'sm'} onClick={() => {
            debugger
            onDelete(block.id)
  
          }} className="cursor pointer btn btn-xs  bg-white-100"><Trash2 color='red' /></Button>
        </div>
      </div>
    );
  };
export default SortableBlock;  