import { useAppDispatch, useAppSelector } from "@/modules/app";
import { RootState } from "@/modules/app/model/store";
import {
  setEditeble,
  deleteEditeble,
  editBlock,
  changeLetterBlock,
} from "../model/OfferTemplateBlockSlice";
import { IOfferTemplateBlock } from "../type/offer-template-block.type";

export const useOfferTemplateBlock = () => {
  const dispatch = useAppDispatch();
  const editeble = useAppSelector(
    (state: RootState) => state.offerTemplateBlock.editeble,
  );
  const defaultBlocks = useAppSelector(
    (state) => state.offerTemplateBlock.default,
  );

  const setEditebleBlock = (block: IOfferTemplateBlock) =>
    dispatch(setEditeble(block));
  const deleteEditebleBlock = () => dispatch(deleteEditeble());
  const updateBlock = (block: IOfferTemplateBlock) =>
    dispatch(editBlock(block));
  const changeLetter = (text: string, height: number) => {
    dispatch(changeLetterBlock({ text, height }));
  };
  return {
    blocks: defaultBlocks,
    editeble,
    setEditebleBlock,
    updateBlock,
    deleteEditebleBlock,
    changeLetter,
  };
};
