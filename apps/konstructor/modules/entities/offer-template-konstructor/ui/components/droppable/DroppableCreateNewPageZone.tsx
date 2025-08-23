import { useDroppable } from "@dnd-kit/core";
import React from "react";

export const DroppableCreateNewPageZone = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "new-page-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        h-40 border-dashed border-2 
        border-gray-400 text-center 
        text-sm text-gray-500 flex 
        items-center justify-center ${isOver ? "border-blue-500 bg-blue-100" : ""}`}
    >
      Отпустите сюда, чтобы создать новую страницу
    </div>
  );
};
export default DroppableCreateNewPageZone;
