import React, { FC } from "react";

import { Infoblock } from "./components/Infoblock/Infoblock";
import { AIBlock, SIBlock } from "../type/document-infoblock-type";
import { useFetchIBlocksQuery } from "../model/InfoblockService";

export const DInfoblocks: FC = ({}) => {
  // const dispatch = useAppDispatch()
  // const infoblockState = useAppSelector(state => state.infoblock)

  // const isFetched = infoblockState.isFetched
  const { data: infoblocks, error, isLoading } = useFetchIBlocksQuery(10);

  if (isLoading) return <div>Loading...</div>;
  //   if (error) return <div>Error: {error}</div>;

  return (
    <React.Fragment>
      {infoblocks &&
        infoblocks.length &&
        infoblocks.map((infoblock: SIBlock, i: number) => {
          return (
            <Infoblock
              checked={true}
              //@ts-ignore
              iblock={infoblock}
            />
          );
        })}
    </React.Fragment>

    // <div>
    //     {infoblock.map((group: DGroup) => (
    //         <div key={group.id}>
    //             <h2>{group.title}</h2>
    //             {/* {group.infoblocks.map((infoblock : AIBlock) => (
    //                 <p key={infoblock.id}>{infoblock.name}</p>
    //             ))} */}
    //         </div>
    //     ))}
    // </div>
  );
};
