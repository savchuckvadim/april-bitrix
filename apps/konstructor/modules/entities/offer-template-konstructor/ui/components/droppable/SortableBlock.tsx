import { Button } from "@workspace/ui/components/button";
import { Edit, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";
import { IOfferTemplateBlock } from "@/modules/entities/offer-template-block";
import { useOfferTemplateKonstructor } from "../../../hook/useOfferTemplateKonstructor";
import { BlockRenderer } from "../block-render/BlockRenderer";
import { isChanging } from "../../../lib/render-lib/render.util";

interface PositionableBlock {
  position?: "absolute" | "relative";
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

// Utility function to get positioning styles for blocks
const getPositionStyles = (block: IOfferTemplateBlock) => {
  if ("position" in block && block.position === "absolute") {
    const positionClasses = [];

    if ("top" in block && typeof block.top === "number")
      positionClasses.push(`top-${block.top}`);
    if ("left" in block && typeof block.left === "number")
      positionClasses.push(`left-${block.left}`);
    if ("right" in block && typeof block.right === "number")
      positionClasses.push(`right-${block.right}`);
    if ("bottom" in block && typeof block.bottom === "number")
      positionClasses.push(`bottom-${block.bottom}`);

    return {
      position: block.position,
      className: positionClasses.length ? positionClasses.join(" ") : "",
    };
  }

  return {
    position: "relative" as const,
    className: "",
  };
};

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
  block: IOfferTemplateBlock;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  overId: string | null;
  setEditeble: (block: IOfferTemplateBlock) => void;
  onDelete: (blockId: string) => void;
  // onEdit: (block: OfferPdfBlock) => void;
}) => {
  // const isOver = overId && overId === block.id;
  const { current } = useOfferTemplateKonstructor();
  const { isOver, attributes, listeners, transform, transition, setNodeRef } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "pointer",
    fontFamily: current.font.value,
  };

  return (
    // <div className='relative'>
    <div
      className={`w-full ${getPositionStyles(block).position === "absolute" ? `absolute ${getPositionStyles(block).className}` : ""}`}
      style={{
        height: `${block.height}mm`,
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          `bg-white  ${isSelected ? "border-blue-500" : "border-gray-200"}`,
          isDragging && "opacity-70 transform scale-95 ",
        )}
        onClick={() => setEditeble(block)}
        {...attributes}
        {...listeners}
      >
        {/* {isOver && <div
            className={`block-item h-[200px] p-2 mb-2 
          border rounded cursor-pointer 
          opacity-50 border-blue-500 bg-blue-100`}
  
          // другие пропсы
          ></div>} */}

        <BlockRenderer block={block} />
      </div>
      <div className=" flex gap-2 mt-2 z-10 bottom-1 right-0">
        {isChanging(block) && (
          <Button
            size={"sm"}
            onClick={() => setEditeble(block)}
            className=" btn btn-xs bg-gray-100 "
          >
            <Edit color="gray" />
          </Button>
        )}
        <Button
          size={"sm"}
          onClick={() => {
            onDelete(block.id);
          }}
          className="cursor pointer btn btn-xs  bg-white-100"
        >
          <Trash2 color="red" />
        </Button>
      </div>
    </div>
  );
};
export default SortableBlock;
