// import { getRandomColor } from '@/utils/reducers-utils/report/report-utils';
// import React, { FC, useEffect, useRef } from 'react';
// import { Button, Tooltip } from 'reactstrap';
// import { useState } from 'react';
// import { Filter, FilterInnerCode } from '@/types/report/report-type';
// import { useAppDispatch } from '@/hooks/redux';
// import { setCurrentActions } from '@/redux/reducers/report/report-thunk';
// import './ReportFilterBadge.scss'
// interface ReportFilterBadge {
//     action: Filter
//     isCurrent: boolean;
//     index: number;
// }
// const ReportFilterBadge: FC<ReportFilterBadge> = ({
//     action,
//     isCurrent,
//     index
// }) => {
//     const backgroundColorActive = getRandomColor(index)
//     const backgroundColorNoactive = 'rgb(238, 242, 244)'
//     const color = !isCurrent ? 'black' : 'rgb(37, 40, 45)'
//     const backgroundColor = isCurrent ? backgroundColorActive : backgroundColorNoactive

//     const [tooltipOpen, setTooltipOpen] = useState(false);
//     const buttonRef = useRef(null); // Ссылка на кнопку

//     useEffect(() => {
//         if (buttonRef.current) {
//             setTooltipOpen(false); // Убеждаемся, что Tooltip не открывается раньше времени
//         }
//     }, []);

//     const dispatch = useAppDispatch()
//     const actionsChange = (
//         e: React.MouseEvent<HTMLButtonElement, MouseEvent>, actionId: FilterInnerCode) => {
//         e.preventDefault()
//         dispatch(setCurrentActions(actionId))

//     }

//     return (
//         <>
//             <Button
//                 innerRef={buttonRef} // Привязываем ссылку
//                 id={`tooltip-${action.innerCode}`} // ID для тултипа
//                 style={{
//                     backgroundColor,
//                     color,
//                     maxWidth: `190px`, // Ограничение ширины
//                     overflow: "hidden",
//                     whiteSpace: "nowrap",
//                     textOverflow: "ellipsis",
//                 }}
//                 size="sm"
//                 className="badge-filter-action-item text-truncate"
//                 value={action.innerCode}
//                 onClick={(e) => actionsChange(e, action.innerCode)}
//             >
//                 <p
//                     className="text-truncate badge-action-text mb-0"
//                     style={{
//                         color,

//                         maxWidth: "170px",
//                     }}
//                 >
//                     {action.name}
//                 </p>

//                 <div className='badge-icon-wrapper'>
//                     {!isCurrent ? (
//                         <svg
//                             className="lucide lucide-circle-check"
//                             xmlns="http://www.w3.org/2000/svg"
//                             width="24"
//                             height="24"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke={"black"}
//                             strokeWidth="1"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         >
//                             <circle cx="12" cy="12" r="10" />
//                             <path d="m9 12 2 2 4-4" stroke="black" />
//                         </svg>
//                     ) : (
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             width="24"
//                             height="24"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="black"
//                             strokeWidth="1"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             className="lucide lucide-circle-x"
//                         >
//                             <circle cx="12" cy="12" r="10" />
//                             <path d="m15 9-6 6" />
//                             <path d="m9 9 6 6" />
//                         </svg>

//                     )} </div>
//             </Button>

//             {/* Tooltip */}
//             <Tooltip
//                 placement="top"
//                 isOpen={tooltipOpen}
//                 target={`tooltip-${action.innerCode}`}
//                 toggle={() => setTooltipOpen(!tooltipOpen)}
//             >
//                 {action.name}
//             </Tooltip>
//         </>
//     );
// }

// export default ReportFilterBadge;
